const fs = require('fs');
const path = require('path');
const dbSet = require('./dbSet');
const db = require('../../plugins/mysql');
const sendMailer = require('../../plugins/sendMailer');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const moment = require('../../../util/moment');

const axios = require('axios');

function getCurrentDateYYYYMMDD() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    var formattedDate = year + month + day;
    return formattedDate;
}
function getCurrentDateTimeYYYYMMDDHHMMSS() {
    var currentDate = new Date();
    var year = currentDate.getFullYear();
    var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    var day = currentDate.getDate().toString().padStart(2, '0');
    var hours = currentDate.getHours().toString().padStart(2, '0');
    var minutes = currentDate.getMinutes().toString().padStart(2, '0');
    var seconds = currentDate.getSeconds().toString().padStart(2, '0');
    
    var formattedDateTime = year + month + day + hours + minutes + seconds;
    return formattedDateTime;
}

const kpiModel = {
    async load() {
        // console.log("kpisend",  getCurrentDateTimeYYYYMMDDHHMMSS());
        //this.kpisend();
    },
    async kpisend() {
        const config = {
            headers: {
              'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
            },
          };
        const jsonData = {
            "KPILEVEL1": [
                {
                  "kpiCertKey": "3a25-02d0-a194-4a6f",
                  "ocrDttm": getCurrentDateYYYYMMDD(),
                  "systmOprYn": "Y",
                  "trsDttm": getCurrentDateTimeYYYYMMDDHHMMSS()
                }
              ]            
          };

        const kpiData = JSON.stringify(jsonData, null, 2);
        console.log("시작");
        axios.post('http://ssf-kpi.kr:8080/kpiLv1/kpiLv1InsertTst', kpiData, config)
            .then(response => {
            console.log('JSON sent successfully:', response.data);
            })
            .catch(error => {
            console.error('Error sending JSON:', error.message);
            });
        console.log("끝");
    },


    async sendKpi1(req) {
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
        },
      };

      const payload = {...req.body}
      delete payload.t_no;
      payload.trsDttm = getCurrentDateTimeYYYYMMDDHHMMSS();

      const jsonData = {
            "KPILEVEL1": [
                {
                  "kpiCertKey": payload.kpiCertKey,
                  "ocrDttm": payload.ocrDttm,
                  "systmOprYn": payload.systmOprYn,
                  "trsDttm": payload.trsDttm
                }
              ]            
          };
      const kpiData = JSON.stringify(jsonData, null, 2);            
      const rv = await axios.post('http://ssf-kpi.kr:8080/kpiLv1/kpiLv1InsertTst', kpiData, config)
          .then(response => {
          // console.log('JSON sent successfully:', response.data);
          payload.f_err = 'N';
          return response.data;
          })
          .catch(error => {
            payload.f_err = 'Y';
            return error.message;
          // console.error('Error sending JSON:', error.message);
          });
      payload.t_req = kpiData;
      payload.t_res = rv;
      
      const sql = sqlHelper.Insert(TABLE.KPI1, payload);
      const [row] = await db.execute(sql.query, sql.values);
      await db.execute('COMMIT');
      return payload;
    },

    async loadKpi1(req) {
      const config = {
        headers: {
          'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
        },
      };
      //"ocrDttm": getCurrentDateYYYYMMDD(),
      const jsonData = {
                "schKpiCertKey": "3a25-02d0-a194-4a6f",
                "schOcrDttm": getCurrentDateYYYYMMDD(),
        };
      
      const kpiData = JSON.stringify(jsonData, null, 2);
      const rv = await axios.post('http://ssf-kpi.kr:8080/kpiLv1/kpiLv1List', kpiData,config)
          .then(response => {
          console.log('JSON sent successfully:', response.data);
          return response.data;
          })
          .catch(error => {
          console.error('Error sending JSON:', error.message);
          });
      console.log("조회끝");
      return  rv;
    },
    async getKpi1(req) {      
      const { c_com } = req.user;
      const { s_ym, f_tst } = req.body;
      let query = `SELECT * \n` +
                  `  FROM (SELECT DATE_FORMAT(day, '%Y-%m-%d') s_day, DATE_FORMAT(day, '%Y%m%d') s_date \n` +
                  `          FROM (SELECT CONCAT(?, LPAD(ROWNUM, 2, '0')) day \n` +
                  `                  FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM FROM  tb_comcode T, (SELECT @ROWNUM := 0 ) TMP) SUB \n` +
                  `                 WHERE ROWNUM < 32) a \n` +
                  `          WHERE DATE(day) = day ) A \n` +
                  `        LEFT OUTER JOIN (SELECT c_com, ocrDttm, COUNT(*) m_cnt, SUM(IF(f_err = 'N', 1, 0)) m_ok, SUM(IF(f_err = 'N', 0, 1)) m_no \n` +
                  `                           FROM tb_kpilevel1 \n` +
                  `                          WHERE c_com = ? AND f_tst = ? \n` +
                  `                          GROUP BY c_com, ocrDttm) b on s_date = b.ocrDttm \n` +
                  ` ORDER BY s_day `;
      var values = new Array();
      values.push(s_ym); 
      values.push(c_com);       
      values.push(f_tst); 

      console.log(query, values);
      const [rows] = await db.execute(query, values);
      return rows;
    },
    async getKpi1dt(req) {      
      const { c_com } = req.user;
      const { s_ym, f_tst } = req.body;
      let query = `SELECT * FROM tb_kpilevel1 WHERE c_com = ? AND f_tst = ? AND ocrDttm like ? ORDER BY ocrDttm, t_no` ;
      var values = new Array();
      values.push(c_com); 
      values.push(f_tst); 
      values.push(s_ym + '%');   
      console.log(query, values);
      const [rows] = await db.execute(query, values);
      return rows;
    },

}

module.exports = kpiModel;
const fs = require('fs');
const path = require('path');
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
function getCurrentDateHHMM() {
  var currentDate = new Date();  
  var hours = currentDate.getHours().toString().padStart(2, '0');
  var minutes = currentDate.getMinutes().toString().padStart(2, '0');    
  var formattedDateTime = hours + minutes;
  return formattedDateTime;
}
function getCurrentDateHHMM2() {
  var currentDate = new Date();  
  var hours = currentDate.getHours().toString().padStart(2, '0');
  var minutes = currentDate.getMinutes().toString().padStart(2, '0');    
  var formattedDateTime =  `${hours}:${minutes}`;
  return formattedDateTime;
}
function getTwentyAgo2() {
  // 현재 시간을 가져옵니다.
  const currentTime = new Date();
  // 20분을 빼줍니다.
  const twentyMinutesAgo = new Date(currentTime.getTime() - 20 * 60 * 1000);

  var hours = twentyMinutesAgo.getHours().toString().padStart(2, '0');
  var minutes = twentyMinutesAgo.getMinutes().toString().padStart(2, '0');    
  var formattedDateTime =  `${hours}:${minutes}`;
  return formattedDateTime;
}
function getCurrentDateTimeYYYYMMDDHHMM() {
  var currentDate = new Date();
  var year = currentDate.getFullYear();
  var month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
  var day = currentDate.getDate().toString().padStart(2, '0');
  var hours = currentDate.getHours().toString().padStart(2, '0');
  var minutes = currentDate.getMinutes().toString().padStart(2, '0');
    
  var formattedDateTime = year + month + day + hours + minutes;
  return formattedDateTime;
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

  async kpichk(req) {
    const config = {headers: {'Content-Type': 'application/json; charset=utf-8'} }; // Content-Type을 설정하고 UTF-8로 지정합니다.
    const payload = {...req.body}
    const jsonData = { "schKpiCertKey": payload.i_kpikey };
    const kpiData = JSON.stringify(jsonData, null, 2);
    const rv = await axios.post('http://ssf-kpi.kr:8080/kpiLv1/certCheck', kpiData, config) .then(response => {return response.data;})  .catch(error => {return error.message;});
    return rv.length > 0 ?  rv[0].coNm : '';
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
    payload.t_no = Date.now(); 
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

    async getWorksite(req) {
      const query = `SELECT c_com, n_com, i_company, i_kpikey, f_kpichk, n_kpiconm FROM tb_worksite ORDER BY n_com` ;
      const [rows] = await db.execute(query);
      return rows;
    },

    async getResKpi(req) {      
      const { c_com, s_ym, f_tst } = req.body;
      let query = `SELECT k1.c_com, a.s_day, a.s_date, DAYOFWEEK(a.s_day) f_week,\n` +
                  `       k1.s_k1time, k1.m_k1sent, \n` +
                  `       k2.s_k2time, k2.m_k2sent, \n` +
                  `       k3.s_k3time, k3.m_k3sent \n` +                    
                  `  FROM (SELECT DATE_FORMAT(day, '%Y-%m-%d') s_day, DATE_FORMAT(day, '%Y%m%d') s_date \n` +
                  `          FROM (SELECT CONCAT(?, LPAD(ROWNUM, 2, '0')) day \n` +
                  `                  FROM (SELECT @ROWNUM := @ROWNUM + 1 AS ROWNUM FROM tb_comcode T, (SELECT @ROWNUM := 0 ) TMP) SUB \n` +
                  `                 WHERE  ROWNUM < 32 ) a \n` +
                  `         WHERE DATE(day) = day) a \n` +
                  `       LEFT OUTER JOIN (SELECT c_com, ocrDttm, MAX(s_restime) s_k1time, SUM(CASE WHEN f_err IN ('Y', 'N') THEN 1 ELSE 0 END) m_k1sent FROM tb_kpilevel1 WHERE c_com = ? GROUP BY c_com, ocrDttm) k1 ON a.s_date = k1.ocrDttm \n` +
                  `       LEFT OUTER JOIN (SELECT c_com, ocrDttm, MAX(s_restime) s_k2time, SUM(CASE WHEN f_err IN ('Y', 'N') THEN 1 ELSE 0 END) m_k2sent FROM tb_kpilevel2 WHERE c_com = ? GROUP BY c_com, ocrDttm) k2 ON a.s_date = k2.ocrDttm \n` +
                  `       LEFT OUTER JOIN (SELECT c_com, ocrDttm, MAX(s_restime) s_k3time, SUM(CASE WHEN f_err IN ('Y', 'N') THEN 1 ELSE 0 END) m_k3sent FROM tb_kpilevel3 WHERE c_com = ? GROUP BY c_com, ocrDttm) k3 ON a.s_date = k3.ocrDttm \n` +
                  ` ORDER BY a.s_day `;

      var values = new Array();
      values.push(s_ym); 
      values.push(c_com); 
      values.push(c_com); 
      values.push(c_com); 
      console.log(`getResKpi\n`, query, values);
      const [rows] = await db.execute(query, values);
      return rows;
    },

    async getKpiFild(req) {
      const query = `SELECT CONCAT(b.c_gcode, b.c_code) c_gccode, b.c_gcode, b.c_code, b.n_code, b.s_buf1 \n` +
                    `  FROM tb_grpcode a \n` +
                    `       JOIN tb_comcode b ON a.c_com = b.c_com AND a.c_gcode = b.c_gcode \n` +
                    ` WHERE a.c_com = 'system' AND a.c_gcode IN ('KPIP', 'KPIQ', 'KPID', 'KPIC') \n` +
                    ` ORDER BY a.s_sort, b.s_sort `;
                    
      const [rows] = await db.execute(query);
      return rows;
    },
    async getKPITime(req) {
      const { c_com } = req.body;
      const query = `SELECT MAX(CASE WHEN c_code = 'KPI1' THEN n_code END) KPI1, MAX(CASE WHEN c_code = 'KPI2' THEN n_code END) KPI2, MAX(CASE WHEN c_code = 'KPI3' THEN n_code END) KPI3 \n` +
                    `  FROM tb_comcode a \n` +
                    ` WHERE a.c_com = ? AND c_gcode = 'KPITIME' \n`;
      var values = new Array();
      values.push(c_com); 
      
      const [[rows]] = await db.execute(query, values);
      if (!rows.KPI1) {
        const query = `SELECT MAX(CASE WHEN c_code = 'KPI1' THEN n_code END) KPI1, MAX(CASE WHEN c_code = 'KPI2' THEN n_code END) KPI2, MAX(CASE WHEN c_code = 'KPI3' THEN n_code END) KPI3 \n` +
                    `  FROM tb_comcode a \n` +
                    ` WHERE a.c_com = 'system' AND c_gcode = 'KPITIME' \n`;
        const [[rows]] = await db.execute(query);
        return rows;
      }
      return rows;
    },
    async sendKPIJob (req) {
      const payload = { ...req.body }
      const {c_com, i_kpilevel, s_day, s_restime, f_sned } = { ...payload }

      delete payload.i_kpilevel;
      delete payload.s_day;
      delete payload.f_sned;
      let table = "";
      if(i_kpilevel == "KPILEVEL1") {        
        delete payload.kpiFldCd;
        delete payload.kpiDtlCd;
        delete payload.kpiDtlNm;
        delete payload.achrt;
        delete payload.msmtVl;
        delete payload.unt;
        table = TABLE.KPI1;
      } else {
        delete payload.systmOprYn;
        if(i_kpilevel == "KPILEVEL2") {
          delete payload.msmtVl;
          delete payload.unt;
          table = TABLE.KPI2;
        } else {
          delete payload.achrt;
          table = TABLE.KPI3;
        }
      }
      if (f_sned == "전송") {
        delete payload.s_restime;
        if(i_kpilevel == "KPILEVEL1") {
          await KPIsendKpi1(payload, 'new')
        }
        else if (i_kpilevel == "KPILEVEL2") {
          await KPIsendKpi2(payload, 'new')
        } else {
          await KPIsendKpi3(payload, 'new')
        }
      } else {
        payload.f_err = "-"
        const sql = sqlHelper.Insert(table, payload) ;
        const [row] = await db.execute(sql.query, sql.values);
        await db.execute('COMMIT');
      }      
    },
    // KPI 전송내역 조회 (한번에 입력작업 위해서)
    async kpiJoblist(req) {
      const { c_com } = req.body;
      
      const query = `SELECT 'KPILEVEL1' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, systmOprYn, NULL kpiFldCd, NULL kpiDtlCd, NULL kpiDtlNm, NULL achrt, NULL msmtVl, NULL unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `  FROM tb_kpilevel1 \n` +
                    ` WHERE c_com = ? AND ocrDttm > DATE_FORMAT(NOW(),'%Y%m%d') AND f_err = '-'\n` +
                    `UNION \n` +
                    `SELECT 'KPILEVEL2' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, NULL systmOprYn, kpiFldCd, kpiDtlCd, kpiDtlNm, achrt, NULL msmtVl, NULL unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `  FROM tb_kpilevel2 \n` +
                    ` WHERE c_com = ? AND ocrDttm > DATE_FORMAT(NOW(),'%Y%m%d') AND f_err = '-'\n` +
                    `UNION \n` +
                    `SELECT 'KPILEVEL3' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, NULL systmOprYn, kpiFldCd, kpiDtlCd, kpiDtlNm, NULL achrt, msmtVl, unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `  FROM tb_kpilevel3 \n` +
                    ` WHERE c_com = ? AND ocrDttm > DATE_FORMAT(NOW(),'%Y%m%d') AND f_err = '-'\n ` +
                    ` ORDER BY c_com, kpilevel, ocrDttm, t_no`;
      var values = new Array();
      values.push(c_com); values.push(c_com); values.push(c_com); 
        
      const [rows] = await db.execute(query, values);
      rows.forEach((row) => {
        sqlHelper.addEditCol(row);
      });
      return rows;
    },
    async kpiFldDtlist(req) {
      const query = `SELECT CONCAT(b.c_gcode, b.c_code) c_gccode, SUBSTR(a.c_gcode,4,1) kpiFldCd, a.n_gcode kpiFldNm,\n ` +
                    `       b.c_code kpiDtlCd, b.n_code kpiDtlNm, b.s_buf1 unt\n ` +
                    `  FROM tb_grpcode a\n ` +
                    `        JOIN tb_comcode b ON a.c_com = b.c_com AND a.c_gcode = b.c_gcode\n ` +
                    `  WHERE a.c_com = 'system'\n ` +
                    `    AND a.c_gcode IN ('KPID', 'KPIQ' )\n ` +
                    `  ORDER BY a.s_sort, b.s_sort`;
      const [rows] = await db.execute(query);        
      return rows;
    },
    async kpiLevellist(req) {
      const { c_com } = req.body;
      var values = new Array(); values.push(c_com);
      const query = `SELECT s_buf1 lev, n_code t_time  FROM tb_comcode WHERE c_com = ? AND c_gcode LIKE 'KPITIME' ORDER BY  s_sort`;
      const [rows] = await db.execute(query, values);        
      return rows;
    },
    // KPI 전송내역 저장 (한번에 입력작업 위해서)
    async iukpiJoblist(req) {      
      const item = await sqlHelper.objectSplit(req.body);
      for (let i = 0; i < item.length; i++) {
        const row = { ... item[i] };
        if(row.f_edit == "0" && row.f_editold == "0") continue;

        const {c_com, t_no, kpiCertKey, ocrDttm, kpilevel } = row;
        const newdata = row.f_editold !== "0" ? true : false;
        const deldata = row.f_edit == "2" ? true : false;
        const table = kpilevel == 'KPILEVEL1' ?  'tb_kpilevel1' : kpilevel == 'KPILEVEL2' ? 'tb_kpilevel2' : kpilevel == 'KPILEVEL3' ? 'tb_kpilevel3' : 'no';
        if(table == 'no')  continue;

        delete row.f_edit;
        delete row.f_editold;
        delete row.kpilevel;
        if (newdata) delete row.t_no;
        if (table == 'tb_kpilevel1' ) {
          delete row.kpiFldCd;
          delete row.kpiDtlCd;
          delete row.kpiDtlNm;
          delete row.achrt;
          delete row.msmtVl;
          delete row.unt;
        } else if (table == 'tb_kpilevel2' ) {
          delete row.systmOprYn;
          delete row.msmtVl;
          delete row.unt;
        } else {
          delete row.systmOprYn;
          delete row.achrt;

        }

        const sql = deldata ? sqlHelper.DeleteSimple(table, {c_com, t_no, kpiCertKey, ocrDttm}) :  newdata ? sqlHelper.Insert(table, row) : sqlHelper.Update(table, row, {c_com, t_no, kpiCertKey, ocrDttm});            
        const [rv] = await db.execute(sql.query, sql.values);

      }
            
      return true;
    },

    // Server.js 에서 setInterval(() => { 에서 호출 백그라운더 실행 1분마다
    async load() {
      const now = getCurrentDateYYYYMMDD();
      const dt2 = getCurrentDateHHMM2();
      const dt1 = getTwentyAgo2();
      
      const instanceId = process.env.INSTANCE_ID;
      if (instanceId !== '0' ) return;
      const query = `SELECT 'KPILEVEL1' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, systmOprYn, NULL kpiFldCd, NULL kpiDtlCd, NULL kpiDtlNm, NULL achrt, NULL msmtVl, NULL unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `    FROM tb_kpilevel1 \n` +
                    `  WHERE ocrDttm = ? AND s_restime BETWEEN ? AND ? AND f_err = '-' \n` +
                    `  UNION \n` +
                    `  SELECT 'KPILEVEL2' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, NULL systmOprYn, kpiFldCd, kpiDtlCd, kpiDtlNm, achrt, NULL msmtVl, NULL unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `    FROM tb_kpilevel2 \n` +
                    `  WHERE ocrDttm = ? AND s_restime BETWEEN ? AND ? AND f_err = '-' \n` +
                    `  UNION \n` +
                    `  SELECT 'KPILEVEL3' kpilevel, t_no, c_com, kpiCertKey, ocrDttm, s_restime, NULL systmOprYn, kpiFldCd, kpiDtlCd, kpiDtlNm, NULL achrt, msmtVl, unt, trsDttm, f_tst, t_req, t_res, f_err \n` +
                    `    FROM tb_kpilevel3 \n` +
                    `  WHERE ocrDttm = ? AND s_restime BETWEEN ? AND ? AND f_err = '-' `;
      var values = new Array();
      values.push(now); values.push(dt1); values.push(dt2); 
      values.push(now); values.push(dt1); values.push(dt2); 
      values.push(now); values.push(dt1); values.push(dt2); 

      const [kpidata] = await db.execute(query, values);

      console.log('KPI load Job', `${now} ${dt2} --  ${kpidata.length}`);
      for (let i = 0; i < kpidata.length; i++) {
        const row = kpidata[i]
        let sendKpi = 0;
        if (row.kpilevel == 'KPILEVEL1') {
          delete row.kpiFldCd;
          delete row.kpiDtlCd;
          delete row.kpiDtlNm;
          delete row.achrt;
          delete row.msmtVl;
          delete row.unt;          
          sendKpi = 1;
        } else if (row.kpilevel == 'KPILEVEL2') {
          delete row.systmOprYn;
          delete row.msmtVl;
          delete row.unt;  
          sendKpi = 2;
        } else {
          delete row.systmOprYn;
          delete row.achrt;          
          sendKpi = 3;
        }
        delete row.kpilevel;
        
        if (sendKpi == 1) {
          await KPIsendKpi1(row, 'up')
        } else if (sendKpi == 2) {                                    
          await KPIsendKpi2(row, 'up')
        } else {
          await KPIsendKpi3(row, 'up')
        }
      }
  },
  async getKPI1List(req) {
    const { c_com, s_ym } = req.body;
    const query = `SELECT * \n FROM tb_kpilevel1 a  WHERE a.c_com = ? AND ocrDttm LIKE ? \n`;
    var values = new Array();    values.push(c_com);     values.push(`${s_ym}%`); 
    const [rows] = await db.execute(query, values);    
    return rows;
  },
  async getKPI2List(req) {
    const { c_com, s_ym } = req.body;
    const query = `SELECT * \n FROM tb_kpilevel2 a  WHERE a.c_com = ? AND ocrDttm LIKE ? \n`;
    var values = new Array();    values.push(c_com);     values.push(`${s_ym}%`); 
    const [rows] = await db.execute(query, values);    
    return rows;
  },
  async getKPI3List(req) {
    const { c_com, s_ym } = req.body;
    const query = `SELECT * \n FROM tb_kpilevel3 a  WHERE a.c_com = ? AND ocrDttm LIKE ? \n`;
    var values = new Array();    values.push(c_com);     values.push(`${s_ym}%`); 
    const [rows] = await db.execute(query, values);    
    return rows;
  },

}
async function KPIsendKpi1(payload, inup) {
  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
    },
  };
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
  const httpsite = payload.f_tst == "Y" ? 'http://ssf-kpi.kr:8080/kpiLv1/kpiLv1InsertTst' : 'http://ssf-kpi.kr:8080/kpiLv1/kpiLv1Insert';  
  const rv = await axios.post(httpsite, kpiData, config)
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

  const { c_com, t_no, ocrDttm, trsDttm, t_req, t_res, f_err } = { ...payload }
  const sql = inup == 'new' ? sqlHelper.Insert(TABLE.KPI1, payload) : sqlHelper.Update(TABLE.KPI1, {trsDttm, t_req, t_res, f_err }, { c_com, t_no, ocrDttm } );

  const [row] = await db.execute(sql.query, sql.values);
  await db.execute('COMMIT');

  return rv  
}

async function KPIsendKpi2(payload, inup) {
  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
    },
  };
  payload.trsDttm = getCurrentDateTimeYYYYMMDDHHMMSS();
  const jsonData = {
    "KPILEVEL2": [
        {
          "kpiCertKey": payload.kpiCertKey,
          "ocrDttm": payload.ocrDttm,
          "kpiFldCd": payload.kpiFldCd,
          "kpiDtlCd": payload.kpiDtlCd,
          "kpiDtlNm": payload.kpiDtlNm,
          "achrt": payload.achrt,
          "trsDttm": payload.trsDttm
        }
      ]            
  };
  const kpiData = JSON.stringify(jsonData, null, 2); 
  const httpsite = payload.f_tst == "Y" ? 'http://ssf-kpi.kr:8080/kpiLv2/kpiLv2InsertTst' : 'http://ssf-kpi.kr:8080/kpiLv2/kpiLv2Insert';  
  const rv = await axios.post(httpsite, kpiData, config)
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

  const { c_com, t_no, ocrDttm, trsDttm, t_req, t_res, f_err } = { ...payload }
  const sql = inup == 'new' ? sqlHelper.Insert(TABLE.KPI2, payload) : sqlHelper.Update(TABLE.KPI2, { trsDttm, t_req, t_res, f_err }, { c_com, t_no, ocrDttm } );

  const [row] = await db.execute(sql.query, sql.values);
  await db.execute('COMMIT');

  return rv
}

async function KPIsendKpi3(payload, inup) {
  const config = {
    headers: {
      'Content-Type': 'application/json; charset=utf-8', // Content-Type을 설정하고 UTF-8로 지정합니다.
    },
  };
  payload.trsDttm = getCurrentDateTimeYYYYMMDDHHMMSS();
  const jsonData = {
    "KPILEVEL3": [
        {
          "kpiCertKey": payload.kpiCertKey,
          "ocrDttm": payload.ocrDttm,
          "kpiFldCd": payload.kpiFldCd,
          "kpiDtlCd": payload.kpiDtlCd,
          "kpiDtlNm": payload.kpiDtlNm,
          "msmtVl": payload.msmtVl,
          "unt": payload.unt,
          "trsDttm": payload.trsDttm
        }
      ]            
  };
  const kpiData = JSON.stringify(jsonData, null, 2); 
  const httpsite = payload.f_tst == "Y" ? 'http://ssf-kpi.kr:8080/kpiLv3/kpiLv3InsertTst' : 'http://ssf-kpi.kr:8080/kpiLv3/kpiLv3Insert';  
  const rv = await axios.post(httpsite, kpiData, config)
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

  const { c_com, t_no, ocrDttm, trsDttm, t_req, t_res, f_err } = { ...payload }
  const sql = inup == 'new' ? sqlHelper.Insert(TABLE.KPI3, payload) : sqlHelper.Update(TABLE.KPI3, { trsDttm, t_req, t_res, f_err }, { c_com, t_no, ocrDttm } );

  const [row] = await db.execute(sql.query, sql.values);
  await db.execute('COMMIT');

  return rv
}

module.exports = kpiModel;
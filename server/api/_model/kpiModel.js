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
        axios.post('http://ssf-kpi.kr:8080/kpiLv1InsertTst', kpiData, config)
            .then(response => {
            console.log('JSON sent successfully:', response.data);
            })
            .catch(error => {
            console.error('Error sending JSON:', error.message);
            });
        console.log("끝");
    }
}

module.exports = kpiModel;
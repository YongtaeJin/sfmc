const db = require('../../plugins/mysql');
// const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');
const dashboardModel = {
     async getLineChart(req) {
          const { c_com } = req.user;
          const query = `SELECT MID(s_date, 1, 4) YY,
                              SUM(IF(MID(s_date, 6, 2) = '01',a_orderamt, 0)) M01,
                              SUM(IF(MID(s_date, 6, 2) = '02',a_orderamt, 0)) M02,
                              SUM(IF(MID(s_date, 6, 2) = '03',a_orderamt, 0)) M03,
                              SUM(IF(MID(s_date, 6, 2) = '04',a_orderamt, 0)) M04,
                              SUM(IF(MID(s_date, 6, 2) = '05',a_orderamt, 0)) M05,
                              SUM(IF(MID(s_date, 6, 2) = '06',a_orderamt, 0)) M06,
                              SUM(IF(MID(s_date, 6, 2) = '07',a_orderamt, 0)) M07,
                              SUM(IF(MID(s_date, 6, 2) = '08',a_orderamt, 0)) M08,
                              SUM(IF(MID(s_date, 6, 2) = '09',a_orderamt, 0)) M09,
                              SUM(IF(MID(s_date, 6, 2) = '10',a_orderamt, 0)) M10,
                              SUM(IF(MID(s_date, 6, 2) = '11',a_orderamt, 0)) M11,
                              SUM(IF(MID(s_date, 6, 2) = '12',a_orderamt, 0)) M12,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 1,a_orderamt, 0)) A01,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 2,a_orderamt, 0)) A02,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 3,a_orderamt, 0)) A03,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 4,a_orderamt, 0)) A04,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 5,a_orderamt, 0)) A05,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 6,a_orderamt, 0)) A06,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 7,a_orderamt, 0)) A07,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 8,a_orderamt, 0)) A08,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 9,a_orderamt, 0)) A09,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 10,a_orderamt, 0)) A10,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 11,a_orderamt, 0)) A11,
                              SUM(IF(CONVERT(MID(s_date, 6, 2), UNSIGNED) <= 12,a_orderamt, 0)) A12
                           FROM tb_order
                          WHERE MID(s_date, 1, 4) = '2025'                            
                          GROUP BY MID(s_date, 1, 4)`;
          const [rows] = await db.execute(query);   
          return rows;
     },
     async getPieChart1(req) {
          const { c_com } = req.user;
     },
     async getPieChart2(req) {
          const { c_com } = req.user;
     },
     async getDataTable(req) {
          const { c_com } = req.user;
     },
}

module.exports = dashboardModel;
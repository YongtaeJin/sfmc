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
          const { today } = req.body
          
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
                          WHERE c_com = ?
                            AND MID(s_date, 1, 4) = ? 
                          GROUP BY MID(s_date, 1, 4)`;
          const params = [c_com, today]
          const [rows] = await db.execute(query, params);   
          
          return rows;
     },
     async getPieChart1(req) {
          const { c_com } = req.user;
          const { today } = req.body
          
          const query = `SELECT a.c_com, b.c_item, MAX(b.n_item) n_item,  max(b.t_size) t_size,
                               SUM(c.m_yescnt) m_yescnt, SUM(c.m_nocnt) m_nocnt, SUM(CASE WHEN c.m_yescnt >= b.m_cnt THEN f_CountWeekday(d.s_works, d.s_worke) ELSE f_CountWeekday(d.s_works, d.d_now) END) w_workcnt,
                               ROUND(SUM(c.m_yescnt) / SUM(CASE WHEN c.m_yescnt >= b.m_cnt THEN f_CountWeekday(d.s_works, d.s_worke) ELSE f_CountWeekday(d.s_works, d.d_now) END),2) m_dayavgcnt
                          FROM tb_order a
                               JOIN tb_orderli b ON a.i_order = b.i_order AND a.c_com = b.c_com
                               JOIN (SELECT i_order, c_com, i_orderser, SUM(IF(f_err = 'N', IF(f_jobf = 'Y',m_cnt,0),0)) m_yescnt, SUM(IF(f_err = 'N', 0, m_err)) m_nocnt
                                       FROM tb_prodmake
                                      GROUP BY i_order, c_com, i_orderser)  c ON b.c_com = c.c_com AND b.i_order = c.i_order AND b.i_orderser = c.i_orderser
                               JOIN (SELECT i_order, c_com, i_orderser, DATEDIFF(MAX(s_workday), MIN(s_workday)) w_workcnt, MIN(s_workday) s_works, MAX(s_workday) s_worke, DATE_FORMAT(CURDATE(), '%Y-%m-%d') d_now
                                       FROM (SELECT i_order, c_com, i_orderser, s_workday
                                               FROM tb_prodmake
                                              GROUP BY i_order, c_com, i_orderser, s_workday) t
                                      GROUP BY i_order, c_com, i_orderser
                                    )  d ON b.c_com = d.c_com AND b.i_order = d.i_order AND b.i_orderser = d.i_orderser
                          WHERE a.c_com = ?
                            AND MID(b.d_plan2,1, 7) = ?
                          GROUP BY a.c_com,  b.c_item
                          ORDER BY (SELECT t.s_sort FROM tb_item t WHERE t.c_com = b.c_com AND t.c_item = b.c_item)`;
          const params = [c_com, today]
          const [rows] = await db.execute(query, params);   
          
          return rows;
     },
     async getPieChart2(req) {
          const { c_com } = req.user;
          const { today } = req.body
          
          const query = `SELECT a.c_com, a.c_process, MAX(c1.n_process) n_process, SUM(a.m_cnt) m_cnt,  SUM(IFNULL(b.m_err,0)) m_err,
                                ROUND(SUM(IFNULL(b.m_err,0)) / SUM(a.m_cnt) * 100,2) p_per
                           FROM tb_prodplan a
                                LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, c_item, i_ser, SUM(IFNULL(m_err,0)) m_err
                                                   FROM tb_prodmake
                                                  WHERE f_err = 'Y'
                                                  GROUP BY c_com, i_order, i_orderser, c_item, i_ser) b
                                                 ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser AND a.c_item = b.c_item AND a.i_ser = b.i_ser
                                LEFT OUTER JOIN tb_process c1 ON a.c_com = c1.c_com AND a.c_process = c1.c_process
                           WHERE a.c_com = ?
                             AND EXISTS (SELECT * FROM tb_orderli t WHERE a.c_com = t.c_com AND a.i_order = t.i_order AND a.i_orderser = t.i_orderser)
                             AND MID(a.s_date1,1,7) = ?
                          GROUP BY a.c_com, a.c_process
                          ORDER BY a.c_com, MAX(c1.s_sort)`;
          const params = [c_com, today]          
          const [rows] = await db.execute(query, params);   
          
          return rows;
     },
     async getDataTable(req) {
          const { c_com } = req.user;
          const { today } = req.body
          
          const query = `SELECT a.c_com, a.i_order, b.i_orderser, a.i_orderno, 
                                a.s_date, a.f_status, a.n_vend, b.s_sort, b.c_item, b.n_item, b.t_size, b.i_unit, b.m_cnt, b.s_duedate, b.f_work, b.d_plan1, b.d_plan2, b.t_remark
                           FROM tb_order a
                                JOIN tb_orderli b ON a.i_order = b.i_order AND a.c_com = b.c_com
                          WHERE a.c_com = ?
                            AND a.s_date = ?
                            AND a.f_use = 'Y'
                           ORDER BY a.i_order, b.s_sort, b.i_orderser`;
          const params = [c_com, today]          
          const [rows] = await db.execute(query, params);   
          
          return rows;
     },
}

module.exports = dashboardModel;
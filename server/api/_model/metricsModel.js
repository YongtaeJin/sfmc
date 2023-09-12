const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');

const metricsModel = {
    async getDerliverrate(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;  

        var values = new Array();
        values.push(c_com); 
        let query = `SELECT a.c_com, a.c_vend, a.n_vend, \n` +
                    `       COUNT(*) m_ordcnt, SUM(CASE WHEN i = 0 AND e = 0 THEN 1 ELSE 0 END) m_ok, SUM(CASE WHEN i = 0 AND e > 0 THEN 1 ELSE 0 END) m_no, SUM(CASE WHEN i = 1 THEN 1 ELSE 0 END ) m_ing \n` +
                    `  FROM (SELECT a.c_com, a.c_vend, MAX(a.n_vend) n_vend, a.i_order, \n` +
                    `               MAX(CASE WHEN s_date2 >= NOW() THEN 1 ELSE 0 END) i, \n` +
                    `               MAX(CASE WHEN b.m_cnt > IFNULL(c.m_shipcnt,0) THEN 1 ELSE CASE WHEN b.s_duedate < c.d_ship THEN 1 ELSE 0 END  END) e \n` +
                    `          FROM tb_order a \n` +
                    `               JOIN tb_orderli B on a.c_com = b.c_com AND a.i_order = b.i_order \n` +
                    `               LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, COUNT(m_shipcnt) m_shipcnt, MAX(d_ship) d_ship \n` +
                    `                                  FROM tb_prodship GROUP BY c_com, i_order, i_orderser) c \n` +
                    `                              ON a.c_com = b.c_com AND a.i_order = b.i_order AND b.i_orderser = c.i_orderser \n` +
                    `         WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += `           AND a.s_date2 BETWEEN ? and ? \n `;
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += `           AND a.s_date2 >= ? \n `;
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += `           AND a.s_date2 <= ? \n `;
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += `           AND a.n_vend LIKE ? \n `;
            values.push(sVend + '%');
        }
        query +=    `        GROUP BY a.c_com, a.c_vend, a.i_order \n` +
                    `       ) a \n` +
                    ` GROUP BY a.c_com, a.c_vend, a.n_vend \n` +
                    ` ORDER BY 1, 3` ;        

        const [rows] = await db.execute(query, values);   
    
        return rows;

    },
    async getDerliverratedt(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;  

        var values = new Array();
        values.push(c_com); 
     
        let query2 = `SELECT a.c_com, a.c_vend, a.i_order, a.i_orderno, a.s_date2, b.s_sort, b.i_orderser, \n` +
                     `       b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.s_duedate, c.d_ship, c.m_shipcnt, \n` +
                     `       CASE WHEN b.s_duedate > NOW() THEN '진행' \n` +
                     `            WHEN b.m_cnt > IFNULL(c.m_shipcnt,0) THEN '미준수' \n` +
                     `            WHEN a.s_date2 < c.d_ship THEN '미준수' \n` +
                     `            ELSE '준수' \n` +
                     `       END n_status \n` +
                     `  FROM tb_order a \n` +
                     `       JOIN tb_orderli B on a.c_com = b.c_com AND a.i_order = b.i_order \n` +
                     `       LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, COUNT(m_shipcnt) m_shipcnt, MAX(d_ship) d_ship \n` +
                     `                          FROM tb_prodship GROUP BY c_com, i_order, i_orderser) c \n` +
                     `                        ON a.c_com = b.c_com AND a.i_order = b.i_order AND b.i_orderser = c.i_orderser \n` +
                     ` WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query2 += `           AND a.s_date2 BETWEEN ? and ? \n `;  
            values.push(sDate1);
            values.push(sDate2);          
        } else if (sDate1.length > 0) {
            query2 += `           AND a.s_date2 >= ? \n `;            
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query2 += `           AND a.s_date2 <= ? \n `;   
            values.push(sDate2);         
        }
        if (sVend.length > 0) {
            query2 += `           AND a.n_vend LIKE ? \n `;   
            values.push(sVend + '%');         
        }
        query2 +=    ` ORDER BY a.c_com, a.c_vend, a.i_orderno, a.s_date, b.s_sort `;

        console.log(query2)
        const [rows2] = await db.execute(query2, values);   
        return rows2;
    },

    async getDefectraterate(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2 } = req.body;  

        var values = new Array();
        values.push(c_com); 
        // 공정별 불량율
        let query = `SELECT a.c_com, a.c_process, MAX(c1.n_process) n_process, SUM(a.m_cnt) m_cnt,  SUM(IFNULL(b.m_err,0)) m_err, \n` +
                    `        ROUND(SUM(IFNULL(b.m_err,0)) / SUM(a.m_cnt) * 100,2) p_per \n` +                    
                    `    FROM tb_prodplan a \n` +
                    `        LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, c_item, i_ser, SUM(IFNULL(m_err,0)) m_err \n` +
                    `                            FROM tb_prodmake \n` +
                    `                            WHERE f_err = 'Y' \n` +
                    `                            GROUP BY c_com, i_order, i_orderser, c_item, i_ser) b \n` +
                    `                        ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser AND a.c_item = b.c_item AND a.i_ser = b.i_ser \n` +
                    `        LEFT OUTER JOIN tb_process c1 ON a.c_com = c1.c_com AND a.c_process = c1.c_process \n` +
                    `    WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += `    AND a.s_date1 BETWEEN ? and ? \n `;  
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += `    AND a.s_date1 >= ? \n `;            
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += `    AND a.s_date1 <= ? \n `;   
            values.push(sDate2);
        }       
        query +=    `    GROUP BY a.c_com, a.c_process \n`;
        query +=    `    ORDER BY a.c_com, MAX(c1.s_sort)`;

        
        const [rows] = await db.execute(query, values);   
        return rows;
    },
    async getDefectrateratedt(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2 } = req.body;  

        var values = new Array();
        values.push(c_com); 
        let query = `SELECT a.c_com,  a.i_order, a.i_orderser, a.c_item, a.i_ser, b.i_makeser, \n` +
                    `       d.i_orderno, d.n_vend, e.n_item, \n` +
                    `       a.c_process, IFNULL(c1.n_process, a.n_process) n_process, \n` +
                    `       b.s_workday, b.i_empno, b.n_empnm, b.m_err, b.f_cause \n` +
                    `  FROM tb_prodplan a \n` +
                    `       JOIN tb_prodmake b ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser AND a.c_item = b.c_item AND a.i_ser = b.i_ser AND b.f_err = 'Y' \n` +
                    `       LEFT OUTER JOIN tb_process c1 ON a.c_com = c1.c_com AND a.c_process = c1.c_process \n` +
                    `       LEFT OUTER JOIN tb_order d ON a.c_com = d.c_com AND a.i_order = d.i_order \n` +
                    `       LEFT OUTER JOIN tb_orderli e ON a.c_com = e.c_com AND a.i_order = e.i_order AND a.i_orderser = e.i_orderser \n` +
                    ` WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += `    AND a.s_date1 BETWEEN ? and ? \n `;  
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += `    AND a.s_date1 >= ? \n `;            
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += `    AND a.s_date1 <= ? \n `;   
            values.push(sDate2);
        }    
        query += ` ORDER BY a.c_com, c1.s_sort, s_workday, i_orderno, e.s_sort`;

        const [rows] = await db.execute(query, values);   
        return rows;
    },

    async getDefectraterate2(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2 } = req.body;  

        var values = new Array();
        values.push(c_com); 
        // 공정별 불량율
        let query = `SELECT a.c_com, a.c_item, MAX(a.n_item) n_item, SUM(a.m_cnt) m_ordcnt, SUM(IFNULL(b.m_err,0)) m_err, ROUND(SUM(IFNULL(b.m_err,0)) / SUM(a.m_cnt) * 100, 2) p_per \n` +
                    `  FROM tb_orderli a \n` +
                    `       JOIN (SELECT a.c_com, a.i_order, a.i_orderser, SUM(a.m_cnt) m_cnt,  SUM(IFNULL(b.m_err,0)) m_err \n` +
                    `               FROM tb_prodplan a \n` +
                    `                    LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, c_item, i_ser, SUM(IFNULL(m_err,0)) m_err \n` +
                    `                                       FROM tb_prodmake \n` +
                    `                                       WHERE f_err = 'Y' \n` +
                    `                                       GROUP BY c_com, i_order, i_orderser, c_item, i_ser) b \n` +
                    `                                     ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser AND a.c_item = b.c_item AND a.i_ser = b.i_ser \n` +
                    `              WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += `                AND a.s_date1 BETWEEN ? and ? \n `;  
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += `                AND a.s_date1 >= ? \n `;            
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += `                AND a.s_date1 <= ? \n `;   
            values.push(sDate2);
        }     
        query +=    `              GROUP BY a.c_com, a.i_order, a.i_orderser \n` +
                    `            ) b ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser \n` +
                    `       LEFT OUTER JOIN tb_item c1 ON a.c_com = c1.c_com AND a.c_item = c1.c_item \n` +
                    `  GROUP BY a.c_com, a.c_item \n`;
                    `  ORDER BY a.c_com, MAX(c1.s_sort)`;

        const [rows] = await db.execute(query, values);   
        return rows;
    },
    async getDefectrateratedt2(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2 } = req.body;  

        var values = new Array();
        values.push(c_com); 
        let query = `SELECT d.c_com,  d.i_order, d.i_orderser, d.c_item, d.i_ser, d.i_makeser, \n` +
                    `       a.i_orderno, a.n_vend, b.n_item, c.c_process, IFNULL(c1.n_process, c.n_process) n_process, \n` +
                    `       d.s_workday, d.i_empno, d.n_empnm, d.m_err, d.f_cause \n` +
                    `  FROM tb_order a \n` +
                    `       JOIN tb_orderli b ON a.c_com = b.c_com AND a.i_order = b.i_order \n` +
                    `       JOIN tb_prodplan c ON b.c_com = c.c_com AND b.i_order = c.i_order AND b.i_orderser = c.i_orderser \n` +
                    `       JOIN tb_prodmake d ON c.c_com = d.c_com AND c.i_order = d.i_order AND c.i_orderser = d.i_orderser AND c.c_item = d.c_item AND c.i_ser = d.i_ser AND d.f_err = 'Y' \n` +
                    `       LEFT OUTER JOIN tb_process c1 ON c.c_com = c1.c_com AND c.c_process = c1.c_process  \n` +
                    ` WHERE a.c_com = ? \n`;
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += `    AND c.s_date1 BETWEEN ? and ? \n `;  
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += `    AND c.s_date1 >= ? \n `;            
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += `    AND c.s_date1 <= ? \n `;   
            values.push(sDate2);
        }    
        query += ` ORDER BY a.c_com, c1.s_sort, s_workday, i_orderno, b.s_sort`;
        console.log(query)
        const [rows] = await db.execute(query, values);   
        return rows;
    },
}

module.exports = metricsModel;
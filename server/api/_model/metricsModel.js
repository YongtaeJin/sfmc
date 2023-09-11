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
}

module.exports = metricsModel;
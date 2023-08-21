const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');

async function setAutoCommitNo() {
    const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
    if (data[0].rt == 1) {
        const [rv] = await db.execute('SET AUTOCOMMIT = FALSE');
    }
}
async function setAutoCommit() {
    const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
    if (data[0].rt == 0) {
        const rv = await db.execute('SET AUTOCOMMIT = TRUE');
    }
}
function addEditCol(data) {	
	data.f_edit = '0';	
    data.f_editold = '0';	
	return data;
}
const shipmentModel = {
    async getDerliverlist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `select a.c_com, a.i_order, b.i_orderser, \n` +
                    `       a.s_date, a.i_orderno, a.n_vend, a.n_order, b.c_item, b.n_item, b.t_size, b.m_cnt m_ocnt, b.s_duedate,  \n` +
                    `       c.m_yescnt, ifnull(d.m_shipcnt, 0) m_shipcnt,  d.d_ship  \n` +        
                    ` from  tb_order a \n` +
                    `       join tb_orderli b on a.i_order = b.i_order \n` +
                    `       join (select i_order, c_com, i_orderser, sum(if(f_err = 'N', m_cnt,0)) m_yescnt, sum(if(f_err = 'N', 0, m_cnt)) m_nocnt \n` +
                    `               from tb_prodmake \n` +
                    `               group by i_order, c_com, i_orderser)  c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    `       left outer join (select c_com, i_order, i_orderser, sum(m_shipcnt) m_shipcnt, max(d_ship) d_ship \n` +
                    `                          from tb_prodship \n` +
                    `                         group by  c_com, i_order, i_orderser) d on b.c_com = d.c_com and b.i_order = d.i_order and b.i_orderser = d.i_orderser \n` +
                    ` where a.c_com = ? \n` ;
        values.push(c_com);  
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and a.s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and a.s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and a.s_date <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        query += ` order by a.i_order, b.s_sort, b.i_orderser \n` ;

        const [rows] = await db.execute(query, values);
        return rows;
    },
    async getDerliverlistdt(req) {
        //const { c_com } = req.user;
        const { c_com, i_order, i_orderser } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.SHIPMENT, { c_com, i_order, i_orderser });     
        console.log(sql)
        const [rows] = await db.execute(sql.query, sql.values);        
        
        rows.forEach((row) => {
            addEditCol(row);
        });
        return rows;
    },
    async iuDerliverlist(req) {
    }
}

module.exports = shipmentModel;
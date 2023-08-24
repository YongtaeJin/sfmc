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
                    `       a.s_date, a.i_orderno, a.n_vend, a.n_order, b.c_item, b.n_item, b.t_size, b.m_cnt m_ocnt, b.s_duedate, b.f_work,  \n` +
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
        rows.forEach((row, index) => {
            row.m_difcnt =  row.m_yescnt - row.m_shipcnt;
            addEditCol(row);     // 수정 칼럼 추가 처리 
        });
        return rows;
    },
    async getDerliverlistdt(req) {
        //const { c_com } = req.user;
        const { c_com, i_order, i_orderser } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.SHIPMENT, { c_com, i_order, i_orderser });     
        console.log(sql)
        const [rows] = await db.execute(sql.query, sql.values);        
        
        rows.forEach((row, index) => {
            row.m_sort = index + 1;            
            addEditCol(row);
        });
        return rows;
    },
    async iuDerliverlist(req) {
        if (!isGrant(req, LV.PRODUCTION))  throw new Error('권한이 없습니다.');
		const { i_id, n_name } = req.user;
        // console.log(req.body)
        const at = moment().format('LT'); 
        const item = req.body;
        
        if (! item.length) return 0;
        let order = [];
        let orderlist = [];

        await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const { c_com, i_shipser, i_shipno, d_ship, i_order, i_orderser, m_shipcnt, t_remark, f_edit, f_editold } = item[i];
            if (f_edit == "0") continue;      // 수정 내용 없음
            delete item[i].m_sort;
            delete item[i].f_edit;
            delete item[i].f_editold;

            const newdata = f_editold == "1" ? true : false;
            const deldata = f_edit == "2" ? true : false;
            if (newdata) {
                delete item[i].d_update_at;
                delete item[i].n_upnm;
                item[i].d_create_at = at;
                item[i].n_crnm      = n_name;
            } else {
                delete item[i].d_create_at;
                delete item[i].n_crnm;
                item[i].d_update_at = at;
                item[i].n_upnm      = n_name;
            };
            const sql = deldata ? sqlHelper.DeleteSimple(TABLE.SHIPMENT, {c_com, i_shipser}) : newdata ? sqlHelper.Insert(TABLE.SHIPMENT, item[i]) : sqlHelper.Update(TABLE.SHIPMENT, item[i], {c_com, i_shipser});
            console.log("sql", sql);
            const res = await sqlDbExecute(sql);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await addOrder(order, {c_com, i_order});
            await addOrderList(orderlist, {c_com, i_order, i_orderser});
        }
        
        // 발주서 상태 변경  (작업 <-> 출하)        
        for (let i = 0; i < order.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.SHIPMENT, order[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_status = rv.cnt > 0 ? "D" : 'W';

            const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }        
        // 발주서 세부 작업상태 는 별도 처리 iuProdWorkset --> 출하등록화면에서 상태란 더블 클릭 해서        

        await db.execute('COMMIT');        
        return true;
    },

    async iuShipWorkset(req) {
        const {c_com, i_order, i_orderser, f_work}  = req.body;
        const n_work4 = req.user.n_name;
        const d_work4_at = moment().format('LT');
        const sqldt = sqlHelper.SelectSimple(TABLE.SHIPMENT, {c_com, i_order, i_orderser}, ['max(d_ship) as d_ship']); 
        const [[rv]] = await db.execute(sqldt.query, sqldt.values);
        console.log(rv)
        const d_work4 = rv.d_ship ? rv.d_ship : '';

        const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_work4, n_work4, d_work4_at}, {c_com, i_order, i_orderser});
        const res = await db.execute(sql.query, sql.values);
        if (res.affectedRows < 1) {
            await db.execute('ROLLBACK');
            return false;
        }
        await db.execute('COMMIT');
        return true;
    },

    async getDerliverview(req) {        
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        let query = `select a.c_com, b.i_order, b.i_orderser, \n` +
                    `       a.i_orderno,  a.n_vend, a.s_date, a.f_status,\n` +
                    `       b.f_work, b.s_sort, b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, a_unit, a_amt, b.s_duedate, \n` +
                    `       c.m_shipcnt, c.d_ship \n` +
                    `  from tb_order a \n` +
                    `       join tb_orderli b on a.c_com = b.c_com and a.i_order = b.i_order \n` +
                    `       left outer join (select c_com, i_order, i_orderser, sum(m_shipcnt) m_shipcnt, max(d_ship) d_ship \n` +
                    `                          from tb_prodship \n` +
                    `                         group by c_com, i_order, i_orderser ) c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    ` where a.c_com = ? \n`;
        values.push(c_com);        
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and c.d_ship between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and c.d_ship >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and c.d_ship <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }       
        query += `  order by a.c_com, a.i_order, b.i_orderser`;
        
        const [rows] = await db.execute(query, values);    
        return rows;
        
    },
    
}
async function addOrder(jsonArr, newData) {
    const isDuplicate = jsonArr.some(obj =>
      obj.c_com === newData.c_com &&
      obj.i_order === newData.i_order 
    );  
    if (!isDuplicate) jsonArr.push(newData);      
    return jsonArr;
}
async function addOrderList(jsonArr, newData) {
    const isDuplicate = jsonArr.some(obj =>
      obj.c_com === newData.c_com &&
      obj.i_order === newData.i_order &&
      obj.i_orderser === newData.i_orderser
    );  
    if (!isDuplicate) jsonArr.push(newData);      
    return jsonArr;
}
async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}
module.exports = shipmentModel;
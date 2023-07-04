const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');

const prodModel = {
    async getProdPlanlist(req) {
        // if (req.user.c_com != req.query.c_com) { throw new Error('권한이 없습니다.'); }  
        
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;  

        // let where = `SELECT * FROM tb_prodplan \n WHERE c_com = ? \n`;
        let where = `select a.c_com, a.i_order, b.i_orderser, a.i_orderno, \n` +
                    `       a.s_date, a.f_status, a.n_vend, b.s_sort, b.n_item, b.t_size, b.i_unit, b.m_cnt, b.s_duedate, b.f_work, b.d_plan1, b.d_plan2, b.t_remark \n` +
                    `  from tb_order a \n` +
                    `      join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com \n` +
                    ` where a.c_com = ? and a.f_use = 'Y' \n` ;
                    
        var values = new Array();
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and a.s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and a.s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and a.s_date <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            where += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` order by a.i_order, b.s_sort, b.i_orderser `;
        
        console.log(where, values);            
        const [rows] = await db.execute(where, values);        
        
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });
        return rows;
    },
    async iuProdPlanlist(req) {
        const { c_com } = req.user;
        const item = await sqlHelper.objectSplit(req.body); 
        const n_plan = req.user.n_name;
        const d_plan_at = moment().format('LT');
        let sql;
        let rv = [];
        let order = []; 
        await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const {c_com, i_order, i_orderser, f_work, d_plan1, d_plan2, t_remark, f_edit, f_editold} = item[i];
            if (f_edit !== "1" || f_editold !== "0") continue;            
        
            sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_plan1, d_plan2, t_remark, n_plan, d_plan_at}, {c_com, i_order, i_orderser});           
            const [row] = await db.execute(sql.query, sql.values); 
            if (row.affectedRows > 0) {
                rv[rv.length] = i_orderser;
                addToUniqueArray(order, i_order);
            }
        }
        // 발주정보 확인 하여 발주 상태 저장 
        for (let i = 0; i < order.length; i++) {
            sql.query = `update tb_order a \n ` +
                  `  set a.f_status = (select if(sum(if(f_work = '1', 0, 1)) > 0, 'P', 'S') \n ` +
                  `                      from tb_orderli t \n ` +
                  `                      where a.c_com = t.c_com and t.i_order = a.i_order) \n ` +
                  `  where a.c_com = '${c_com}' \n ` +
                  `    and a.i_order = '${order[i]}' \n ` +
                  `   and a.f_status in ('P', 'S') `;
            await db.execute(sql.query);             
        }        
        await db.execute('COMMIT');
        return  rv;
    },

    async getProdWork(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        
        let where = `select a.c_com, a.i_order, b.i_orderser, a.i_orderno, \n` +
                    `       a.n_vend, b.s_sort, b.n_item, b.t_size, b.i_unit, b.m_cnt,  b.f_work, b.d_plan1, b.d_plan2, b.t_remark, \n` +
                    `       ifnull((select sum(m_cnt) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'N'),0) m_makecnt, \n` +
                    `       ifnull((select sum(m_err) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'Y'),0) m_errcnt \n` +
                    `   from tb_order a  \n` +
                    `        join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com and b.f_work > '1' \n` +
                    `  where a.c_com = ? and a.f_use = 'Y' \n` ;                    

        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and a.d_plan1 between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and a.d_plan1 >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and a.d_plan1 <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            where += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` order by a.i_order, b.s_sort, b.i_orderser \n` ;

        console.log('getProdWork', where)
        const [rows] = await db.execute(where, values);        
        
        return rows;
    },
    async getProdWorklist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com, i_order, i_orderser } = req.body;
        const sql = sqlHelper.SelectSimple(TABLE.PRODMAKE, { c_com, i_order, i_orderser}) ;
        sql.query = sql.query + ` ORDER BY i_makeser `;
        console.log('getProdWorklist', sql)
       
        const [rows] = await db.execute(sql.query, sql.values);  
        
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });      
        return rows;        
    },
    async iuProdWorklist(req) {
        const { c_com } = req.user;
        const item = req.body;
        let order = []; 
        let orderlist = []; 
        
        await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const {c_com, i_order, i_orderser, i_makeser, s_workday, f_err, m_cnt, m_err, i_process, f_cause, n_name, t_remark, f_edit, f_editold} = item[i];
            if (f_edit == "0") continue;      // 수정 내용 없음
            const newdata = item[i].f_editold == "1" ? true : false;
            const deldata = item[i].f_edit == "2" ? true : false;
            
            if (newdata) {
                delete item[i].d_update_at;
                delete item[i].n_upnm;
                item[i].d_create_at = moment().format('LT');
                item[i].n_crnm      = req.user.n_name;                
            } else {
                delete item[i].d_create_at;
                delete item[i].n_crnm;
                item[i].d_update_at = moment().format('LT');
                item[i].n_upnm      = req.user.n_name                
            };
            delete item[i].f_edit;
            delete item[i].f_editold;
            const sql = deldata ? sqlHelper.DeleteSimple(TABLE.PRODMAKE, {c_com, i_order, i_orderser, i_makeser}) :  newdata ? sqlHelper.Insert(TABLE.PRODMAKE, item[i]) : sqlHelper.Update(TABLE.PRODMAKE, item[i], {c_com, i_order, i_orderser, i_makeser});
            
            console.log("detial", sql);
            const res = await sqlDbExecute(sql);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await addOrder(order, {c_com, i_order});
            await addOrderList(orderlist, {c_com, i_order, i_orderser});
        }
        // 발주서 상태 변경  (계획 <-> 작업)        
        for (let i = 0; i < order.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.PRODMAKE, order[i], ['COUNT(*) as cnt']);
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);
            // const f_status = { f_status : rv.cnt > 0 ? "W" : 'P' };
            const f_status = rv.cnt > 0 ? "W" : 'P';
            
            const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }
        // 발주서 list 상태 변경  (지시 <-> 작업 )
        let n_work1 = req.user.n_name;
        let d_work1_at = moment().format('LT');
        for (let i = 0; i < orderlist.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.PRODMAKE, orderlist[i], ['COUNT(*) as cnt', 'MIN(s_workday) as dates', 'MAX(s_workday) as datee']);
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            
            //const f_work = { f_work : rv.cnt > 0 ? "3" : '2' };
            const f_work = rv.cnt > 0 ? "3" : '2';
            const d_work2 = rv.dates;
            const d_work3 = rv.datee;
            const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_work2, d_work3, n_work1, d_work1_at}, orderlist[i]);
            sql.query = sql.query.replace("WHERE", `, d_work1 = ifnull(d_work1, DATE_FORMAT(CURDATE(), '%Y-%m-%d')) WHERE`)
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }

        await db.execute('COMMIT');
        return true;
    },

    async iuProdWorkset(req) {
        const {c_com, i_order, i_orderser, f_work}  = req.body;
        const n_work3 = req.user.n_name;
        const d_work3_at = moment().format('LT');
        const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, n_work3, d_work3_at}, {c_com, i_order, i_orderser});
        const res = await db.execute(sql.query, sql.values);
        if (res.affectedRows < 1) {
            await db.execute('ROLLBACK');
            return false;
        }
        await db.execute('COMMIT');
        return true;
    }

}

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
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
module.exports = prodModel;
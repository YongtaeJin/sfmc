const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');

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
        const item = await sqlHelper.objectSplit(req.body); 
        const n_plan = req.user.n_name;
        const d_plan_at = moment().format('LT');
        let sql;
        let rv=[];
        await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const {c_com, i_order, i_orderser, f_work, d_plan1, d_plan2, t_remark, f_edit, f_editold} = item[i];
            if (f_edit !== "1" || f_editold !== "0") continue;            
        
            sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_plan1, d_plan2, t_remark, n_plan, d_plan_at}, {c_com, i_order, i_orderser});           
            const [row] = await db.execute(sql.query, sql.values); 
            if (row.affectedRows > 0) rv[rv.length] = i_orderser;            
        }

        await db.execute('COMMIT');
        return  rv;
    },

    async getProdWorkList(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        let where = `select a.c_com, a.i_order, b.i_orderser, a.i_orderno, \n` +
                    `       a.n_vend, b.s_sort, b.n_item, b.t_size, b.i_unit, b.m_cnt,  b.f_work, b.d_plan1, b.d_plan2, b.t_remark, \n` +
                    `       ifnull((select sum(m_cnt) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'N'),0) m_makecnt, \n` +
                    `       ifnull((select sum(m_err) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'Y'),0) m_errcnt \n` +
                    `   from tb_order a  \n` +
                    `        join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com \n` +
                    `  order by a.i_order, b.s_sort, b.i_orderser   \n` ;
        
        const [rows] = await db.execute(where, values);        
        return rows;
    },
   
}



module.exports = prodModel;
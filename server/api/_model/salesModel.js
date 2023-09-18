const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');

// async function setAutoCommitNo() {
//     const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
//     if (data[0].rt == 1) {
//         const [rv] = await db.execute('SET AUTOCOMMIT = FALSE');
//     }
// }
// async function setAutoCommit() {
//     const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
//     if (data[0].rt == 0) {
//         const rv = await db.execute('SET AUTOCOMMIT = TRUE');
//     }
// }
function addEditCol(data) {	
	data.f_edit = '0';	
    data.f_editold = '0';	
	return data;
}
function objectSplit(data, f) {	
    const obj = {};
    if ( f === 'M' || f === 'm' ) {
        const objKeys = Object.keys(data).filter((key) => isNaN(key));
        const values = objKeys.map((key) => data[key]);
        for (let i = 0; i < objKeys.length; i++) {
            obj[objKeys[i]] = values[i];
        }
        return obj;
    } else {        
        const objKeys = Object.keys(data).filter((key) => !isNaN(key));
        const objValues = objKeys.map((key) => data[key]);
        return objValues;
    }    
}
const salesModel = {
    async getSaleEstimateInit(req) {
        if (req.user.c_com != req.query.c_com) { throw new Error('권한이 없습니다.'); }  
        
        const {c_com, c_gcode, c_code, col } = req.query;
        const sort = {s_sort: true, c_code: true};
        const sql = c_code !== undefined ? sqlHelper.SelectSimple(TABLE.COMCODE, {c_com, c_gcode, c_code}, [col], sort) : sqlHelper.SelectSimple(TABLE.COMCODE, {c_com, c_gcode}, [col], sort);
        const [rows] = await db.execute(sql.query, sql.values);        

        console.log("getSaleEstimateInit", sql);
        return rows;

    },
    async getSaleEstimate(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   

        const { c_com } = req.user;
        const { sDate1, sDate2, sEsimate, sVend, sStatus} = req.body;
        let where = `SELECT * FROM tb_estimate \n WHERE c_com = ? and f_use = 'Y' \n `
        var values = new Array();
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and s_date <= ? \n `
            values.push(sDate2);
        }
        if (sEsimate.length > 0) {
            where += ` and i_estno like ? \n `
            values.push(sEsimate + '%');
        }
        if (sVend.length > 0) {
            where += ` and n_vend like ? \n `
            values.push(sVend + '%');
        }
        if (sStatus.length > 0) {
            where += ` and f_status = ? \n `
            values.push(sStatus);
        }
        where += ` ORDER BY c_com, i_ser `;
        
        console.log('getSaleEstimate', where, values);
        // const sql = sqlHelper.SelectSimple(TABLE.ESTIMATE, { c_com, f_use:'Y' });     
        const [rows] = await db.execute(where, values);        

        rows.forEach((row) => {
            addEditCol(row);
        });        
        return rows;         
    },
    async getSaleEstimateLi(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sEsimate, sVend, sStatus} = req.body;
        var values = new Array();
        let where = "";
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and t.s_date between ? and ? `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and t.s_date >= ? `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and t.s_date <= ? `
            values.push(sDate2);
        }
        if (sEsimate.length > 0) {
            where += ` and t.i_estno like ? `
            values.push(sEsimate + '%');
        }
        if (sVend.length > 0) {
            where += ` and t.n_vend like ? `
            values.push(sVend + '%');
        }
        if (sStatus.length > 0) {
            where += ` and t.f_status = ? `
            values.push(sStatus);
        }

        // const sql = sqlHelper.SelectSimple(TABLE.ESTIMATELI, { c_com });
        // sql.query = sql.query + ` AND EXISTS (SELECT * FROM tb_estimate t WHERE t.c_com = tb_estimateli.c_com and t.f_use = 'Y') `
        let query = `SELECT * FROM tb_estimateli \n ` +
                    ` WHERE c_com = ? \n ` +
                    `   AND EXISTS (SELECT * FROM tb_estimate t WHERE tb_estimateli.c_com = t.c_com and tb_estimateli.i_ser = t.i_ser and t.f_use = 'Y' ${where})` 
        console.log("getSaleEstimateLi\n", query , values);
        const [rows] = await db.execute(query, values);
        rows.forEach((row) => {
            addEditCol(row);
        })
        return rows;
    },
    async iuSaleEstimate(req) {
        const payload = {
			...req.body,
        }
        const at = moment().format('LT'); 
        // f_edit =  0:변경없음, 1:수정, 2:삭제
        const master = objectSplit(req.body, 'm');
        const detail = objectSplit(req.body, 'd');        
        // console.log(req.body)
        // console.log(master)
        // console.log(detail)
        
        const {c_com, i_ser } = master;
        
        if (master.f_edit !== "0" || master.f_editold !== "0") {                        
            const newdata = master.f_editold !== "0" ? true : false;
            delete master.f_edit;
            delete master.f_editold;

            if (!master.n_crnm) {
                delete master.d_create_at;
                delete master.n_crnm;
                master.d_update_at = at;
                master.n_upnm = req.user.n_name;
            } else {
                master.d_create_at = at;
                master.n_crnm = req.user.n_name;                
                delete master.d_update_at;
                delete master.n_upnm;
            }
            const sql = newdata ? sqlHelper.Insert(TABLE.ESTIMATE, master) : sqlHelper.Update(TABLE.ESTIMATE, master, {c_com, i_ser});

            console.log("master", sql)      
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return -1;            
        }
        await db.execute('COMMIT');
        detail.forEach((row, index) => {
            if(row.f_edit !== "0" || row.f_editold !== "0") {
                const {i_serno} = row;
                const newdata = row.f_editold !== "0" ? true : false;
                const deldata = row.f_edit == "2" ? true : false;
                delete row.f_edit;
                delete row.f_editold;
                if (!row.n_crnm) {
                    delete row.d_create_at;
                    delete row.n_crnm;
                    row.d_update_at = at;                   
                    row.n_upnm = req.user.n_name;
                } else {
                    row.d_create_at = at;
                    row.n_crnm = req.user.n_name;
                    delete row.d_update_at;
                    delete row.n_upnm;
                }
                const sql = deldata ? sqlHelper.DeleteSimple(TABLE.ESTIMATELI, {c_com, i_ser, i_serno}) :  newdata ? sqlHelper.Insert(TABLE.ESTIMATELI, row) : sqlHelper.Update(TABLE.ESTIMATELI, row, {c_com, i_ser, i_serno});
                
                console.log("detial", sql);
                // const [row] = await db.execute(sql.query, sql.values);
                const res = sqlDbExecute(sql)    
                if (res.affectedRows < 1) return index + 1;
            }
        })
        await db.execute('COMMIT');
        return 0;
    },
    async delSaleEstimate(req) {
		if (!isGrant(req, LV.BUSINESS))  throw new Error('권한이 없습니다.');
		const { c_com, i_ser } = req.params;
             
        // f_use = 'N' 처리 과거 이력 확인을 위해 서
        var query = "UPDATE tb_estimate SET f_use = 'N' WHERE c_com = ? AND i_ser = ?";
        var values = new Array();
        values.push(c_com, i_ser);
        const [row] = await db.execute(query, values);

        // const sql = sqlHelper.DeleteSimple(TABLE.ESTIMATE, { c_com, i_ser });
        // const [row] = await db.execute(sql.query, sql.values);

        // 견적 폼목 List 삭제
        // if (row.affectedRows > 0) {
        //     const sqldt = sqlHelper.DeleteSimple(TABLE.ESTIMATELI, { c_com, i_ser });
        //     await db.execute(sqldt.query, sqldt.values);
        // }
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},

    async getSaleEstimateList(req) {
        
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        let query = `select a.c_com, a.i_ser, b.i_serno, a.i_estno, a.f_status, a.n_vend, a.s_date, a.n_magname, \n` +
                    `       b.c_item, b.n_item, b.t_size, b.i_type, b.m_cnt, b.a_unit, b.a_amt, b.s_duedate \n` +
                    `  from tb_estimate a \n` +
                    `       join tb_estimateli b on a.c_com = b.c_com and a.i_ser = b.i_ser \n` +
                    ` where a.c_com = ? \n`;
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
        query += ` order by a.i_estno, a.i_ser, b.s_sort`;
        const [rows] = await db.execute(query, values);    
        return rows;
        
    },

    async getSaleOrder(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   

        const { c_com } = req.user;
        const { sDate1, sDate2, sOrder, sVend } = req.body;
        let where = `SELECT * FROM tb_order \n WHERE c_com = ? and f_order = 'O' \n `
        var values = new Array();
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and s_date <= ? \n `
            values.push(sDate2);
        }
        if (sOrder.length > 0) {
            where += ` and i_orderno like ? \n `
            values.push(sOrder + '%');
        }
        if (sVend.length > 0) {
            where += ` and n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` ORDER BY c_com, i_order `;
        
        console.log(where, values);        
        const [rows] = await db.execute(where, values);        

        rows.forEach((row) => {
            addEditCol(row);
        });        
        return rows;         
    },
    async getSaleOrderLi(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sOrder, sVend } = req.body;
        var values = new Array();
        let where = "";
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and t.s_date between ? and ? `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and t.s_date >= ? `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and t.s_date <= ? `
            values.push(sDate2);
        }
        if (sOrder.length > 0) {
            where += ` and t.i_order like ? `
            values.push(sOrder + '%');
        }
        if (sVend.length > 0) {
            where += ` and t.n_vend like ? `
            values.push(sVend + '%');
        }
      
        let query = `SELECT * FROM tb_orderli \n ` +
                    ` WHERE c_com = ? \n ` +
                    `   AND EXISTS (SELECT * FROM tb_order t WHERE tb_orderli.c_com = t.c_com and t.f_order = 'O' and tb_orderli.i_order = t.i_order ${where})` 
        console.log("getSaleOrderLi\n", query , values);
        const [rows] = await db.execute(query, values);
        rows.forEach((row) => {
            addEditCol(row);
        })
        return rows;
    },
    async iuSaleOrder(req) {
        const payload = {
			...req.body,
        }
        const at = moment().format('LT'); 
        // f_edit =  0:변경없음, 1:수정, 2:삭제
        const master = objectSplit(req.body, 'm');
        const detail = objectSplit(req.body, 'd');        
        
        const {c_com, i_order } = master;
        
        if (master.f_edit !== "0" || master.f_editold !== "0") {                        
            const newdata = master.f_editold !== "0" ? true : false;            
            delete master.f_edit;
            delete master.f_editold;
            
            if (newdata) {                
                delete master.d_update_at;
                delete master.n_upnm;
                master.d_create_at = at;
                master.n_crnm = req.user.n_name;
                master.f_status = 'S';                
            } else {
                console.log('수정')
                master.d_update_at = at;
                master.n_upnm = req.user.n_name;
                delete master.d_create_at;
                delete master.n_crnm;
            }
            const sql = newdata ? sqlHelper.Insert(TABLE.ORDER, master) : sqlHelper.Update(TABLE.ORDER, master, {c_com, i_order});

            console.log("master", sql)      
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return -1; 
            await db.execute('COMMIT');           
        }
        
        for (let i = 0; i < detail.length; i++) {
            if(detail[i].f_edit !== "0" || detail[i].f_editold !== "0") {
                const row = { ...detail[i], }
                const {i_orderser} = row;
                const newdata = row.f_editold !== "0" ? true : false;
                const deldata = row.f_edit == "2" ? true : false;
                delete row.f_edit;
                delete row.f_editold;
                if (newdata) {
                    delete row.d_update_at;
                    delete row.n_upnm;
                    row.d_create_at = at;
                    row.n_crnm = req.user.n_name;
                } else {
                    row.d_update_at = at;
                    row.n_upnm = req.user.n_name;
                    delete row.d_create_at;
                    delete row.n_crnm;
                }
                delete row.d_plan_at;
                delete row.d_work1_at; 
                delete row.d_work3_at; 
                delete row.d_work4_at;
                delete row.d_work5at;
                const sql = deldata ? sqlHelper.DeleteSimple(TABLE.ORDERLI, {c_com, i_order, i_orderser}) : newdata ? sqlHelper.Insert(TABLE.ORDERLI, row) : sqlHelper.Update(TABLE.ORDERLI, row, {c_com, i_order, i_orderser});
                
                console.log("detial", sql);                
                const res = await db.execute(sql.query, sql.values);      
                if (res.affectedRows < 1) return index + 1;
            }
            await db.execute('COMMIT');
        }

        await db.execute('COMMIT');
        return 0;
    },
    async delSaleOrder(req) {
		if (!isGrant(req, LV.BUSINESS))  throw new Error('권한이 없습니다.');
		const { c_com, i_order } = req.params;

        const sql = sqlHelper.DeleteSimple(TABLE.ORDER, { c_com, i_order });
        const [row] = await db.execute(sql.query, sql.values);

        // 수주 폼목 List 삭제
        if (row.affectedRows > 0) {
            const sqldt = sqlHelper.DeleteSimple(TABLE.ORDERLI, { c_com, i_order });
            await db.execute(sqldt.query, sqldt.values);
        }
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},

    async getSaleOrderslist(req) {        
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        let query = `select a.c_com, a.i_order, b.i_orderser, \n` +
                    `       a.n_vend,  a.i_orderno, a.n_order, a.f_status, a.s_date, b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.a_unit, b.a_amt, b.s_duedate \n` +
                    `  from tb_order a \n` +
                    `       join tb_orderli b on a.c_com = b.c_com and a.i_order = b.i_order \n` +
                    ` where a.c_com = ? \n`;
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
        query += `  order by a.c_com, a.i_order, b.i_orderser`;
        const [rows] = await db.execute(query, values);    
        return rows;
        
    },

    async getSaleNotInsertOrder(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   

        const { c_com } = req.user;
        let where = `SELECT a.i_ser, a.c_com, a.i_estno, a.c_vend, a.n_vend, a.n_estnm, a.s_date, a.s_date3, a.a_estamt, \n ` +
                    `       c.n_compnay, c.n_ceo, c.i_company, c.t_job1, c.t_job2, c.t_tel, c.t_fax, c.e_mail, c.t_addr, \n ` +
                    `       b.i_serno, b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.a_unit, b.a_amt, b.s_duedate, b.t_remark \n ` +
                    `  FROM tb_estimate a \n ` +
                    `        join tb_estimateli b on a.i_ser = b.i_ser AND a.c_com = b.c_com \n ` +
                    `        join tb_vend c on a.c_com = c.c_com and a.c_vend = c.c_vend \n ` +
                    ` WHERE a.c_com = ? AND a.f_status = 'A' AND a.f_use = 'Y' \n ` +
                    `  AND NOT EXISTS (SELECT * FROM tb_order t where t.i_estno = a.i_ser) \n ` +
                    ` ORDER BY b.s_sort   \n `;
        let values = new Array();
        values.push(c_com);
        const [rows] = await db.execute(where, values);
        return rows;
    }

}

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

module.exports = salesModel;
const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');


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
        console.log(rows);
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
        
        console.log(where, values);
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
                    `   AND EXISTS (SELECT * FROM tb_estimate t WHERE tb_estimateli.c_com = t.c_com and t.f_use = 'Y' ${where})` 
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
        
        detail.forEach((row, index) => {
            if(row.f_edit !== "0" || row.f_editold !== "0") {
                const {i_serno} = row;
                const newdata = row.f_editold !== "0" ? true : false;
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
                const sql = newdata ? sqlHelper.Insert(TABLE.ESTIMATELI, row) : sqlHelper.Update(TABLE.ESTIMATELI, row, {c_com, i_ser, i_serno});
                
                console.log("detial", sql);
                // const [row] = await db.execute(sql.query, sql.values);
                const res = iuSaleEstimate_dt(sql)    
                if (res.affectedRows < 1) return index + 1;
            }
        })
        return 0;
    },
}

async function iuSaleEstimate_dt(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

module.exports = salesModel;
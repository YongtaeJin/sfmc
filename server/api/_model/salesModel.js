const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');


function addEditCol(data) {	
	data.f_edit = '0';	
	return data;
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

        console.log(req.body);
        
        const { c_com } = req.user;
        // const { search } = req.query;
        const sql = sqlHelper.SelectSimple(TABLE.ESTIMATE, { c_com, f_use:'Y' });     
        const [rows] = await db.execute(sql.query, sql.values);        

        console.log(sql);
        rows.forEach((row) => {
            addEditCol(row);
        });        
        return rows;         
    },
    async getSaleEstimateLi(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   
        
        const { c_com } = req.user;
        // const { search } = req.query;
        const sql = sqlHelper.SelectSimple(TABLE.ESTIMATELI, { c_com });     
        // ${TABLE.SEND_MAIL}
        sql.query = sql.query + ` AND EXISTS (SELECT * FROM tb_estimate t WHERE t.c_com = tb_estimateli.c_com and t.f_use = 'Y') `
        const [rows] = await db.execute(sql.query, sql.values);        

        console.log("getSaleEstimateLi", sql);
        rows.forEach((row) => {
            addEditCol(row);
        })
        return rows;
    },
}

module.exports = salesModel;
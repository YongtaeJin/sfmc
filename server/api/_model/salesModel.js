const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');

const salesModel = {
    async getSaleEstimate(req) {     
        // 권한 확인
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   
        
        const { c_com } = req.user;
        // const { search } = req.query;
        const sql = sqlHelper.SelectSimple(TABLE.ESTIMATE, { c_com, f_use:'Y' });     
        const [rows] = await db.execute(sql.query, sql.values);        

        console.log(sql);
        return rows;
    },
}

module.exports = salesModel;
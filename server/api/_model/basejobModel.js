const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { getIp } = require('../../../util/lib');
const { query } = require('express');

async function getDefaultMemberLevel() {
	const sql = "select replace(now(3)+0, '.', '') tstamp";
	const [[{ tstamp }]] = await db.execute(sql);
	
	return tstamp;
}

const basejobModel = {
    async getBaseJobVned(req) {     
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) {
            throw new Error('권한이 없습니다.');
        }   
        const { c_com } = req.user;
        const sort = {s_sort: true, c_vend: true};
        const sql = sqlHelper.SelectSimple(TABLE.VEND, { c_com }, [], sort);          
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;
    },
    async duplicateVendCheck({ c_com, value1, c_vend, value2 }) {
        const sql = sqlHelper.SelectSimple(
			TABLE.VEND,
			{ [c_com]: value1, [c_vend]: value2 },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },   
    async delBaseVned(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_vend } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.VEND, { c_com, c_vend });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},
    async iuBaseVend(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com } = payload;          
        var c_vend = "";
        if (!payload.c_vend) {
            c_vend = await getDefaultMemberLevel();            
        } else {
            c_vend = payload.c_vend;
        }
      
        if (!payload.c_vend) { 
            // delete payload.c_vend;
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            payload.c_vend = c_vend;
            
            const sql = sqlHelper.Insert(TABLE.VEND, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.VEND, payload, {c_com, c_vend});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const vendsql = sqlHelper.SelectSimple(TABLE.VEND,{ c_com,  c_vend });
        const [[vend]] = await db.execute(vendsql.query, vendsql.values);
        return vend;
    },
}
module.exports = basejobModel;
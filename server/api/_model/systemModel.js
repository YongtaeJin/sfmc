const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { getIp } = require('../../../util/lib');
const { query } = require('express');

function clearUserField(user) {
	delete user.p_password;
    
    if (user.d_login_at) user.d_login_at = moment(user.d_login_at).format('LT');
    user.d_create_at = moment(user.d_create_at).format('LT');
    if (user.d_update_at) user.d_update_at = moment(user.d_update_at).format('LT');
    if (user.d_leave_at) user.d_leave_at = moment(user.d_leave_at).format('LT');
	
	return user;
}

const systemModel = {
    async getWorkSite(req) {     
        // 권한 확인
        if (!isGrant(req, LV.SUPER)) {
            throw new Error('권한이 없습니다.');
        }   
        const sql = sqlHelper.SelectSimple(TABLE.WORKSITE);        
        const [rows] = await db.execute(sql.query, sql.values);
        return rows;
    },
    async duplicateCheck({ field, value }) {
        const sql = sqlHelper.SelectSimple(
			TABLE.WORKSITE,
			{ [field]: value },
			['COUNT(*) AS cnt']
		);       
		const [[row]] = await db.execute(sql.query, sql.values);
		return row;
    },
    async duplicateDualCheck({ com, aFiled, field, value }) {
        const sql = sqlHelper.SelectSimple(
			TABLE.WORKSITE,
			{ [com]: aFiled, [field]: value },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },    
    async insertWorksite(req) {
        const at = moment().format('LT')
        const payload = {
			...req.body,
        }
        payload.d_create_at = at;
        delete payload.d_update_at;
        payload.f_use == 'N' ? payload.d_leave_at = at :  delete payload.d_leave_at;

        const sql = sqlHelper.Insert(TABLE.WORKSITE, payload);
        const [row] = await db.execute(sql.query, sql.values);
        if (row.affectedRows == 1) {
            payload.p_password = jwt.generatePassword(payload.p_pw);;
            payload.i_level = 9;
            payload.d_update_at = at;
            payload.t_create_ip = getIp(req);

            delete payload.n_com;
            delete payload.p_pw;
            const sql2 = sqlHelper.Insert(TABLE.USERS, payload);
            const [row2] = await db.execute(sql2.query, sql2.values);
        } 

        return row.affectedRows == 1;                
    },
    async updateWorksite(req) {
        const at = moment().format('LT')        
        const payload = {
			...req.body,
        }
        delete payload.d_create_at;
        if (payload.f_use == 'N') {
            payload.d_leave_at = at;
        } else {
            payload.d_leave_at = null;         
        }        
        payload.d_update_at = at;
        const { c_com, i_id } = payload
        const sql = sqlHelper.Update(TABLE.WORKSITE, payload, {c_com, i_id});
        const [row] = await db.execute(sql.query, sql.values);
        if (row) {
            // tb_users UPDATE 처리
            payload.p_password = jwt.generatePassword(payload.p_pw);;
            delete payload.n_com;
            delete payload.p_pw;
          
            const sql2 = sqlHelper.Update(TABLE.USERS, payload, {c_com, i_id});
            const [row2] = await db.execute(sql2.query, sql2.values);
        }
        return row;
    },
    
    // 사업장별 사용자 관리
    async worksiteusers(req) {     
        // 권한 확인
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        
        const { c_com } = req.user;
        const sql = sqlHelper.SelectSimple(TABLE.USERS, { c_com });
        const [rows] = await db.execute(sql.query, sql.values);

        rows.forEach((row) => {
            clearUserField(row);
        });        
        return rows;
    },
    async iuWorkUser(req) {
        const at = moment().format('LT');        
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        const payload = {
			...req.body,
        }
        const {c_com, i_id } = payload;        
        if (payload.p_password) payload.p_password = jwt.generatePassword(payload.p_password);
        delete payload.d_leave_at;
        if (!payload.d_create_at) { 
            payload.d_create_at = at;
            payload.d_update_at = at;
            payload.t_create_ip = getIp(req);
            
            const sql = sqlHelper.Insert(TABLE.USERS, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.t_update_ip = getIp(req);
            delete payload.d_create_at;
            delete payload.t_create_ip;
            

            const sql = sqlHelper.Update(TABLE.USERS, payload, {c_com, i_id});
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }

        const usersql = sqlHelper.SelectSimple(TABLE.USERS,{ c_com,  i_id });
        const [[user]] = await db.execute(usersql.query, usersql.values);
        
        return clearUserField(user);
    },

    async delWorkUser(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, i_id } = req.params;
        const sql = sqlHelper.DeleteSimple(TABLE.USERS, { c_com, i_id });
		const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	}
};

module.exports = systemModel;
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
        sql.query = sql.query + ' and d_leave_at is null '
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
        const field = { d_leave_at : moment().format('LT')};
        
        const sql = sqlHelper.Update(TABLE.USERS, field, { c_com, i_id });        
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},

    // 시스템코드 관리
    async grpcode(req) {     
        // 권한 확인
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        
        const { c_com } = req.user;
        const sort = {s_sort: true, c_gcode: true};

        const sql = sqlHelper.SelectSimple(TABLE.GRPCODE, { c_com }, [], sort);    
        const [rows] = await db.execute(sql.query, sql.values);
    
        return rows;
    },
    async comcode(req) {     
        // 권한 확인
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        
        const { c_com } = req.user;
        const sort = {s_sort: true, c_code: true};
        const sql = sqlHelper.SelectSimple(TABLE.COMCODE, { c_com }, [], sort);    
        const [rows] = await db.execute(sql.query, sql.values);
    
        return rows;
    },
    async duplicateGrpcodeCheck({ com, value1, grp, value2 }) {
        const sql = sqlHelper.SelectSimple(
			TABLE.GRPCODE,
			{ [com]: value1, [grp]: value2 },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async duplicateComcodeCheck({ com, value1, grp, value2, cod, value3 }) {
        const sql = sqlHelper.SelectSimple(
			TABLE.COMCODE,
			{ [com]: value1, [grp]: value2, [cod]: value3 },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    }, 

    async iuGprCode(req) {
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com, c_gcode } = payload;          
        if (!payload.d_create_at) { 
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.GRPCODE, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.GRPCODE, payload, {c_com, c_gcode});
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const grpsql = sqlHelper.SelectSimple(TABLE.GRPCODE,{ c_com,  c_gcode });
        const [[grpcode]] = await db.execute(grpsql.query, grpsql.values);
        return grpcode;
    },
    async delGprCode(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, c_gcode } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.GRPCODE, { c_com, c_gcode });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},

    async iuComCode(req) {
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com, c_gcode, c_code } = payload; 
        
        delete payload.d_buf1;
        delete payload.d_buf3;
        delete payload.d_buf2;
        delete payload.t_buf1;
        delete payload.t_buf2;
        delete payload.t_buf3;

        if (!payload.d_create_at) { 
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            delete payload.d_update_at;
            delete payload.n_upnm;   

            const sql = sqlHelper.Insert(TABLE.COMCODE, payload);
            const [row] = await db.execute(sql.query, sql.values);       
            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.COMCODE, payload, {c_com, c_gcode, c_code});
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const comsql = sqlHelper.SelectSimple(TABLE.COMCODE,{ c_com, c_gcode, c_code });
        const [[comcode]] = await db.execute(comsql.query, comsql.values);
        return comcode;
    },
    async delComCode(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, c_gcode, c_code } = req.params;
        
        const sql = sqlHelper.DeleteSimple(TABLE.COMCODE, { c_com, c_gcode, c_code });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},

    async getCodeList(req) {
        const { c_com, c_gcode } = req.query;       
        const sort = {s_sort: true, c_code: true};
        const sql = sqlHelper.SelectSimple(TABLE.COMCODE, { c_com, c_gcode }, [ 'c_code', 'n_code', 's_sort' ], sort);
        const [rows] = await db.execute(sql.query, sql.values);    
        return rows;
    },

    async getUnitPop(req) {
        if (req.user.c_com != req.query.c_com) { throw new Error('권한이 없습니다.'); }  
		const { c_com } = req.user;
        
        var query = `SELECT a.c_item, a.n_item, a.t_size, a.i_unit, c1.n_code n_unit, a.i_type, c2.n_code n_type, a.a_sell ` +
                    `    FROM tb_item a ` +
                    `         left outer join tb_comcode c1 on a.c_com = c1.c_com and a.i_unit = c1.c_code and c1.c_gcode = 'UNIT' ` +
                    `         left outer join tb_comcode c2 on a.c_com = c2.c_com and a.i_type = c2.c_code and c2.c_gcode = 'ITEMTYPE' ` +
                    ` WHERE a.c_com = ? ` +
                    `   AND a.f_use = 'Y' ` +
                    ` ORDER BY a.s_sort  `;
        var values = new Array();
        values.push(c_com);
        const [rows] = await db.execute(query, values);    
        return rows;
    }
 
};

module.exports = systemModel;
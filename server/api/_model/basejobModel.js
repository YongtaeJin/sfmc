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
function addIDProcesstypeLi(ptypeli) {	
    ptypeli.c_id = ptypeli.c_ptype + '_' + ptypeli.c_process;	
	return ptypeli;
}

const basejobModel = {
    async getBaseJobVned(req) {     
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) {
            throw new Error('권한이 없습니다.');
        }   
        const { search } = req.query        
        const { c_com } = req.user;
        const sql = sqlHelper.SelectSimple(TABLE.VEND, { c_com });
        if (search) {
            sql.query = sql.query + ` and (n_vend like '${search}%' or n_compnay like '${search}%') `;
        }
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_vend ASC `;
        
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

    // ITEM 관리
    async getBaseItem(req) {     
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) {
            throw new Error('권한이 없습니다.');
        }   
        const { search } = req.query        
        const { c_com } = req.user;                
        const sql = sqlHelper.SelectSimple(TABLE.ITEM, { c_com });
        if (search) {
            sql.query = sql.query + ` and (c_item like '${search}%' or n_item like '${search}%') `;
        }
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_item ASC `;
        
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;
    },
    async duplicateItemCheck(req) {
        const { c_com } = req.user;
        const { c_item, value } = req.params;
        const sql = sqlHelper.SelectSimple(
			TABLE.ITEM,
			{ c_com, [c_item]: value },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async delBaseItem(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_item } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.ITEM, { c_com, c_item });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},
    async iuBaseItem(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }        
        const {c_com, c_item } = payload;        
        if (!payload.n_crnm) { 
            // delete payload.c_vend;
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.ITEM, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.ITEM, payload, {c_com, c_item});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const itemsql = sqlHelper.SelectSimple(TABLE.ITEM,{ c_com,  c_item });
        const [[item]] = await db.execute(itemsql.query, itemsql.values);
        return item;
    },

    // 공정관리 관리
    async getBaseProcess(req) {     
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
        const { search } = req.query        
        const { c_com } = req.user;                
        const sql = sqlHelper.SelectSimple(TABLE.PROCESS, { c_com });
        if (search) {
            sql.query = sql.query + ` and (c_process like '${search}%' or n_process like '${search}%') `;
        }
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_process ASC `;
        
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;
    },
    async duplicateProcessCheck(req) {
        const { c_com } = req.user;
        const { c_process, value } = req.params;
        const sql = sqlHelper.SelectSimple(
			TABLE.PROCESS,
			{ c_com, [c_process]: value },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async delBaseProcess(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_process } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.PROCESS, { c_com, c_process });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},
    async iuBaseProcess(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com, c_process } = payload;        
        if (!payload.n_crnm) {             
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.PROCESS, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.PROCESS, payload, {c_com, c_process});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const itemsql = sqlHelper.SelectSimple(TABLE.PROCESS,{ c_com,  c_process });
        const [[item]] = await db.execute(itemsql.query, itemsql.values);
        return item;
    },
    async getProcessItem(req) {     
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
        const { c_com } = req.user;                
        const sql = sqlHelper.SelectSimple(TABLE.PROCESS, { c_com, f_use: 'Y'}, ['s_sort', 'c_process', 'n_process', 'f_outside']);
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_process ASC `;        
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;
    },

    // 공정유형 관리          
    async getBaseProcesstype(req) {   
        // 권한 확인
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
        const { search } = req.query        
        const { c_com } = req.user;                
        const sql = sqlHelper.SelectSimple(TABLE.PROCESSTYPE, { c_com });
        if (search) {
            sql.query = sql.query + ` and (c_ptype like '${search}%' or n_ptype like '${search}%') `;
        }
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_ptype ASC `;
        
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;
    },
    async duplicateProcesstypeCheck(req) {
        const { c_com } = req.user;
        const { c_ptype, value } = req.params;
        const sql = sqlHelper.SelectSimple(
			TABLE.PROCESSTYPE,
			{ c_com, [c_ptype]: value },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async delBaseProcesstype(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_ptype } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.PROCESSTYPE, { c_com, c_ptype });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},
    async iuBaseProcesstype(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com, c_ptype } = payload;        
        if (!payload.n_crnm) {             
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.PROCESSTYPE, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            

            const sql = sqlHelper.Update(TABLE.PROCESSTYPE, payload, {c_com, c_ptype});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const itemsql = sqlHelper.SelectSimple(TABLE.PROCESSTYPE,{ c_com,  c_ptype });
        const [[item]] = await db.execute(itemsql.query, itemsql.values);
        return item;
    },

    async getBaseProcesstypeLi(req) {     
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
        const { c_com } = req.user;                
        const sql = sqlHelper.SelectSimple(TABLE.PROCESSTYPELIST, { c_com });
        sql.query = sql.query + ` ORDER BY s_sort ASC , c_process ASC `;
        
        const [rows] = await db.execute(sql.query, sql.values);        
        rows.forEach((row) => {
            addIDProcesstypeLi(row);
        });        
        return rows;        
    },
    async duplicateProcesstypeCheckLi(req) {
        const { c_com } = req.user;
        const { c_col1, value1, c_col2, value } = req.params;
        const sql = sqlHelper.SelectSimple(
			TABLE.PROCESSTYPELIST,
			{ c_com, [c_col1]: value1, [c_col2]: value},
			['COUNT(*) AS cnt']
		);
        
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async delBaseProcesstypeLi(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_ptype, c_process } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.PROCESSTYPELIST, { c_com, c_ptype, c_process });
        const [row] = await db.execute(sql.query, sql.values);		
		return row.affectedRows == 1;
	},
    async iuBaseProcesstypeLi(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        delete payload.c_id;
        const {c_com, c_ptype, c_process } = payload;        
        if (!payload.n_crnm) {             
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.PROCESSTYPELIST, payload);
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return '';                        
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;            
            
            const sql = sqlHelper.Update(TABLE.PROCESSTYPELIST, payload, {c_com, c_ptype, c_process});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return '';            
        }
        const itemsql = sqlHelper.SelectSimple(TABLE.PROCESSTYPELIST,{ c_com,  c_ptype, c_process });
        const [[item]] = await db.execute(itemsql.query, itemsql.values);
        return addIDProcesstypeLi(item);
    },
}
module.exports = basejobModel;

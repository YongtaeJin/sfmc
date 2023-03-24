const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { getIp } = require('../../../util/lib');
const jwt = require('../../plugins/jwt');

const companyModel = {
    async getCompany(req) {
        const { all } = req.query;
        
		let where = {};
        const sort = {
            i_com: true,
            n_com: true,
        };		
        const sql = sqlHelper.SelectSimple(TABLE.COMPANY, where, [], sort);
		const [rows] = await db.execute(sql.query, sql.values);
		return rows;
    },
    async createCompany(req) {
        const payload = {
			...req.body,
        };
        const i_com = payload.i_com;        
        const sql = sqlHelper.Insert(TABLE.COMPANY, payload);
		const [row] = await db.execute(sql.query, sql.values);  
        if(row.affectedRows == 1) {
            return await companyModel.getCompanyBy({ i_com });
        }
    },
    async updateCompany(req) {
        const payload = {
			...req.body,            
        };
        const i_com = payload.i_com;        
        const sql = sqlHelper.Update(TABLE.COMPANY, payload, {i_com});
		const [row] = await db.execute(sql.query, sql.values);
		return await companyModel.getCompanyBy( {i_com} );
    },
    async getCompanyBy(form, cols = []) {
        const sql = sqlHelper.SelectSimple(TABLE.COMPANY, form, cols);
		const [[row]] = await db.execute(sql.query, sql.values);
		if (!row) {
			throw new Error('존재하지 않는 사업장 입니다..');
		};
        return row;
    },
    async duplicateCheckCompany({ field, value }) {
		const sql = sqlHelper.SelectSimple(
			TABLE.COMPANY,
			{ [field]: value },
			['COUNT(*) as cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);        
		return row;
	},

    async getCompanyList(req) {
        var sql = "select i_com, n_com from tb_company order by i_com";
        const [rows] = await db.execute(sql, []);        
		return rows;

    },
    async getCompanyUsers(req) {
        const { all } = req.query;
        
		let where = {};
        const sort = {
            i_com: true,            
        };		
        const sql = sqlHelper.SelectSimple(TABLE.USERS, where, [], sort);
		const [rows] = await db.execute(sql.query, sql.values);
		return rows;
    },
    async createUser(req) {
        const at = moment().format('LT');
		const ip = getIp(req);

		const payload = {
			...req.body,		
            d_create_at: at,	
            d_update_at: at,
		} 
        
        if(payload.i_password) {
			payload.i_password = jwt.generatePassword(payload.i_password);            
		} else {
			delete payload.i_password;
		}
                
        const sql = sqlHelper.Insert(TABLE.USERS, payload);
        const [row] = await db.execute(sql.query, sql.values);

        const i_com = payload.i_com;
        const i_id =  payload.i_id;
        if(row.affectedRows == 1) {
            return await companyModel.getCompanyUser({ i_com, i_id });
        }
    },
    async updateUser(req) {
        const at = moment().format('LT');
		const ip = getIp(req);
        
        const payload = {
			...req.body,	
            d_update_at: at,		
		}        
        const i_com = payload.i_com;
        const i_id =  payload.i_id;
        
        // 수정
        if(payload.i_password) {
            payload.i_password = jwt.generatePassword(payload.i_password);            
        } else {
            delete payload.i_password;
        }        
        delete payload.d_create_at;
        delete payload.d_leave_at;            

        const sql = sqlHelper.Update(TABLE.USERS, payload, {i_com, i_id});
        const [row] = await db.execute(sql.query, sql.values);
        if(row.affectedRows == 1) {
            return await companyModel.getCompanyUser({ i_com, i_id });
        }
        
    },
    
    async getCompanyUser(form, cols = []) {
        const sql = sqlHelper.SelectSimple(TABLE.USERS, form, cols);
		const [[row]] = await db.execute(sql.query, sql.values);
		if (!row) {
			throw new Error('존재하지 않는 사용자 입니다..');
		};
        return row;
    },

    async deleteUser(req) {
        const payload = {
			...req.body,           
		} 
        const i_com = payload.i_com;
        const i_id =  payload.i_id;
        
        const sql = sqlHelper.DeleteSimple(TABLE.USERS, {i_com, i_id});
        const [row] = await db.execute(sql.query, sql.values);       
        
        return row.affectedRows;
    },

    async duplicateCheckId({ field, value }) {
		const sql = sqlHelper.SelectSimple(
			TABLE.USERS,
			{ [field]: value },
			['COUNT(*) as cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);        
		return row;
	},
    
}
module.exports = companyModel;
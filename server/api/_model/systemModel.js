const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { getIp } = require('../../../util/lib');
const { query } = require('express');
const path = require('path');

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
            delete payload.i_company;
            delete payload.i_kpikey;
            delete payload.f_kpichk;
            delete payload.n_kpiconm;
            delete payload.t_monitor;
            delete payload.t_worklog;
            delete payload.t_worksign;
            const sql2 = sqlHelper.Insert(TABLE.USERS, payload);
            const [row2] = await db.execute(sql2.query, sql2.values);
        } 
        await db.execute('COMMIT');
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
            delete payload.i_company;
            delete payload.i_kpikey;
            delete payload.f_kpichk;
            delete payload.n_kpiconm;
            delete payload.t_monitor;
            delete payload.t_worklog;
            delete payload.t_worksign;
          
            const sql2 = sqlHelper.Update(TABLE.USERS, payload, {c_com, i_id});
            const [row2] = await db.execute(sql2.query, sql2.values);
        }
        await db.execute('COMMIT');
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
        await db.execute('COMMIT');
        return clearUserField(user);
    },

    async delWorkUser(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, i_id } = req.params;
        const field = { d_leave_at : moment().format('LT')};
        
        const sql = sqlHelper.Update(TABLE.USERS, field, { c_com, i_id });        
        const [row] = await db.execute(sql.query, sql.values);
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},

    // 시스템코드 관리
    async grpcode(req) {     
        // 권한 확인
        // console.log(req.user)
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
        await db.execute('COMMIT');
        return grpcode;
    },
    async delGprCode(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, c_gcode } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.GRPCODE, { c_com, c_gcode });
        const [row] = await db.execute(sql.query, sql.values);
        await db.execute('COMMIT');
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
        await db.execute('COMMIT');
        return comcode;
    },
    async delComCode(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, c_gcode, c_code } = req.params;
        
        const sql = sqlHelper.DeleteSimple(TABLE.COMCODE, { c_com, c_gcode, c_code });
        const [row] = await db.execute(sql.query, sql.values);
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},

    async getCodeList(req) {
        const { c_com, c_gcode } = req.query;       
        const sort = {s_sort: true, c_code: true};
        const sql = sqlHelper.SelectSimple(TABLE.COMCODE, { c_com, c_gcode }, [ 'c_code', 'n_code', 's_sort' ], sort);
        const [rows] = await db.execute(sql.query, sql.values);    
        return rows;
    },
    async getCompany(req) {        
        // if (!req.user.c_com != req.query.c_com) { throw new Error('권한이 없습니다.'); }  
        const { c_com } = req.query;
        var query = `SELECT max(if(c_code = 'COM1', s_buf1, '')) c1, \n` +
                    `       max(if(c_code = 'COM2', s_buf1, '')) c2, \n` +
                    `       max(if(c_code = 'COM3', s_buf1, '')) c3, \n` +
                    `       max(if(c_code = 'COM4', s_buf1, '')) c4, \n` +
                    `       max(if(c_code = 'COM5', s_buf1, '')) c5, \n` +
                    `       max(if(c_code = 'COM6', s_buf1, '')) c6, \n` +
                    `       max(if(c_code = 'COM7', s_buf1, '')) c7, \n` +
                    `       max(if(c_code = 'COM8', s_buf1, '')) c8 \n` +
                    ` FROM tb_comcode WHERE c_com = ? AND c_gcode = 'COMPANY' `;
        var values = new Array();
        values.push(c_com);        
        const [rows] = await db.execute(query, values);    
        return rows;
    },
    async getSiteKpiInfo(req) {        
        if (!req.user.c_com ) { throw new Error('권한이 없습니다.'); }  
        const { c_com } = req.user;
        const sql = sqlHelper.SelectSimple(TABLE.WORKSITE, { c_com }, [ 'i_company', 'i_kpikey', 'f_kpichk', 'n_kpiconm' ]);
        const [[rows]] = await db.execute(sql.query, sql.values);    
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
    },

    // 공시사항
    async getNoticeList(req) {
        const { c_com } = req.query;       
        const sql = sqlHelper.SelectSimple(TABLE.NOTICE, { c_com });
        sql.query = sql.query + ` ORDER BY d_start desc , i_ser ASC `;
        const [rows] = await db.execute(sql.query, sql.values);    
        return rows;
    },
    async iuNotice(req) {
        const at = moment().format('LT');        
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        const payload = {
			...req.body,
        }
        const {c_com, i_ser } = payload;
        if (i_ser == "new") {
            payload.i_ser = Date.now();
            payload.n_crnm = req.user.n_name;            
        }
        payload.d_create_at = at;
        const sql = i_ser == "new" ? sqlHelper.Insert(TABLE.NOTICE, payload) : sqlHelper.Update(TABLE.NOTICE, payload, {i_ser, c_com});
        
        const [row] = await db.execute(sql.query, sql.values);
        if (row.affectedRows > 0) {
            await db.execute('COMMIT');
            const {c_com, i_ser } = payload;
            const noticeSql = sqlHelper.SelectSimple(TABLE.NOTICE, { i_ser, c_com });
            const [[notice]] = await db.execute(noticeSql.query, noticeSql.values);
            return notice;
        }
        return ;
    }, 
    async delNotice(req) {
		if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
		const { c_com, i_ser } = req.params;
        
        const sql = sqlHelper.DeleteSimple(TABLE.NOTICE, { c_com, i_ser });
        const [row] = await db.execute(sql.query, sql.values);
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},
    async getNoticeCom(req) {
        const { c_com } = req.query;       
        const sql = sqlHelper.SelectSimple(TABLE.NOTICE, { c_com });
        sql.query = sql.query + ` AND f_use = 'Y' `
        sql.query = sql.query + ` AND DATE_FORMAT(NOW(), '%Y-%m-%d') BETWEEN d_start AND d_end `
        sql.query = sql.query + ` ORDER BY d_start desc , i_ser ASC `;
        const [rows] = await db.execute(sql.query, sql.values);    
        return rows;
    },
    async iuSiteCodeinit(req) {
        if (!isGrant(req, LV.SYSTEM))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {...req.body};
        const {c_com} = payload;
        
        // await dbSet.setAutoCommitNo();
        let res =null;
        const sql1 = sqlHelper.DeleteSimple(TABLE.COMCODE, { c_com });
        const sql2 = sqlHelper.DeleteSimple(TABLE.GRPCODE, { c_com });
        const sql3 = `insert into tb_grpcode (c_com, c_gcode, n_gcode, s_sort, t_remark, n_crnm, d_create_at) \n` +
                     `select '${c_com}', c_gcode, n_gcode, s_sort, t_remark, 'system', '${at}' \n` +
                     `  from tb_grpcode \n` +
                     `  where c_com = 'system' `;
        
        const sql4 = `insert into tb_comcode (c_com, c_gcode, c_code, n_code, s_sort, s_buf1, s_buf2, s_buf3, m_buf1, m_buf2, m_buf3, d_buf1, d_buf2, d_buf3, t_buf1, t_buf2, t_buf3, t_remark, n_crnm, d_create_at) \n` +
                     `select '${c_com}', c_gcode, c_code, n_code, s_sort, s_buf1, s_buf2, s_buf3, m_buf1, m_buf2, m_buf3, d_buf1, d_buf2, d_buf3, t_buf1, t_buf2, t_buf3, t_remark, 'system', '${at}' \n` +
                     `  from tb_comcode \n` +
                     ` where c_com = 'system'`;
        
        res = await db.execute(sql1.query, sql1.values);
        
        res = await db.execute(sql2.query, sql2.values);
        
        await db.execute(sql3);
        
        await db.execute(sql4);
        
        await db.execute('COMMIT'); 

        return true;
    },

     openLog(req) {
        const payload = {...req.body};
        payload.d_open = moment().format('LT'); 
        const sql = sqlHelper.Insert(TABLE.OPENLOG, payload);      
        db.execute(sql.query, sql.values);
        db.execute('COMMIT');
    },

    async getMoniteraddr(req) {
        const { c_com } = req.user;  
        const sql = sqlHelper.SelectSimple(TABLE.WORKSITE, { c_com }, ['t_monitor']);
       
        
        const [[rows]] = await db.execute(sql.query, sql.values);    
        return rows;
    },

    async siteImageSave(req) {
        const { c_com } = req.body;  
        if ( !req.files ) return '';
        
        const { t_image } = req.files;
		const fileName = `${c_com}_log${path.extname(t_image.name)}`;
        const newFile = `${UPLOAD_PATH}/worksite/comlog/${fileName}`;   // 서버 Upload 절대 Path 
        const tPathFile = `/upload/worksite/comlog/${fileName}`;       // DB 칼럼 저장 위해서  (상대 Path)
        
        t_image.mv(newFile, (err)=>{
            if ( err ) {
                console.log('업로드 실패', err);
                return '';
            }
        });	
        const query = `UPDATE tb_worksite SET t_worklog = ?  WHERE c_com = ? `;
        var values = new Array();
        values.push(tPathFile); 
        values.push(c_com); 
        const res = await db.execute(query, values);
        if (res.affectedRows < 1) {
            await db.execute('ROLLBACK');
            return '';
        }
        await db.execute('COMMIT');
        return tPathFile;
    },
    async getSiteImage(req) {
        if (!req.user.c_com ) { throw new Error('권한이 없습니다.'); }  
        const { c_com } = req.user;
        const sql = sqlHelper.SelectSimple(TABLE.WORKSITE, { c_com}, ['t_worklog']);
        const [[rows]] = await db.execute(sql.query, sql.values);    
        return rows;
    },
};

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

module.exports = systemModel;
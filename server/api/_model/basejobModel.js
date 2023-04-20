const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');
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
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
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
    async getBaseItemUse(req) {
        const { c_com } = req.user;  
        if (!c_com) { throw new Error('권한이 없습니다.'); }
        var sql = `SELECT c_item, n_item FROM tb_item WHERE c_com = '${c_com}' and f_use = 'Y' order by s_sort, c_item`;
        const [rows] = await db.execute(sql);
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

    // 라우터 관리
    async getBaseRoute(req) {
        // 권한 확인
        var c_com ="", c_item ="", search ="" ;
        if (req.req) {
            c_com = req.c_com;
            c_item = req.c_item;
        } else {
            if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
            search  = req.query.search;
            c_com  = req.user.c_com;    
        }

        var query = "select a.c_com, a.c_item, b.n_item, a.c_ptype, c.n_ptype, a.f_use, a.t_remark, a.n_crnm, a.d_create_at, a.n_upnm, a.d_update_at " +
                    "  from tb_route a " +
                    "       join tb_item b on a.c_com = b.c_com and a.c_item = b.c_item " +
                    "       left outer join tb_ptype c on a.c_com = b.c_com and a.c_ptype = c.c_ptype " +
                    " where a.c_com = ? ";
        if (c_item) query = query + `   and a.c_item = '${c_item}' `;     
        if (search) query = query + `   and (a.c_item like '${search}%' or b.n_item like '${search}%') `;     
        query = query + ` ORDER BY b.s_sort ASC , c_item ASC `;

        var values = new Array();
        values[0] = c_com;        
        const [rows] = await db.execute(query, values);        
        return rows;
    },
    async getNotItemList(req) {
        const { c_com } = req.user;
        if (!c_com) { throw new Error('권한이 없습니다.'); }
        var sql = `SELECT c_item, n_item FROM tb_item WHERE c_com = '${c_com}' and f_use = 'Y' ` +
                  ` and c_item not in (SELECT c_item FROM tb_route WHERE c_com = '${c_com}') ` +
                  ` order by s_sort, c_item`;
        const [rows] = await db.execute(sql);
        return rows;
    },
    async getUseProcess(req) {
        const { c_com } = req.user;
        if (!c_com) { throw new Error('권한이 없습니다.'); }
        var sql = `SELECT c_process, n_process FROM tb_process WHERE c_com = '${c_com}' and f_use = 'Y' order by s_sort, c_process`;                  
        const [rows] = await db.execute(sql);
        return rows;
    },
    async getUseProcessList(req) {
        const { c_com } = req.user;
        if (!c_com) { throw new Error('권한이 없습니다.'); }
        var sql = `SELECT c_ptype, n_ptype FROM tb_ptype WHERE c_com = '${c_com}' and f_use = 'Y' order by s_sort, c_ptype`;                  
        const [rows] = await db.execute(sql);
        return rows;
    },
    async duplicateRouteCheck(req) {
        const { c_com } = req.user;
        const { c_route, value } = req.params;
        const sql = sqlHelper.SelectSimple(
			TABLE.ROUTE,
			{ c_com, [c_route]: value },
			['COUNT(*) AS cnt']
		);
        const [[row]] = await db.execute(sql.query, sql.values);
        return row;
    },
    async delBaseRoute(req) {
		if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
		const { c_com, c_item } = req.params;
                
        const sql = sqlHelper.DeleteSimple(TABLE.ROUTE, { c_com, c_item });
        const [row] = await db.execute(sql.query, sql.values);

        // 라우팅 공정,공정유형 삭제처리

		return row.affectedRows == 1;
	},
    async iuBaseRoute(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }
        const {c_com, c_item, c_ptype } = payload;
        var dtjob = 0;
        
        var sqldt = `insert into tb_routeproc (c_com, c_item, i_ser, s_sort, c_process, c_ptype, m_whour, f_jobs, f_jobf, f_jobo, n_crnm, d_create_at) ` +
                    `select c_com, '${c_item}', @ROWNUM1:=@ROWNUM1+1 i_ser, @ROWNUM2:=@ROWNUM2+1 s_sort, c_process, c_ptype, m_whour, f_jobs, f_jobf, f_jobo, '${req.user.n_name}', now() ` + 
                    `  from tb_ptypeli , ` +
                    `       (SELECT @ROWNUM1:=IFNULL((SELECT MAX(i_ser) from tb_routeproc WHERE c_com = '${c_com}' AND c_item = '${c_item}'),0)) R, ` +
                    `       (SELECT @ROWNUM2:=IFNULL((SELECT MAX(s_sort) from tb_routeproc WHERE c_com = '${c_com}' AND c_item = '${c_item}'),0)) S ` +
                    ` where c_com = '${c_com}' ` +
                    `   and c_ptype = '${c_ptype}' ` +
                    ` order by s_sort, c_process`;

        if (!payload.n_crnm) {             
            payload.n_crnm = req.user.n_name;
            payload.d_create_at = at;
            
            const sql = sqlHelper.Insert(TABLE.ROUTE, payload);
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return ''; 

            dtjob = 1;
        } else {
            payload.d_update_at = at;
            payload.n_upnm = req.user.n_name;
            delete payload.d_create_at;
            delete payload.n_crnm;
            delete payload.n_item;
            delete payload.n_ptype;

            const [[chkval]] = await db.execute(`SELECT count(*) cnt FROM tb_route where c_com = '${c_com}' AND c_item = '${c_item}' AND c_ptype <> '${c_ptype}' `);
            dtjob = chkval.cnt ? 1 : 0;

            const sql = sqlHelper.Update(TABLE.ROUTE, payload, {c_com, c_item});            
            const [row] = await db.execute(sql.query, sql.values);
            if (row.affectedRows < 1) return ''; 
        }
        // 공정유형 추가 작업처리  
        if (dtjob === 1) { 
            // 공정유형 추가 작업처리 (기존 삭제 후 추가)
            var sqldel = `DELETE FROM tb_routeproc where c_com = '${c_com}' AND c_item = '${c_item}' AND c_ptype <> '${c_ptype}'`;
            await db.execute(sqldel) ;

            const [rowdt] = await db.execute(sqldt);             
            if (rowdt.affectedRows > 0 ) {
                const [[chk]] = await db.execute(`select count(*) cnt from tb_routeproc where c_com = '${c_com}' AND c_item = '${c_item}' and c_ptype is null `);
                if (chk.cnt > 0 ) {
                    // 정렬순서 갱신
                    var sqlsort = `update tb_routeproc a ` +
                                `       join (select b.c_com, b.c_item, b.i_ser, @ROWNUM:=@ROWNUM+1 i_sort_new ` +
                                `               from tb_routeproc b, (SELECT @ROWNUM:= 0 ) R ` +
                                `               where b.c_com = '${c_com}' and b.c_item = '${c_item}') b on a.c_com = b.c_com and a.c_item = b.c_item and a.i_ser = b.i_ser ` + 
                                `   set a.s_sort = b.i_sort_new ` +
                                ` where a.c_com = '${c_com}' and  a.c_item = '${c_item}';`
                    const [rowsort] = await db.execute(sqlsort); 
                }
            }            
        }

        const [item] = await basejobModel.getBaseRoute({c_com, c_item, req});        
        return item;
    },
    async getBaseRouteProc(req) {     
        if (!isGrant(req, LV.ADMIN)) { throw new Error('권한이 없습니다.'); }
        const { c_com } = req.user;   
        const { c_item } = req.params;

        const sql = c_item ? sqlHelper.SelectSimple(TABLE.ROUTEPROC, { c_com, c_item }) : sqlHelper.SelectSimple(TABLE.ROUTEPROC, { c_com })
        sql.query = sql.query + ` ORDER BY c_item, s_sort ASC , c_process ASC `;
       
        const [rows] = await db.execute(sql.query, sql.values);        
        return rows;        
    },
    async iuBaseRouteProc(req) {
        if (!isGrant(req, LV.ADMIN))  throw new Error('권한이 없습니다.');
        const at = moment().format('LT');                
        const payload = {
			...req.body,
        }

        const {c_com, c_item, i_ser } = payload;
        var sql = "";
        var values = new Array();
        var i_ser_new = 1;
        if (i_ser) {
            sql = `UPDATE tb_routeproc ` +
                  `   SET s_sort = ?, m_whour = ?, f_jobs = ?, f_jobf = ?, f_jobo = ?, n_upnm = ?,  d_update_at = ? ` + 
                  ` WHERE c_com = ? AND c_item = ? AND i_ser = ? `;
            values.push(payload.s_sort);
            values.push(payload.m_whour);            
            values.push(payload.f_jobs);
            values.push(payload.f_jobf);
            values.push(payload.f_jobo);
            values.push(req.user.n_name);
            values.push(at);
            values.push(c_com);
            values.push(c_item);
            values.push(i_ser);
        } else {
            sql = `SELECT IFNULL(MAX(i_ser),0) INTO i_ser from tb_routeproc WHERE c_com = '${c_com}' AND c_item = '${c_item}'`;
            const [rows] = await db.execute(sql);
            
            sql = `INSERT INTO tb_routeproc (c_com, c_item, i_ser, s_sort, c_process, c_ptype, m_whour, f_jobs, f_jobf, f_jobo, n_crnm, d_create_at)` +
                  ` VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            
            i_ser_new = rows ? (rows.i_ser + 1) : 1;
            values.push(c_com);
            values.push(c_item);
            values.push(i_ser_new);
            values.push(payload.s_sort);
            values.push(payload.c_process);
            values.push(payload.c_ptype);
            values.push(payload.m_whour);
            values.push(payload.f_jobs);
            values.push(payload.f_jobs);
            values.push(payload.f_jobf);
            values.push(payload.f_jobo);
            values.push(req.user.n_name);
            values.push(at);
        }
        const [row] = await db.execute(sql, values);
        if (row.affectedRows < 1) return '';


        const sqlrv = sqlHelper.SelectSimple(TABLE.ROUTEPROC, { c_com, c_item }) 
        if(i_ser) { 
            sqlrv.query = sqlrv.query + ` AND i_ser = ${i_ser}` ;
        } else {
            sqlrv.query = sqlrv.query + ` AND i_ser = ` + i_ser_new ;
        }
        const [[item]] = await db.execute(sqlrv.query, sqlrv.values); 
        return item;
    },

    //console.log('at', extractNumber(moment().format('LTM')));
}
module.exports = basejobModel;

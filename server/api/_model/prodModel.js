const db = require('../../plugins/mysql');
// const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');

const prodModel = {
    async getEmplist(req) {
        const { c_com } = req.user;
        const query = `SELECT i_empno, n_empnm, n_dept FROM tb_hrbase WHERE c_com = ? ORDER BY c_com, i_empno`;
        var values = new Array(); values.push(c_com);
        const [rows] = await db.execute(query, values);     
        return rows;
    },
    async getProdPlanlist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend, work } = req.body;  

        // let where = `SELECT * FROM tb_prodplan \n WHERE c_com = ? \n`;
        let where = `select a.c_com, a.i_order, b.i_orderser, a.i_orderno, \n` +
                    `       a.s_date, a.f_status, a.n_vend, b.s_sort, b.c_item, b.n_item, b.t_size, b.i_unit, b.m_cnt, b.s_duedate, b.f_work, b.d_plan1, b.d_plan2, b.t_remark \n` +
                    `  from tb_order a \n` +
                    `      join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com \n` +
                    ` where a.c_com = ? and a.f_use = 'Y' \n` ;
                    
        var values = new Array();
        if(work == "order") where += `  and b.d_plan1 is not null \n`;
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and a.s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and a.s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and a.s_date <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            where += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` order by a.i_order, b.s_sort, b.i_orderser `;
        
        console.log(where, values);            
        const [rows] = await db.execute(where, values);        
        
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });
        return rows;
    },
    async iuProdPlanlist(req) {
        const { c_com } = req.user;
        const item = await sqlHelper.objectSplit(req.body); 
        const n_plan = req.user.n_name;
        const d_plan_at = moment().format('LT');
        let sql;
        let rv = [];
        let order = []; 
        // await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const {c_com, i_order, i_orderser, f_work, d_plan1, d_plan2, t_remark, f_edit, f_editold} = item[i];
            if (f_edit !== "1" || f_editold !== "0") continue;            
        
            sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_plan1, d_plan2, t_remark, n_plan, d_plan_at}, {c_com, i_order, i_orderser});           
            const [row] = await db.execute(sql.query, sql.values); 
            if (row.affectedRows > 0) {
                rv[rv.length] = i_orderser;
                addToUniqueArray(order, i_order);
            }
        }
        await db.execute('COMMIT');
        // 발주정보 확인 하여 발주 상태 저장 
        for (let i = 0; i < order.length; i++) {
            sql.query = `update tb_order a \n ` +
                  `  set a.f_status = (select if(sum(if(f_work = '1', 0, 1)) > 0, 'P', 'S') \n ` +
                  `                      from tb_orderli t \n ` +
                  `                      where a.c_com = t.c_com and t.i_order = a.i_order) \n ` +
                  `  where a.c_com = '${c_com}' \n ` +
                  `    and a.i_order = '${order[i]}' \n ` +
                  `   and a.f_status in ('P', 'S') `;
            await db.execute(sql.query);             
        }        
        await db.execute('COMMIT');
        return  rv;
    },
    async iuProdPlanlist2(req) {
        const { c_com } = req.user;
        
        const master = {...req.body.master}
        const detail = {...req.body.detail}
        const n_plan = req.user.n_name;
        const d_plan_at = moment().format('LT');
        const at = moment().format('LT'); 

        let sql;
        let rv = [];
        let order = []; 
                ///////////////////////////////////////////////////////////////////////////////////////////
        const masterdb = await sqlHelper.objectSplit(master, 'd');
        const detaildb = await sqlHelper.objectSplit(detail, "d");
        // 삭제 처리 후 작업 위해 정렬순서 변경 작업 objArray.sort((a, b) => a.id - b.id); // id 프로퍼티를 기준으로 오름차순 정렬        
        detaildb.sort((a,b) => b.f_edit - a.f_edit);
        
        for (let i = 0; i < masterdb.length; i++) {
            const {c_com, i_order, i_orderser, f_work, d_plan1, d_plan2, t_remark, f_edit, f_editold} = masterdb[i];
            if (f_edit !== "1" || f_editold !== "0") continue;                        
            sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_plan1, d_plan2, t_remark, n_plan, d_plan_at}, {c_com, i_order, i_orderser});           
            console.log(sql)
            const [row] = await db.execute(sql.query, sql.values); 
            if (row.affectedRows > 0) {
                rv[rv.length] = i_orderser;
                addToUniqueArray(order, i_order);                
            } else {
                db.execute('ROLLBACK'); return false;
            }
            await db.execute('COMMIT');
        }
        // 발주정보 확인 하여 발주 상태 저장 
        console.log("발주정보 확인 하여 발주 상태 저장 ");
        for (let i = 0; i < order.length; i++) {
            sql.query = `update tb_order a \n ` +
                  `  set a.f_status = (select if(sum(if(f_work = '1', 0, 1)) > 0, 'P', 'S') \n ` +
                  `                      from tb_orderli t \n ` +
                  `                      where a.c_com = t.c_com and t.i_order = a.i_order) \n ` +
                  `  where a.c_com = '${c_com}' \n ` +
                  `    and a.i_order = '${order[i]}' \n ` +
                  `   and a.f_status in ('P', 'S') `;
            const res = await db.execute(sql.query);             
            if (res.affectedRows < 1) { db.execute('ROLLBACK'); return false;}
            await db.execute('COMMIT');
        }
       
        // 공정별 세부일정 저장
        console.log("공정별 세부일정 저장 ");
        detaildb.forEach((row, index) => {
            if(row.f_edit !== "0" || row.f_editold !== "0") {
                const {c_com, i_order, i_orderser, c_item, i_ser} = row;
                const newdata = row.f_editold !== "0" ? true : false;
                const deldata = row.f_edit == "2" ? true : false;
                delete row.f_edit;
                delete row.f_editold;
                if (newdata) {
                    row.d_create_at = at;
                    row.n_crnm = req.user.n_name;
                    delete row.d_update_at;
                    delete row.n_upnm;
                } else {
                    delete row.d_create_at;
                    delete row.n_crnm;
                    row.d_update_at = at;
                    row.n_upnm = req.user.n_name;                    
                }
                
                const sql = deldata ? sqlHelper.DeleteSimple(TABLE.PRODPLAN, {c_com, i_order, i_orderser, c_item, i_ser}) :  newdata ? sqlHelper.Insert(TABLE.PRODPLAN, row) : sqlHelper.Update(TABLE.PRODPLAN, row, {c_com, i_order, i_orderser, c_item, i_ser});                
                console.log("detial", sql);                
                const res = sqlDbExecute(sql)    
                if (res.affectedRows < 1) {
                    db.execute('ROLLBACK');
                    return false;
                } 
                db.execute('COMMIT');
            }
            
        });
        await db.execute('COMMIT');
        return true;
    },
    async getErrtype(req) {
        const { c_com } = req.user;
        let query = `SELECT c_code, n_code FROM tb_comcode WHERE c_com = ? AND c_gcode = 'ERRTYPE01' ORDER BY s_sort`;
        var values = new Array(); values.push(c_com);
        const [rows] = await db.execute(query, values);
        return rows;
    },

    async getProdWork(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        
        let where = `select a.c_com, a.i_order, b.i_orderser, a.i_orderno, \n` +
                    `       a.n_vend, b.s_sort, b.c_item, b.n_item, b.t_size, b.i_unit, b.m_cnt,  b.f_work, b.d_plan1, b.d_plan2, b.t_remark, \n` +
                    `       ifnull((select sum(m_cnt) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'N' and t.f_jobf = 'Y'),0) m_makecnt, \n` +
                    `       ifnull((select sum(m_err) from tb_prodmake t where t.c_com = b.c_com and t.i_order = b.i_order and t.i_orderser = b.i_orderser and t.f_err = 'Y'),0) m_errcnt \n` +
                    `   from tb_order a  \n` +
                    `        join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com and b.f_work > '1' \n` +
                    `  where a.c_com = ? and a.f_use = 'Y' \n` ;                    

        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and b.d_plan1 between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and b.d_plan1 >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and b.d_plan1 <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            where += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` order by a.i_order, b.s_sort, b.i_orderser \n` ;

        console.log('getProdWork', where)
        const [rows] = await db.execute(where, values);        
        
        return rows;
    },
    // 작업지시 세부 공정계획
    async getProdplan(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com, i_order, i_orderser } = req.body;
        const sql = sqlHelper.SelectSimple(TABLE.PRODPLAN, { c_com, i_order, i_orderser}) ;
        sql.query = sql.query + ` ORDER BY f_jobs desc, s_sort `;

        const [rows] = await db.execute(sql.query, sql.values);  

        console.log("getProdplan", sql);
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });      
        return rows;  
    },
    async getItemRouterProc(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com, c_item } = req.body;
        const sql = sqlHelper.SelectSimple(TABLE.ROUTEPROC, { c_com, c_item}) ;
        sql.query = sql.query + ` ORDER BY s_sort `;

        const [rows] = await db.execute(sql.query, sql.values); 
        rows.forEach((row) => {
            sqlHelper.newAddEditCol(row);
        }); 
       
        return rows;  
    },
    
    async getProdWorklist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com, i_order, i_orderser } = req.body;
        const sql = sqlHelper.SelectSimple(TABLE.PRODMAKE, { c_com, i_order, i_orderser}) ;
        sql.query = sql.query + ` ORDER BY i_makeser `;
        console.log('getProdWorklist', sql)
       
        const [rows] = await db.execute(sql.query, sql.values);  
        
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });      
        return rows;        
    },
    async getProdWorkProcess(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com, i_order, i_orderser } = req.body;
        var values = new Array();
        let query = `SELECT a.c_com, a.i_order, a.i_orderser, a.c_item, a.i_ser, a.s_sort, a.s_date1, a.s_date2, a.m_cnt, a.i_empno, a.n_empnm, a.n_item, a.c_process, a.n_process, a.c_ptype, a.m_whour, a.f_jobs, a.f_jobf, a.f_jobo, \n`+
                    `       IFNULL(b.m_cnt, 0) m_make, IFNULL(b.m_ok, 0) m_ok, IFNULL(b.m_no, 0) m_no, (IFNULL(b.m_cnt, 0) - IFNULL(b.m_ok, 0)) m_dif  \n`+
                    `  FROM tb_prodplan a \n`+
                    `       LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, c_item, i_ser, sum(m_cnt) m_cnt, sum(IF(f_err = 'N', m_cnt, 0)) m_ok, sum(IF(f_err <> 'N', m_err, 0)) m_no \n`+
                    `                          FROM tb_prodmake \n`+
                    `                         GROUP BY  c_com, i_order, i_orderser, c_item, i_ser) b \n`+
                    `       ON a.c_com = b.c_com AND a.i_order = b.i_order AND a.i_orderser = b.i_orderser AND a.c_item = b.c_item AND a.i_ser = b.i_ser \n`+
                    ` WHERE a.c_com = ? \n`+
                    `   AND a.i_order = ? \n`+
                    `   AND a.i_orderser = ? \n`+
                    ` ORDER BY a.c_com, a.i_order, a.i_orderser, a.c_item, a.f_jobs desc, a.s_sort`
        values.push(c_com);  
        values.push(i_order);
        values.push(i_orderser);
        console.log(query);
        const [rows] = await db.execute(query, values); 
        return rows; 
    },

    async iuProdWorklist(req) {
        const { c_com } = req.user;
        const item = req.body;
        let order = []; 
        let orderlist = []; 
        
        // await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const {c_com, i_order, i_orderser, i_makeser, s_workday, f_err, m_cnt, m_err, i_process, f_cause, n_name, t_remark, f_edit, f_editold} = item[i];
            if (f_edit == "0") continue;      // 수정 내용 없음
            const newdata = item[i].f_editold == "1" ? true : false;
            const deldata = item[i].f_edit == "2" ? true : false;
            
            if (newdata) {
                delete item[i].d_update_at;
                delete item[i].n_upnm;
                item[i].d_create_at = moment().format('LT');
                item[i].n_crnm      = req.user.n_name;                
            } else {
                delete item[i].d_create_at;
                delete item[i].n_crnm;
                item[i].d_update_at = moment().format('LT');
                item[i].n_upnm      = req.user.n_name                
            };
            delete item[i].f_edit;
            delete item[i].f_editold;
            const sql = deldata ? sqlHelper.DeleteSimple(TABLE.PRODMAKE, {c_com, i_order, i_orderser, i_makeser}) :  newdata ? sqlHelper.Insert(TABLE.PRODMAKE, item[i]) : sqlHelper.Update(TABLE.PRODMAKE, item[i], {c_com, i_order, i_orderser, i_makeser});
            
            console.log("detial", sql);
            const res = await sqlDbExecute(sql);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await db.execute('COMMIT');
            await addOrder(order, {c_com, i_order});
            await addOrderList(orderlist, {c_com, i_order, i_orderser});
        }
        //console.log('order,', order)
        // 발주서 상태 변경  (계획 <-> 작업)        
        for (let i = 0; i < order.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.PRODMAKE, order[i], ['COUNT(*) as cnt']);
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);
            // const f_status = { f_status : rv.cnt > 0 ? "W" : 'P' };
            const f_status = rv.cnt > 0 ? "W" : 'P';
            
            const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
            console.log(sql);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await db.execute('COMMIT');
        }
        // 발주서 list 상태 변경  (지시 <-> 작업 )
        let n_work1 = req.user.n_name;
        let d_work1_at = moment().format('LT');
        for (let i = 0; i < orderlist.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.PRODMAKE, orderlist[i], ['COUNT(*) as cnt', 'MIN(s_workday) as dates', 'MAX(s_workday) as datee']);
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            
            //const f_work = { f_work : rv.cnt > 0 ? "3" : '2' };
            const f_work = rv.cnt > 0 ? "3" : '2';
            const d_work2 = rv.dates;
            const d_work3 = rv.datee;
            const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_work2, d_work3, n_work1, d_work1_at}, orderlist[i]);
            sql.query = sql.query.replace("WHERE", `, d_work1 = ifnull(d_work1, DATE_FORMAT(CURDATE(), '%Y-%m-%d')) WHERE`)
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await db.execute('COMMIT');
        }

        await db.execute('COMMIT');
        return true;
    },

    async iuProdWorkset(req) {
        const {c_com, i_order, i_orderser, f_work}  = req.body;
        const n_work3 = req.user.n_name;
        const d_work3_at = moment().format('LT');
        const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, n_work3, d_work3_at}, {c_com, i_order, i_orderser});
        console.log("iuProdWorkset", sql)
        const res = await db.execute(sql.query, sql.values);
        console.log("res]n", res)
        if (res.affectedRows < 1) {
            await db.execute('ROLLBACK');
            return false;
        }
        await db.execute('COMMIT');
        return true;
    },

    // 생산실적조회
    async getProdWorkview(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `select a.c_com, a.i_order, b.i_orderser, ` +
                    `       a.i_orderno, a.n_vend, a.n_order, b.c_item, b.n_item, b.t_size, b.m_cnt m_ocnt, b.s_duedate,  \n` +
                    `       c.m_yescnt, c.m_nocnt, b.d_plan1, b.d_plan2, d.s_works, CASE WHEN c.m_yescnt >= b.m_cnt THEN d.s_worke END s_worke, \n ` +
                    `       CASE WHEN c.m_yescnt >= b.m_cnt THEN f_CountWeekday(d.s_works, d.s_worke) ELSE f_CountWeekday(d.s_works, d.d_now) END w_workcnt, b.f_work \n` +
                    `  from tb_order a \n` +
                    `       join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com \n` +
                    `       join (select i_order, c_com, i_orderser, sum(if(f_err = 'N', if(f_jobf = 'Y',m_cnt,0),0)) m_yescnt, sum(if(f_err = 'N', 0, m_err)) m_nocnt \n` +
                    `                          from tb_prodmake \n` +
                    `                         group by i_order, c_com, i_orderser)  c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    `       join (select i_order, c_com, i_orderser, DATEDIFF(max(s_workday), min(s_workday)) w_workcnt, min(s_workday) s_works, max(s_workday) s_worke, DATE_FORMAT(CURDATE(), '%Y-%m-%d') d_now \n` +
                    `                          from (select i_order, c_com, i_orderser, s_workday \n` +
                    `                                  from tb_prodmake \n` +
                    `                                  group by i_order, c_com, i_orderser, s_workday) t \n` +
                    `                          group by i_order, c_com, i_orderser  \n` +
                    `                        )  d on b.c_com = d.c_com and b.i_order = d.i_order and b.i_orderser = d.i_orderser \n ` +
                    ` where a.c_com = ? \n` ;
        values.push(c_com);        
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and b.d_plan2 between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and b.d_plan2 >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and b.d_plan2 <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        query += ` order by a.i_order, b.s_sort, b.i_orderser \n` ;
        console.log(query)
        const [rows] = await db.execute(query, values);         
        return rows;        
    },
    // 일평균 항목별 평균생산량 조회
    async getProdWorkDayAvg(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `select a.c_com, b.c_item, MAX(b.n_item) n_item,  max(b.t_size) t_size,\n ` +
                    `       SUM(c.m_yescnt) m_yescnt, SUM(c.m_nocnt) m_nocnt, SUM(CASE WHEN c.m_yescnt >= b.m_cnt THEN f_CountWeekday(d.s_works, d.s_worke) ELSE f_CountWeekday(d.s_works, d.d_now) END) w_workcnt,  \n` +
                    `       ROUND(SUM(c.m_yescnt) / SUM(CASE WHEN c.m_yescnt >= b.m_cnt THEN f_CountWeekday(d.s_works, d.s_worke) ELSE f_CountWeekday(d.s_works, d.d_now) END),2) m_dayavgcnt \n ` +
                    `  from tb_order a \n` +
                    `       join tb_orderli b on a.i_order = b.i_order and a.c_com = b.c_com \n` +
                    `       join (select i_order, c_com, i_orderser, sum(if(f_err = 'N', if(f_jobf = 'Y',m_cnt,0),0)) m_yescnt, sum(if(f_err = 'N', 0, m_err)) m_nocnt \n` +
                    `                          from tb_prodmake \n` +
                    `                         group by i_order, c_com, i_orderser)  c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    `       join (select i_order, c_com, i_orderser, DATEDIFF(max(s_workday), min(s_workday)) w_workcnt, min(s_workday) s_works, max(s_workday) s_worke, DATE_FORMAT(CURDATE(), '%Y-%m-%d') d_now \n` +
                    `                          from (select i_order, c_com, i_orderser, s_workday \n` +
                    `                                  from tb_prodmake \n` +
                    `                                  group by i_order, c_com, i_orderser, s_workday) t \n` +
                    `                          group by i_order, c_com, i_orderser  \n` +
                    `                        )  d on b.c_com = d.c_com and b.i_order = d.i_order and b.i_orderser = d.i_orderser \n ` +
                    ` where a.c_com = ? \n` ;
        values.push(c_com);        
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and b.d_plan2 between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and b.d_plan2 >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and b.d_plan2 <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        query += ` GROUP BY a.c_com,  b.c_item \n` ;
        query += ` ORDER BY (SELECT t.s_sort FROM tb_item t WHERE t.c_com = b.c_com AND t.c_item = b.c_item) \n` ;
        console.log(query)
        const [rows] = await db.execute(query, values);         
        return rows;        
    },
    // 공정진행현황
    async getProdWorkview2(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;        
        var values = new Array();
        let query = `SELECT a.c_com, a.i_order, a.i_orderno, a.s_date, a.f_use, a.f_order, a.f_status, a.c_vend, a.n_vend, a.n_order, \n ` +
                    `       b.i_orderser, b.f_work, b.c_item, b.s_duedate, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.d_plan1, b.d_plan2, \n` +
                    `       c.c_process, c.n_process, c.s_date1 s_dplan1, c.s_date2 s_dplan2, f_CountWeekday(c.s_date1, c.s_date2) m_planday,  c.m_cnt m_plancnt, \n ` +
                    `       IFNULL(d.m_yescnt, 0) m_yescnt, IFNULL(d.m_nocnt, 0) m_nocnt, \n ` +
                    `       d.s_workday1, CASE WHEN b.m_cnt <= IFNULL(d.m_yescnt, 0) THEN d.s_workday2 END s_workday2, \n ` +
                    `       CASE WHEN b.m_cnt > IFNULL(d.m_yescnt, 0) THEN f_CountWeekday(d.s_workday1, NOW()) ELSE f_CountWeekday(d.s_workday1,s_workday2) END m_workcnt \n ` +
                    `  FROM tb_order a \n ` +
                    `        JOIN tb_orderli b ON a.c_com = b.c_com AND a.i_order = b.i_order \n ` +
                    `        JOIN tb_prodplan c ON b.c_com = c.c_com AND b.i_order = c.i_order AND b.i_orderser = c.i_orderser AND b.c_item = c.c_item \n ` +
                    `        LEFT OUTER JOIN (SELECT c_com, i_order, i_orderser, c_item, i_ser, MIN(s_workday) s_workday1, MAX(s_workday) s_workday2, \n ` +
                    `                                SUM(IF(f_err = 'N', m_cnt, 0)) m_yescnt, SUM(IF(f_err = 'N', 0, m_err)) m_nocnt \n ` +
                    `                           FROM tb_prodmake \n ` +
                    `                          GROUP BY c_com, i_order, i_orderser, c_item, i_ser) d \n ` +
                    `                        ON c.c_com = d.c_com AND c.i_order = d.i_order AND c.i_orderser = d.i_orderser AND c.c_item = d.c_item and c.i_ser = d.i_ser \n` +
                    ` WHERE a.c_com = ? \n` ;

        values.push(c_com);        
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` AND b.d_plan2 BETWEEN ? AND ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` AND b.d_plan2 >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` AND b.d_plan2 <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` AND a.n_vend LIKE ? \n `
            values.push(sVend + '%');
        }
        query += ` ORDER BY a.c_com, a.i_orderno, b.s_sort, c.f_jobs desc, c.s_sort, a.s_date` ;
        console.log(query, values);
        const [rows] = await db.execute(query, values);         
        return rows;    
    },

}

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

async function addOrder(jsonArr, newData) {
    const isDuplicate = jsonArr.some(obj =>
      obj.c_com === newData.c_com &&
      obj.i_order === newData.i_order 
    );  
    if (!isDuplicate) jsonArr.push(newData);      
    return jsonArr;
}

async function addOrderList(jsonArr, newData) {
    const isDuplicate = jsonArr.some(obj =>
      obj.c_com === newData.c_com &&
      obj.i_order === newData.i_order &&
      obj.i_orderser === newData.i_orderser
    );  
    if (!isDuplicate) jsonArr.push(newData);      
    return jsonArr;
}
module.exports = prodModel;
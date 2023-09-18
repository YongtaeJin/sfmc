const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');

// async function setAutoCommitNo() {
//     const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
//     if (data[0].rt == 1) {
//         const [rv] = await db.execute('SET AUTOCOMMIT = FALSE');
//     }
// }
// async function setAutoCommit() {
//     const [data] = await db.execute('SELECT @@AUTOCOMMIT rt');
//     if (data[0].rt == 0) {
//         const rv = await db.execute('SET AUTOCOMMIT = TRUE');
//     }
// }
function addEditCol(data) {	
	data.f_edit = '0';	
    data.f_editold = '0';	
	return data;
}
function objectSplit(data, f) {	
    const obj = {};
    if ( f === 'M' || f === 'm' ) {
        const objKeys = Object.keys(data).filter((key) => isNaN(key));
        const values = objKeys.map((key) => data[key]);
        for (let i = 0; i < objKeys.length; i++) {
            obj[objKeys[i]] = values[i];
        }
        return obj;
    } else {        
        const objKeys = Object.keys(data).filter((key) => !isNaN(key));
        const objValues = objKeys.map((key) => data[key]);
        return objValues;
    }    
}
const shipmentModel = {
    async getDerliverlist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `select a.c_com, a.i_order, b.i_orderser, \n` +
                    `       a.s_date, a.i_orderno, a.n_vend, a.n_order, b.c_item, b.n_item, b.t_size, b.m_cnt m_ocnt, b.s_duedate, b.f_work,  \n` +
                    `       c.m_yescnt, ifnull(d.m_shipcnt, 0) m_shipcnt,  d.d_ship  \n` +        
                    ` from  tb_order a \n` +
                    `       join tb_orderli b on a.i_order = b.i_order \n` +
                    `       join (select i_order, c_com, i_orderser, sum(if(f_err = 'N', if(f_jobf = 'Y', m_cnt,0),0)) m_yescnt, sum(if(f_err = 'N', 0, m_cnt)) m_nocnt \n` +
                    `               from tb_prodmake \n` +
                    `               group by i_order, c_com, i_orderser)  c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    `       left outer join (select c_com, i_order, i_orderser, sum(m_shipcnt) m_shipcnt, max(d_ship) d_ship \n` +
                    `                          from tb_prodship \n` +
                    `                         group by  c_com, i_order, i_orderser) d on b.c_com = d.c_com and b.i_order = d.i_order and b.i_orderser = d.i_orderser \n` +
                    ` where a.c_com = ? \n` ;
        values.push(c_com);  
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and a.s_date between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and a.s_date >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and a.s_date <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }
        query += ` order by a.i_order, b.s_sort, b.i_orderser \n` ;

        const [rows] = await db.execute(query, values);
        rows.forEach((row, index) => {
            row.m_difcnt =  row.m_yescnt - row.m_shipcnt;
            addEditCol(row);     // 수정 칼럼 추가 처리 
        });
        return rows;
    },
    async getDerliverlistdt(req) {
        //const { c_com } = req.user;
        const { c_com, i_order, i_orderser } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.SHIPMENT, { c_com, i_order, i_orderser });     
        console.log(sql)
        const [rows] = await db.execute(sql.query, sql.values);        
        
        rows.forEach((row, index) => {
            row.m_sort = index + 1;            
            addEditCol(row);
        });
        return rows;
    },
    async iuDerliverlist(req) {
        if (!isGrant(req, LV.PRODUCTION))  throw new Error('권한이 없습니다.');
		const { i_id, n_name } = req.user;
        // console.log(req.body)
        const at = moment().format('LT'); 
        const item = req.body;
        
        if (! item.length) return 0;
        let order = [];
        let orderlist = [];

        // await dbSet.setAutoCommitNo();
        for (let i = 0; i < item.length; i++) {
            const { c_com, i_shipser, i_shipno, d_ship, i_order, i_orderser, m_shipcnt, t_remark, f_edit, f_editold } = item[i];
            if (f_edit == "0") continue;      // 수정 내용 없음
            delete item[i].m_sort;
            delete item[i].f_edit;
            delete item[i].f_editold;

            const newdata = f_editold == "1" ? true : false;
            const deldata = f_edit == "2" ? true : false;
            if (newdata) {
                delete item[i].d_update_at;
                delete item[i].n_upnm;
                item[i].d_create_at = at;
                item[i].n_crnm      = n_name;
            } else {
                delete item[i].d_create_at;
                delete item[i].n_crnm;
                item[i].d_update_at = at;
                item[i].n_upnm      = n_name;
            };
            const sql = deldata ? sqlHelper.DeleteSimple(TABLE.SHIPMENT, {c_com, i_shipser}) : newdata ? sqlHelper.Insert(TABLE.SHIPMENT, item[i]) : sqlHelper.Update(TABLE.SHIPMENT, item[i], {c_com, i_shipser});
            console.log("sql", sql);
            const res = await sqlDbExecute(sql);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await addOrder(order, {c_com, i_order});
            await addOrderList(orderlist, {c_com, i_order, i_orderser});
        }
        
        // 발주서 상태 변경  (작업 <-> 출하)        
        for (let i = 0; i < order.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.SHIPMENT, order[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_status = rv.cnt > 0 ? "D" : 'W';

            const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }        
        // 발주서 세부 작업상태 는 별도 처리 iuProdWorkset --> 출하등록화면에서 상태란 더블 클릭 해서        

        await db.execute('COMMIT');        
        return true;
    },

    async iuShipWorkset(req) {
        const {c_com, i_order, i_orderser, f_work}  = req.body;
        const n_work4 = req.user.n_name;
        const d_work4_at = moment().format('LT');
        const sqldt = sqlHelper.SelectSimple(TABLE.SHIPMENT, {c_com, i_order, i_orderser}, ['max(d_ship) as d_ship']); 
        const [[rv]] = await db.execute(sqldt.query, sqldt.values);
        console.log(rv)
        const d_work4 = rv.d_ship ? rv.d_ship : '';

        const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work, d_work4, n_work4, d_work4_at}, {c_com, i_order, i_orderser});
        const res = await db.execute(sql.query, sql.values);
        if (res.affectedRows < 1) {
            await db.execute('ROLLBACK');
            return false;
        }
        await db.execute('COMMIT');
        return true;
    },

    async getDerliverview(req) {        
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values = new Array();
        let query = `select a.c_com, b.i_order, b.i_orderser, \n` +
                    `       a.i_orderno,  a.n_vend, a.s_date, a.f_status,\n` +
                    `       b.f_work, b.s_sort, b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, a_unit, a_amt, b.s_duedate, \n` +
                    `       c.m_shipcnt, c.d_ship \n` +
                    `  from tb_order a \n` +
                    `       join tb_orderli b on a.c_com = b.c_com and a.i_order = b.i_order \n` +
                    `       left outer join (select c_com, i_order, i_orderser, sum(m_shipcnt) m_shipcnt, max(d_ship) d_ship \n` +
                    `                          from tb_prodship \n` +
                    `                         group by c_com, i_order, i_orderser ) c on b.c_com = c.c_com and b.i_order = c.i_order and b.i_orderser = c.i_orderser \n` +
                    ` where a.c_com = ? \n`;
        values.push(c_com);        
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` and c.d_ship between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` and c.d_ship >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` and c.d_ship <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` and a.n_vend like ? \n `
            values.push(sVend + '%');
        }       
        query += `  order by a.c_com, a.i_order, b.i_orderser`;
        
        const [rows] = await db.execute(query, values);    
        return rows;
        
    },

    // 세금계산서(거래명세서)
    async getInvoicelist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.INVOICE, {c_com} );
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            sql.query += ` and d_invoice between ? and ? \n `
            sql.values.push(sDate1);
            sql.values.push(sDate2);
        } else if (sDate1.length > 0) {
            sql.query += ` and d_invoice >= ? \n `
            sql.values.push(sDate1);
        } else if (sDate2.length > 0) {
            sql.query += ` and d_invoice <= ? \n `
            sql.values.push(sDate2);
        }
        if (sVend.length > 0) {
            sql.query += ` and n_vend like ? \n `
            sql.values.push(sVend + '%');
        }       
        sql.query += `  order by c_com, i_invoiceno, i_invoiceser`;
        
        const [rows] = await db.execute(sql.query, sql.values);  
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });        
        return rows;
    },
    async getInvoicelistInfo(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { i_invoiceser } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.INVOICE, {c_com, i_invoiceser} );
        const [rows] = await db.execute(sql.query, sql.values);  
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });        
        return rows;
    },
    async getInvoicelistdt(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}        
        const { c_com, i_invoiceser } = req.body;
        const sort = {
            c_com: true,
            i_invoiceser: true,
            s_sort: true,
        };
        const sql = sqlHelper.SelectSimple(TABLE.INVOICELI, {c_com, i_invoiceser}, '',  sort);
        console.log(sql)
        const [rows] = await db.execute(sql.query, sql.values);  
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });        
        return rows;
    },
    async getDeliverNotInsert(req) {
        const { c_com } = req.user;
        const { c_vend } = req.body;

        var values = new Array();
        values.push(c_com);
        let query = `select a.c_com, a.i_shipser, a.i_shipno, a.d_ship, a.i_order, a.i_orderser, \n ` +
                    `       a.m_shipcnt,\n ` +
                    `       b.c_vend, b.n_vend, c.c_item, c.n_item, c.t_size, c.i_unit, c.i_type, FLOOR(c.a_unit) a_unit, (a.m_shipcnt * c.a_unit) a_amt,\n ` +
                    `       t1.n_compnay, t1.n_ceo, t1.i_company, t1.t_job1, t1.t_job2, t1.t_tel, t1.t_fax, t1.e_mail, t1.t_addr \n` +
                    `  from tb_prodship a\n ` +
                    `        join tb_order b on a.c_com = b.c_com and a.i_order = b.i_order\n ` +
                    `        join tb_orderli c on a.c_com = c.c_com and a.i_order = c.i_order and a.i_orderser = c.i_orderser and c.f_work = '5'\n ` +
                    `        join tb_vend t1 on b.c_com = t1.c_com and b.c_vend = t1.c_vend\n` +
                    ` where a.c_com = ? \n ` +
                    `       and not exists (select * from tb_invoiceli t where a.c_com = t.c_com and a.i_order = t.i_order and a.i_orderser = t.i_orderser)\n ` ;
        if (c_vend.length > 0) {
            query = query + `       and b.c_vend = ?\n `
            values.push(c_vend);
        }
        query = query + ` order by c_com, i_shipno, d_ship, i_shipser\n `;
        console.log(query)
        
        const [rows] = await db.execute(query, values);    
        return rows;
    },
    async getVend(req) {
        const { c_com, c_vend } = req.body;
        const sql = sqlHelper.SelectSimple(TABLE.VEND, {c_com, c_vend});
        const [rows] = await db.execute(sql.query, sql.values);    
        return rows;
    },
    async delInvoic(req) {
		if (!isGrant(req, LV.PRODUCTION))  throw new Error('권한이 없습니다.');
		const { c_com, i_invoiceser } = req.params;

        // 발주서 상태 변경 작업  ORDER(출하:D <-> 결재:A)   // ORDERLI rv.cnt > 0 ? "6" : '5';  --> 복잡함.. 하기 싫어용!!
        // 미출하 자료만 삭제 처리 : 호출전 체크

        // 자료삭제
        const sql = sqlHelper.DeleteSimple(TABLE.INVOICE, { c_com, i_invoiceser });
        const [row] = await db.execute(sql.query, sql.values);
        // 세금계산서 폼목 List 삭제
        if (row.affectedRows > 0) {
            const sqldt = sqlHelper.DeleteSimple(TABLE.INVOICELI, { c_com, i_invoiceser });
            await db.execute(sqldt.query, sqldt.values);
        }
        await db.execute('COMMIT');
		return row.affectedRows == 1;
	},
    async iuInvoicelist(req) {
        const payload = {
			...req.body,
        }
        const at = moment().format('LT'); 
        // f_edit =  0:변경없음, 1:수정, 2:삭제
        const master = objectSplit(req.body, 'm');
        const detail = objectSplit(req.body, 'd');  

        let order = [];
        let orderlist = [];
 
        const {c_com, i_invoiceser } = master;
        if (master.f_edit !== "0" || master.f_editold !== "0") {                        
            const newdata = master.f_editold !== "0" ? true : false;
            delete master.f_edit;
            delete master.f_editold;
            delete master.n_end;     // 확정시 별도 저장
            delete master.d_end;     // 확정시 별도 저장

            if (newdata) {
                master.d_create_at = at;
                master.n_crnm = req.user.n_name;                
                delete master.d_update_at;
                delete master.n_upnm;                
            } else {
                delete master.d_create_at;
                delete master.n_crnm;
                master.d_update_at = at;
                master.n_upnm = req.user.n_name;
            }
            const sql = newdata ? sqlHelper.Insert(TABLE.INVOICE, master) : sqlHelper.Update(TABLE.INVOICE, master, {c_com, i_invoiceser});

            console.log("master", sql)      
            const [row] = await db.execute(sql.query, sql.values);            
            if (row.affectedRows < 1) return false;          
        };
        detail.forEach((row, index) => {
            if(row.f_edit !== "0" || row.f_editold !== "0") {
                const {i_invoiceserno, i_order, i_orderser} = row;
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
                const sql = deldata ? sqlHelper.DeleteSimple(TABLE.INVOICELI, {c_com, i_invoiceser, i_invoiceserno}) :  newdata ? sqlHelper.Insert(TABLE.INVOICELI, row) : sqlHelper.Update(TABLE.INVOICELI, row, {c_com, i_invoiceser, i_invoiceserno});
                
                console.log("detial", sql);                
                const res = sqlDbExecute(sql)    
                if (res.affectedRows < 1) {
                    db.execute('ROLLBACK');
                    return false;
                }
                db.execute('COMMIT');
                // 발주 item 상태 변경
                if (i_orderser.length) {
                    addOrder(order, {c_com, i_order});
                    addOrderList(orderlist, {c_com, i_order, i_orderser});
                }
            }
        });
        // 발주서 상태 변경  (출하:D <-> 결재:A)
        for (let i = 0; i < order.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.INVOICELI, order[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_status = rv.cnt > 0 ? "A" : 'D';

            const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }
        for (let i = 0; i < orderlist.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.INVOICELI, orderlist[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_work = rv.cnt > 0 ? "6" : '5';

            const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work}, orderlist[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }    

        await db.execute('COMMIT');
        return true;
    },
    async iuInvoiceJobend(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}        
        const { c_com, i_invoiceser, f_status } = req.body;
        const chang_status = {};
        chang_status.f_status = f_status == "1" ? "0" : "1";
        
        const sql = sqlHelper.Update(TABLE.INVOICE, chang_status, { c_com, i_invoiceser, f_status });
        const [row] = await db.execute(sql.query, sql.values);

        await db.execute('COMMIT');
		return row.affectedRows == 1;
        
    },
    async invoiceNochk(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}        
        const { c_com, i_invoiceser, i_invoiceno } = req.body;
       
        const query = `SELECT COUNT(*) as cnt FROM tb_invoice WHERE c_com = ? AND i_invoiceser <> ? AND i_invoiceno = ? `;
        var values = new Array();
        values.push(c_com);
        values.push(i_invoiceser);
        values.push(i_invoiceno);
        
        const [[rv]]  = await db.execute(query, values);
        return  rv.cnt > 0 ? true : false;        
    },
    // 대금수금 등록
    async getAccountInvoce(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `SELECT a.c_com, a.i_invoiceser, a.i_invoiceno, a.d_invoice, a.f_status, a.f_witre, a.a_amt, a.a_vat, (a.a_amt + a.a_vat) a_inamt, a.c_vend, a.n_vend, a.n_end, a.d_end, \n ` +
                    `       b.a_accamt, b.d_account1, b.d_account2, b.m_cnt, \n ` +    
                    `       (IFNULL(b.a_accamt,0) / (a.a_amt + a.a_vat)) p_per, ((a.a_amt + a.a_vat) - IFNULL(b.a_accamt,0)) a_dif \n ` +    
                    `  FROM tb_invoice a\n ` +
                    `       LEFT OUTER JOIN (SELECT c_com, i_invoiceser, SUM(a_accamt) a_accamt, MIN(d_account) d_account1, MAX(d_account) d_account2, COUNT(*) m_cnt \n ` +
                    `               FROM tb_account WHERE f_del = 'N' \n ` +
                    `              GROUP BY c_com, i_invoiceser) b ON a.c_com = b.c_com AND a.i_invoiceser = b.i_invoiceser\n` +
                    ` WHERE a.c_com = ? \n` +
                    `   AND a.f_status >= '1'\n`;
                   
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` AND a.d_invoice between ? AND ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` AND a.d_invoice >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` AND a.d_invoice <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` AND a.n_vend like ? \n `
            values.push(sVend + '%');
        }       
        query += `  ORDER BY a.c_com, a.n_vend, a.i_invoiceno, a.i_invoiceser`;
        
        const [rows] = await db.execute(query, values); 
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });        
        return rows;
    },
    async getAccountlist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { i_invoiceser } = req.body;

        const sql = sqlHelper.SelectSimple(TABLE.ACCOUNT, {c_com, i_invoiceser} );
        const [rows] = await db.execute(sql.query, sql.values);  
        rows.forEach((row) => {
            sqlHelper.addEditCol(row);
        });        
        return rows;
    },
    async getInvoiceNotAccount(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}

        const { c_com,  i_invoiceser } = req.body;
        
        // const query = `SELECT a.c_com, a.i_invoiceno, b.i_invoiceser, b.i_invoiceserno, a.f_witre, a.c_vend, a.n_vend, \n` +
        //               `       b.i_shipser, b.i_shipno, b.i_order, b.i_orderser, c.i_orderno, (b.a_inamt + b.a_invat) a_invatamt, \n` +
        //               `       b.a_inamt, b.a_invat,  b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.a_unit \n` +
        //               `  FROM tb_invoice a \n` +
        //               `       JOIN tb_invoiceli b ON a.c_com = b.c_com AND a.i_invoiceser = b.i_invoiceser \n` +
        //               `       LEFT OUTER JOIN tb_orderli c ON b.c_com  = c.c_com AND b.i_order = c.i_order AND b.i_orderser = c.i_orderser \n` +
        //               `  WHERE a.c_com = ? \n` +
        //               `    AND a.i_invoiceser = ? \n` +
        //               `    AND a.f_status >= '1' \n` +
        //               `    AND NOT EXISTS (SELECT * FROM tb_account t WHERE b.c_com = t.c_com AND b.i_invoiceser = t.i_invoiceser AND b.i_invoiceserno = t.i_invoiceserno) \n` +
        //               `  ORDER BY a.c_com, a.i_invoiceno, b.s_sort, b.i_invoiceserno ` ;
        const query = `SELECT a.c_com, a.i_invoiceno, b.i_invoiceser, b.i_invoiceserno, a.f_witre, a.c_vend, a.n_vend, \n` +
                      `       b.i_shipser, b.i_shipno, b.i_order, b.i_orderser, c.i_orderno, (b.a_inamt + b.a_invat) a_invoice, (b.a_inamt + b.a_invat - IFNULL(d.a_accamt,0)) a_invatamt, \n` +
                      `       b.a_inamt, b.a_invat,  b.c_item, b.n_item, b.t_size, b.i_unit, b.i_type, b.m_cnt, b.a_unit, IFNULL(d.a_accamt,0) a_accamt \n` +
                      `  FROM tb_invoice a \n` +
                      `       JOIN tb_invoiceli b ON a.c_com = b.c_com AND a.i_invoiceser = b.i_invoiceser \n` +
                      `       LEFT OUTER JOIN tb_orderli c ON b.c_com  = c.c_com AND b.i_order = c.i_order AND b.i_orderser = c.i_orderser \n` +
                      `       LEFT OUTER JOIN (SELECT c_com, i_invoiceser, i_invoiceserno, SUM(a_accamt) a_accamt \n` +
                      `                         FROM tb_account \n` +
                      `                        GROUP BY c_com, i_invoiceser, i_invoiceserno) d ON b.c_com = d.c_com AND b.i_invoiceser = d.i_invoiceser AND b.i_invoiceserno = d.i_invoiceserno \n ` +
                      `  WHERE a.c_com = ? \n` +
                      `    AND a.i_invoiceser = ? \n` +
                      `    AND a.f_status >= '1' \n` +                      
                      `    AND (b.a_inamt + b.a_invat) > IFNULL(d.a_accamt,0) \n` +
                      `  ORDER BY a.c_com, a.i_invoiceno, b.s_sort, b.i_invoiceserno ` ;
        var values = new Array();
        values.push(c_com);
        values.push(i_invoiceser);

        console.log(query, values)
        const [rows] = await db.execute(query, values);                 
        return rows;
    },
    async iuAccountlist(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        // const { c_com } = req.user;
        // const { i_accounter } = req.body;
        const at = moment().format('LT'); 

        let order = [];
        let orderlist = [];
        let addInvocielist = [];
        // 추가 저장 삭제 처리 
        for (let i = 0; i < req.body.length; i++) {
            const item = {...req.body[i] };
           
            const {c_com, i_accountser, f_edit, f_editold } = item;
            const newdata = f_editold !== "0" ? true : false;
            const deldata = f_edit == "2" ? true : false;
            if  (f_edit == "0" && f_editold == "0") continue;
            delete item.f_edit;
            delete item.f_editold;
            if (newdata) {
                item.d_create_at = at;
                item.n_crnm = req.user.n_name;
                delete item.d_update_at;
                delete item.n_upnm;
            } else {
                delete item.d_create_at;
                delete item.n_crnm;
                item.d_update_at = at;
                item.n_upnm = req.user.n_name;                    
            }
            const sql = deldata ? sqlHelper.DeleteSimple(TABLE.ACCOUNT, {c_com, i_accountser}) :  newdata ? sqlHelper.Insert(TABLE.ACCOUNT, item) : sqlHelper.Update(TABLE.ACCOUNT, item, {c_com, i_accountser});
            
            console.log("detial", sql);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
            await db.execute('COMMIT');
            // 발주 item 상태 변경
            const { i_order, i_orderser, i_invoiceser} = item;
            if (i_orderser.length) { 
                addOrder(order, {c_com, i_order});
                addOrderList(orderlist, {c_com, i_order, i_orderser});
            }
            if (i_invoiceser.length) { 
                addInvocieitem(addInvocielist, {c_com, i_invoiceser});
            }
        }

        // 발주서 상태 변경  (출하:D <-> 결재:A)
        // for (let i = 0; i < order.length; i++) {
        //     const sqldt = sqlHelper.SelectSimple(TABLE.ACCOUNT, order[i], ['COUNT(*) as cnt']);            
        //     const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
        //     const f_status = rv.cnt > 0 ? "A" : 'D';

        //     const sql = sqlHelper.Update(TABLE.ORDER, {f_status}, order[i]);
        //     const res = await db.execute(sql.query, sql.values);
        //     if (res.affectedRows < 1) {
        //         await db.execute('ROLLBACK');
        //         return false;
        //     }
        // }
        for (let i = 0; i < orderlist.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.ACCOUNT, orderlist[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_work = rv.cnt > 0 ? "7" : '6';

            const sql = sqlHelper.Update(TABLE.ORDERLI, {f_work}, orderlist[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }
        for (let i = 0; i < addInvocielist.length; i++) {
            const sqldt = sqlHelper.SelectSimple(TABLE.ACCOUNT, addInvocielist[i], ['COUNT(*) as cnt']);            
            const [[rv]] = await db.execute(sqldt.query, sqldt.values);            
            const f_status = rv.cnt > 0 ? "2" : '1';

            const sql = sqlHelper.Update(TABLE.INVOICE, {f_status}, addInvocielist[i]);
            const res = await db.execute(sql.query, sql.values);
            if (res.affectedRows < 1) {
                await db.execute('ROLLBACK');
                return false;
            }
        }    

        await db.execute('COMMIT');
        return true;
    },

    async iuAccountJobend(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}        
        const { c_com, i_invoiceser, f_status } = req.body;
        const chang_status = {};
        chang_status.f_status = f_status == "9" ? "2" : "9";
        
        const sql = sqlHelper.Update(TABLE.INVOICE, chang_status, { c_com, i_invoiceser, f_status });
        const [row] = await db.execute(sql.query, sql.values);

        await db.execute('COMMIT');
		return row.affectedRows == 1;
        
    },

    async getInvoicelistView(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        
        var values = new Array();
        let query = `SELECT a.c_com, a.c_vend, MAX(a.n_vend) n_vend,\n` +
                    `        COUNT(*) m_invoicecnt,\n` +
                    `        SUM(a.a_amt + a.a_vat) a_invoiceamt,\n` +
                    `        SUM(IFNULL(a_accamt,0)) a_accamt,\n` +
                    `        SUM(a.a_amt + a.a_vat) - SUM(IFNULL(a_accamt,0)) a_noaccamt,\n` +
                    `        ROUND(SUM(IFNULL(a_accamt,0)) / SUM(a.a_amt + a.a_vat) * 100, 2) p_per\n` +
                    `   FROM tb_invoice a\n` +
                    `        LEFT OUTER JOIN (SELECT c_com, i_invoiceser, SUM(a_accamt) a_accamt\n` +
                    `                        FROM tb_account WHERE f_del = 'N'\n` +
                    `                        GROUP BY c_com, i_invoiceser) b ON a.c_com = b.c_com AND a.i_invoiceser = b.i_invoiceser\n` +
                    `  WHERE a.c_com = ?\n` +
                    `    AND a.f_status <> '0'\n`;                    
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query += ` AND a.d_invoice between ? AND ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            query += ` AND a.d_invoice >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            query += ` AND a.d_invoice <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            query += ` AND a.n_vend like ? \n `
            values.push(sVend + '%');
        }       
        query += `  GROUP BY a.c_com, a.c_vend\n`;        
        query += `  ORDER BY c_com, n_vend, c_vend`;
        
        console.log(query, values);
        const [rows] = await db.execute(query, values); 
        
        return rows;
    },
    async getInvoicelistViewdt(req) {
        if (!isGrant(req, LV.PRODUCTION)) {throw new Error('권한이 없습니다.');}        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;
        var values2 = new Array();
        let query2 = `SELECT a.c_com, a.i_invoiceser, a.i_invoiceno, a.d_invoice, a.c_vend, a.n_vend, \n` +
                     `       (a.a_amt + a.a_vat) a_invoiceamt, \n` +
                     `       (IFNULL(a_accamt,0)) a_accamt, \n` +
                     `       (a.a_amt + a.a_vat) - (IFNULL(a_accamt,0)) a_noaccamt, \n` +
                     `       ROUND(IFNULL(a_accamt,0) / (a.a_amt + a.a_vat) * 100, 2) p_per, \n` +
                     `       b.d_account1, b.d_account2, m_cnt \n` +
                     `  FROM tb_invoice a \n` +
                     `       LEFT OUTER JOIN (SELECT c_com, i_invoiceser, SUM(a_accamt) a_accamt, MIN(d_account) d_account1, MAX(d_account) d_account2, COUNT(*) m_cnt \n` +
                     `                       FROM tb_account WHERE f_del = 'N' \n` +
                     `                       GROUP BY c_com, i_invoiceser) b ON a.c_com = b.c_com AND a.i_invoiceser = b.i_invoiceser \n` +
                     ` WHERE a.c_com = ? \n` +
                     `   AND a.f_status <> '0' \n`;
                     values2.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            query2 += ` AND a.d_invoice between ? AND ? \n `
            values2.push(sDate1);
            values2.push(sDate2);
        } else if (sDate1.length > 0) {
            query2 += ` AND a.d_invoice >= ? \n `
            values2.push(sDate1);
        } else if (sDate2.length > 0) {
            query2 += ` AND a.d_invoice <= ? \n `
            values2.push(sDate2);
        }
        if (sVend.length > 0) {
            query2 += ` AND a.n_vend like ? \n `
            values2.push(sVend + '%');
        }       
        query2 += ` ORDER BY a.c_com, a.i_invoiceno, a.d_invoice`;

        console.log(query2, values2);
        const [rows2] = await db.execute(query2, values2); 

     
        return rows2;
    },

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
async function addInvocieitem(jsonArr, newData) {
    const isDuplicate = jsonArr.some(obj =>
      obj.c_com === newData.c_com &&
      obj.i_invoiceser === newData.i_invoiceser 
    );  
    if (!isDuplicate) jsonArr.push(newData);      
    return jsonArr;
}
async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}
module.exports = shipmentModel;
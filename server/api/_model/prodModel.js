const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber } = require('../../../util/lib');


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
const prodModel = {
    async getProdPlanlist(req) {
        // if (req.user.c_com != req.query.c_com) { throw new Error('권한이 없습니다.'); }  
        
        if (!isGrant(req, LV.BUSINESS)) {throw new Error('권한이 없습니다.');}   // 권한 확인
        
        const { c_com } = req.user;
        const { sDate1, sDate2, sVend } = req.body;  

        let where = `SELECT * FROM tb_prodplan \n WHERE c_com = ? \n`;
        var values = new Array();
        values.push(c_com);
        if (sDate1.length > 0 && sDate2.length > 0 ) {
            where += ` and s_duedate between ? and ? \n `
            values.push(sDate1);
            values.push(sDate2);
        } else if (sDate1.length > 0) {
            where += ` and s_duedate >= ? \n `
            values.push(sDate1);
        } else if (sDate2.length > 0) {
            where += ` and s_duedate <= ? \n `
            values.push(sDate2);
        }
        if (sVend.length > 0) {
            where += ` and n_vend like ? \n `
            values.push(sVend + '%');
        }
        where += ` ORDER BY c_com, i_prod, s_sort `;
        
        console.log(where, values);            
        const [rows] = await db.execute(where, values);        

        rows.forEach((row) => {
            addEditCol(row);
        });
        return rows;
    },

    
}

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

module.exports = prodModel;
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
    

    
}

async function sqlDbExecute(sql) {	    
    const [row] = await db.execute(sql.query, sql.values);
    return row;
}

module.exports = prodModel;
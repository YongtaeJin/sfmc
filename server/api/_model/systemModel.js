const db = require('../../plugins/mysql');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');

const systemModel = {

    async getWorkSite(req) {        
        const sql = sqlHelper.SelectSimple(TABLE.WORKSITE);        
        const [rows] = await db.execute(sql.query, sql.values);
        return rows;
    },

};

module.exports = systemModel;
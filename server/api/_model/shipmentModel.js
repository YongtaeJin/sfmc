const db = require('../../plugins/mysql');
const dbSet = require('./dbSet');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const jwt = require('../../plugins/jwt');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');
const { extractNumber, addToUniqueArray } = require('../../../util/lib');

const shipmentModel = {
    async getDerliverlist(req) {
    },
    async iuDerliverlist(req) {
    }
}

module.exports = shipmentModel;
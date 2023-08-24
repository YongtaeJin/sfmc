const router = require('express').Router();
const kpiModel = require('./_model/kpiModel');
const { modelCall } = require('../../util/lib');

const jwt = require('../plugins/jwt');

module.exports = router;
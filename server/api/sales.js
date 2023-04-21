const router = require('express').Router();
const salesModel = require('./_model/salesModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.get('/getSaleEstimate', async (req, res) => {
    const result = await modelCall(salesModel.getSaleEstimate, req);
	res.json(result);
});

module.exports = router;
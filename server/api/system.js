const router = require('express').Router();
const systemModel = require('./_model/systemModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.get('/', async (req, res) => {
	const result = await modelCall(systemModel.getWorkSite, req);
	res.json(result);
});

module.exports = router;
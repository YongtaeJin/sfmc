const router = require('express').Router();
const systemModel = require('./_model/systemModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.get('/', async (req, res) => {
	const result = await modelCall(systemModel.getWorkSite, req);
	res.json(result);
});

router.get('/duplicateCheck/:field/:value', async (req, res) => {	
	const result = await modelCall(systemModel.duplicateCheck, req.params)	
	res.json(result);
});
router.get('/duplicateDualCheck/:com/:aFiled/:field/:value', async (req, res) => {	
	const result = await modelCall(systemModel.duplicateDualCheck, req.params)	
	res.json(result);
});

router.post('/', async (req, res) => {
	const result = await modelCall(systemModel.insertWorksite, req);
	res.json(result);
});

router.patch('/', async (req, res) => {
	const result = await modelCall(systemModel.updateWorksite, req);
	res.json(result);
});


module.exports = router;
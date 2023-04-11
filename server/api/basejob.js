const router = require('express').Router();
const basejobModel = require('./_model/basejobModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.get('/getBaseVned', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseJobVned, req);
	res.json(result);
});
router.get('/duplicateVendCheck/c_com/:value1/:c_vend/:value2', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateVendCheck, req.params)	
	res.json(result);
});
router.delete('/delBaseVned/:c_com/:c_vend', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseVned, req);
	res.json(result);
});
router.post('/iuBaseVend', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseVend, req);
	res.json(result);
});

module.exports = router;
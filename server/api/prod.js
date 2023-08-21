const router = require('express').Router();
const prodModel = require('./_model/prodModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getProdPlanlist', async (req, res) => {    
    const result = await modelCall(prodModel.getProdPlanlist, req);
	res.json(result);
});

router.post('/iuProdPlanlist', async (req, res) => {
    const result = await modelCall(prodModel.iuProdPlanlist, req);
	res.json(result);
});

router.post('/getProdWork', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWork, req);
	res.json(result);
});
router.post('/getProdWorklist', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWorklist, req);
	res.json(result);
});
router.post('/iuProdWorklist', async (req, res) => {
    const result = await modelCall(prodModel.iuProdWorklist, req);
	res.json(result);
});
router.post('/iuProdWorkset', async (req, res) => {
    const result = await modelCall(prodModel.iuProdWorkset, req);
	res.json(result);
});
router.post('/getProdWorkview', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWorkview, req);
	res.json(result);
});

module.exports = router;

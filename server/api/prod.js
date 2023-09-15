const router = require('express').Router();
const prodModel = require('./_model/prodModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');

// 임직원 선택
router.post('/getEmplist', async (req, res) => {    
    const result = await modelCall(prodModel.getEmplist, req);
	res.json(result);
});

router.post('/getProdPlanlist', async (req, res) => {    
    const result = await modelCall(prodModel.getProdPlanlist, req);
	res.json(result);
});

router.post('/iuProdPlanlist', async (req, res) => {
    const result = await modelCall(prodModel.iuProdPlanlist, req);
	res.json(result);
});
router.post('/iuProdPlanlist2', async (req, res) => {
    const result = await modelCall(prodModel.iuProdPlanlist2, req);
	res.json(result);
});

router.post('/getErrtype', async (req, res) => {    
    const result = await modelCall(prodModel.getErrtype, req);
	res.json(result);
});
router.post('/getProdWork', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWork, req);
	res.json(result);
});
router.post('/getProdplan', async (req, res) => {    
    const result = await modelCall(prodModel.getProdplan, req);
	res.json(result);
});
router.post('/getItemRouterProc', async (req, res) => {    
    const result = await modelCall(prodModel.getItemRouterProc, req);
	res.json(result);
});
router.post('/getProdWorkProcess', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWorkProcess, req);
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
router.post('/getProdWorkDayAvg', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWorkDayAvg, req);
	res.json(result);
});
router.post('/getProdWorkview2', async (req, res) => {    
    const result = await modelCall(prodModel.getProdWorkview2, req);
	res.json(result);
});

module.exports = router;

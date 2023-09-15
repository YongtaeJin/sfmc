const router = require('express').Router();
const metricsModel = require('./_model/metricsModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getDerliverrate', async (req, res) => {    
    const result = await modelCall(metricsModel.getDerliverrate, req);
	res.json(result);
});
router.post('/getDerliverratedt', async (req, res) => {    
    const result = await modelCall(metricsModel.getDerliverratedt, req);
	res.json(result);
});
router.post('/getDerliverrateAvg', async (req, res) => {    
    const result = await modelCall(metricsModel.getDerliverrateAvg, req);
	res.json(result);
});
router.post('/getDefectraterate', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectraterate, req);
	res.json(result);
});
router.post('/getDefectrateratedt', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectrateratedt, req);
	res.json(result);
});
router.post('/getDefectraterate2', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectraterate2, req);
	res.json(result);
});
router.post('/getDefectrateratedt2', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectrateratedt2, req);
	res.json(result);
});
router.post('/getDefectraterate3', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectraterate3, req);
	res.json(result);
});
router.post('/getDefectrateratedt3', async (req, res) => {    
    const result = await modelCall(metricsModel.getDefectrateratedt3, req);
	res.json(result);
});
router.post('/getClientsalerate', async (req, res) => {    
    const result = await modelCall(metricsModel.getClientsalerate, req);
	res.json(result);
});
router.post('/getClientsaleratedt', async (req, res) => {    
    const result = await modelCall(metricsModel.getClientsaleratedt, req);
	res.json(result);
});
router.post('/getPeriodsalerate', async (req, res) => {    
    const result = await modelCall(metricsModel.getPeriodsalerate, req);
	res.json(result);
});
router.post('/getPeriodsaleratedt', async (req, res) => {    
    const result = await modelCall(metricsModel.getPeriodsaleratedt, req);
	res.json(result);
});



module.exports = router;

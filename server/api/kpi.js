const router = require('express').Router();
const kpiModel = require('./_model/kpiModel');
const { modelCall } = require('../../util/lib');

const jwt = require('../plugins/jwt');


router.post('/sendKpi1', async (req, res) => {
    const result = await modelCall(kpiModel.sendKpi1, req);
	res.json(result);
});
router.post('/loadKpi1', async (req, res) => {
    const result = await modelCall(kpiModel.loadKpi1, req);
	res.json(result);
});
router.post('/getKpi1', async (req, res) => {
    const result = await modelCall(kpiModel.getKpi1, req);
	res.json(result);
});
router.post('/getKpi1dt', async (req, res) => {
    const result = await modelCall(kpiModel.getKpi1dt, req);
	res.json(result);
});
module.exports = router;
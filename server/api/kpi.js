const router = require('express').Router();
const kpiModel = require('./_model/kpiModel');
const { modelCall } = require('../../util/lib');

const jwt = require('../plugins/jwt');


router.post('/kpichk', async (req, res) => {
    const result = await modelCall(kpiModel.kpichk, req);
	res.json(result);
});
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
router.post('/getWorksite', async (req, res) => {
    const result = await modelCall(kpiModel.getWorksite, req);
    res.json(result);
});
router.post('/getResKpi', async (req, res) => {
    const result = await modelCall(kpiModel.getResKpi, req);
    res.json(result);
});
router.post('/getKpiFild', async (req, res) => {
    const result = await modelCall(kpiModel.getKpiFild, req);
    res.json(result);
});
router.post('/getKPITime', async (req, res) => {
    const result = await modelCall(kpiModel.getKPITime, req);
    res.json(result);
});
router.post('/kpiJoblist', async (req, res) => {
    const result = await modelCall(kpiModel.kpiJoblist, req);
    res.json(result);
});
router.post('/iukpiJoblist', async (req, res) => {
    const result = await modelCall(kpiModel.iukpiJoblist, req);
    res.json(result);
});
router.post('/kpiFldDtlist', async (req, res) => {
    const result = await modelCall(kpiModel.kpiFldDtlist, req);
    res.json(result);
});
router.post('/kpiLevellist', async (req, res) => {
    const result = await modelCall(kpiModel.kpiLevellist, req);
    res.json(result);
});
router.post('/sendKPIJob', async (req, res) => {
    const result = await modelCall(kpiModel.sendKPIJob, req);
    res.json(result);
});
router.post('/getKPI1List', async (req, res) => {
    const result = await modelCall(kpiModel.getKPI1List, req);
    res.json(result);
});
router.post('/getKPI2List', async (req, res) => {
    const result = await modelCall(kpiModel.getKPI2List, req);
    res.json(result);
});
router.post('/getKPI3List', async (req, res) => {
    const result = await modelCall(kpiModel.getKPI3List, req);
    res.json(result);
});

module.exports = router;
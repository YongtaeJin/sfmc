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

// 사업장별 사용자 관리
router.get('/worksiteusers', async (req, res) => {
	const result = await modelCall(systemModel.worksiteusers, req);
	res.json(result);
});
router.post('/iuWorkUser', async (req, res) => {
	const result = await modelCall(systemModel.iuWorkUser, req);
	res.json(result);
});
router.delete('/delWorkUser/:c_com/:i_id', async(req, res)=>{
	const result = await modelCall(systemModel.delWorkUser, req);
	res.json(result);
});
// 시스템 코드 관리
router.get('/grpcode', async (req, res) => {
	const result = await modelCall(systemModel.grpcode, req);
	res.json(result);
});
router.get('/comcode', async (req, res) => {
	const result = await modelCall(systemModel.comcode, req);
	res.json(result);
});
router.get('/duplicateGrpcodeCheck/:com/:value1/:grp/:value2', async (req, res) => {	
	const result = await modelCall(systemModel.duplicateGrpcodeCheck, req.params)	
	res.json(result);
});
router.get('/duplicateComcodeCheck/:com/:value1/:grp/:value2/:cod/:value3', async (req, res) => {	
	const result = await modelCall(systemModel.duplicateComcodeCheck, req.params)	
	res.json(result);
});
router.post('/iuGprCode', async (req, res) => {
	const result = await modelCall(systemModel.iuGprCode, req);
	res.json(result);
});
router.delete('/delGprCode/:c_com/:c_gcode', async(req, res)=>{
	const result = await modelCall(systemModel.delGprCode, req);
	res.json(result);
});
router.post('/iuComCode', async (req, res) => {
	const result = await modelCall(systemModel.iuComCode, req);
	res.json(result);
});
router.delete('/delComCode/:c_com/:c_gcode/:c_code', async(req, res)=>{
	const result = await modelCall(systemModel.delComCode, req);
	res.json(result);
});

module.exports = router;
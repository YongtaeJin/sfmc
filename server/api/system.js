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

router.get('/getCodeList', async (req, res) => {
	const result = await modelCall(systemModel.getCodeList, req);
	res.json(result);
});
// 사업자정보조회
router.get('/getCompany', async (req, res) => {
	const result = await modelCall(systemModel.getCompany, req);
	res.json(result);
});
router.get('/getSiteKpiInfo', async (req, res) => {
	const result = await modelCall(systemModel.getSiteKpiInfo, req);
	res.json(result);
});

// 단위 팝업 선택 창 List
router.get('/getUnitPop', async (req, res) => {
	const result = await modelCall(systemModel.getUnitPop, req);
	res.json(result);
});

// 공지사항
router.get('/getNoticeList', async (req, res) => {	
	const result = await modelCall(systemModel.getNoticeList, req);
	res.json(result);
});
router.post('/iuNotice', async (req, res) => {
	const result = await modelCall(systemModel.iuNotice, req);
	res.json(result);
});
router.delete('/delNotice/:c_com/:i_ser', async(req, res)=>{
	const result = await modelCall(systemModel.delNotice, req);
	res.json(result);
});
router.get('/getNoticeCom', async (req, res) => {	
	const result = await modelCall(systemModel.getNoticeCom, req);
	res.json(result);
});

router.post('/iuSiteCodeinit', async (req, res) => {
	const result = await modelCall(systemModel.iuSiteCodeinit, req);
	res.json(result);
});

router.post('/getMoniteraddr', async (req, res) => {
	const result = await modelCall(systemModel.getMoniteraddr, req);
	res.json(result);
});
// OpenLog
router.post('/openLog', async (req, res) => {
	const result = await modelCall(systemModel.openLog, req);
	res.json(result);
});
// 사업장 이미지 저장
router.post('/siteImageSave', async (req, res) => {
	const result = await modelCall(systemModel.siteImageSave, req);
	res.json(result);
});
router.post('/getSiteImage', async (req, res) => {
	const result = await modelCall(systemModel.getSiteImage, req);
	res.json(result);
});

module.exports = router;
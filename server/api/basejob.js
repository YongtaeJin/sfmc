const router = require('express').Router();
const basejobModel = require('./_model/basejobModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');

router.get('/getHrbase', async (req, res) => {
    const result = await modelCall(basejobModel.getHrbase, req);
	res.json(result);
});
router.post('/iuHrbase', async (req, res) => {
	const result = await modelCall(basejobModel.iuHrbase, req);
	res.json(result);
});
// 거래처 관리
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
// ITEM 관리
router.get('/getBaseItem', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseItem, req);
	res.json(result);
});
router.get('/getBaseItemUse', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseItemUse, req);
	res.json(result);
});
router.get('/duplicateItemCheck/:c_item/:value', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateItemCheck, req)	
	res.json(result);
});
router.delete('/delBaseItem/:c_com/:c_item', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseItem, req);
	res.json(result);
});
router.post('/iuBaseItem', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseItem, req);
	res.json(result);
});
// 공정관리
router.get('/getBaseProcess', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseProcess, req);
	res.json(result);
});
router.get('/duplicateProcessCheck/:c_process/:value', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateProcessCheck, req)	
	res.json(result);
});
router.delete('/delBaseProcess/:c_com/:c_process', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseProcess, req);
	res.json(result);
});
router.post('/iuBaseProcess', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseProcess, req);
	res.json(result);
});
router.get('/getProcessItem', async (req, res) => {
    const result = await modelCall(basejobModel.getProcessItem, req);
	res.json(result);
});
// 공정유형관리
router.get('/getBaseProcesstype', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseProcesstype, req);
	res.json(result);
});
router.get('/duplicateProcesstypeCheck/:c_ptype/:value', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateProcesstypeCheck, req)	
	res.json(result);
});
router.delete('/delBaseProcesstype/:c_com/:c_ptype', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseProcesstype, req);
	res.json(result);
});
router.post('/iuBaseProcesstype', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseProcesstype, req);
	res.json(result);
});
router.get('/getBaseProcesstypeLi', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseProcesstypeLi, req);
	res.json(result);
});
router.get('/duplicateProcesstypeCheckLi/:c_col1/:value1/:c_col2/:value', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateProcesstypeCheckLi, req)	
	res.json(result);
});
router.delete('/delBaseProcesstypeLi/:c_com/:c_ptype/:c_process', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseProcesstypeLi, req);
	res.json(result);
});
router.post('/iuBaseProcesstypeLi', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseProcesstypeLi, req);
	res.json(result);
});
// 라우트 관리
router.get('/getBaseRoute', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseRoute, req);
	res.json(result);
});
router.get('/getNotItemList', async (req, res) => {
    const result = await modelCall(basejobModel.getNotItemList, req);
	res.json(result);
});
router.get('/getUseProcess', async (req, res) => {
    const result = await modelCall(basejobModel.getUseProcess, req);
	res.json(result);
});
router.get('/getUseProcessList', async (req, res) => {
    const result = await modelCall(basejobModel.getUseProcessList, req);
	res.json(result);
});
router.get('/duplicateRouteCheck/:c_item/:value', async (req, res) => {	
	const result = await modelCall(basejobModel.duplicateRouteCheck, req)	
	res.json(result);
});
router.delete('/delBaseRoute/:c_com/:c_item', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseRoute, req);
	res.json(result);
});
router.post('/iuBaseRoute', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseRoute, req);
	res.json(result);
});
router.get('/getBaseRouteProc', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseRouteProc, req);
	res.json(result);
});
router.get('/getBaseRouteProc/:c_com/:c_item', async (req, res) => {
    const result = await modelCall(basejobModel.getBaseRouteProc, req);
	res.json(result);
});
router.post('/iuBaseRouteProc', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseRouteProc, req);
	res.json(result);
});
router.delete('/delBaseRouteProc/:c_com/:c_item/:i_ser', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseRouteProc, req);
	res.json(result);
});
// 영업 외 실제 사용
router.get('/getItemList', async (req, res) => {
    const result = await modelCall(basejobModel.getItemList, req);
	res.json(result);
});
router.get('/getVendList', async (req, res) => {
    const result = await modelCall(basejobModel.getVendList, req);
	res.json(result);
});
router.get('/getVendInfo', async (req, res) => {
    const result = await modelCall(basejobModel.getVendInfo, req);
	res.json(result);
});

module.exports = router;

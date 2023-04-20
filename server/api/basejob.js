const router = require('express').Router();
const basejobModel = require('./_model/basejobModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');

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
router.delete('/delBaseProcesstypeLi/:c_com/:c_ptype', async(req, res)=>{
	const result = await modelCall(basejobModel.delBaseProcesstypeLi, req);
	res.json(result);
});
router.post('/iuBaseProcesstypeLi', async (req, res) => {
	const result = await modelCall(basejobModel.iuBaseProcesstypeLi, req);
	res.json(result);
});

module.exports = router;

const router = require('express').Router();
const salesModel = require('./_model/salesModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getSaleEstimate', async (req, res) => {
    const result = await modelCall(salesModel.getSaleEstimate, req);
	res.json(result);
});

router.get('/getSaleEstimateInit', async (req, res) => {
    const result = await modelCall(salesModel.getSaleEstimateInit, req);
	res.json(result);    
});
router.get('/getSaleEstimateInit/:c_com/:c_gcode', async (req, res) => {
    console.log("sadf");
    const result = await modelCall(salesModel.getSaleEstimateInit, req);
	res.json(result);
});

router.post('/getSaleEstimateLi', async (req, res) => {
    const result = await modelCall(salesModel.getSaleEstimateLi, req);
	res.json(result);
});

router.post('/iuSaleEstimate', async (req, res) => {
    const result = await modelCall(salesModel.iuSaleEstimate, req);
	res.json(result);
});

router.delete('/delSaleEstimate/:c_com/:i_ser', async(req, res)=>{
	const result = await modelCall(salesModel.delSaleEstimate, req);
	res.json(result);
});

// router.get('/getSaleEstimateInit/c_com/:value1/:c_gcode/:value2/c_code:value3', async (req, res) => {
//     const result = await modelCall(salesModel.getSaleEstimateInit, req);
// 	res.json(result);
// });

// 견적제출현황
router.post('/getSaleEstimateList', async (req, res) => {
	const result = await modelCall(salesModel.getSaleEstimateList, req);
	res.json(result);    
});


router.post('/getSaleOrder', async (req, res) => {
    const result = await modelCall(salesModel.getSaleOrder, req);
	res.json(result);
});

router.post('/getSaleOrderLi', async (req, res) => {
    const result = await modelCall(salesModel.getSaleOrderLi, req);
	res.json(result);
});
router.post('/getSaleOrderslist', async (req, res) => {
    const result = await modelCall(salesModel.getSaleOrderslist, req);
	res.json(result);
});

router.post('/iuSaleOrder', async (req, res) => {
    const result = await modelCall(salesModel.iuSaleOrder, req);
	res.json(result);
});

router.delete('/delSaleOrder/:c_com/:i_order', async(req, res)=>{
	const result = await modelCall(salesModel.delSaleOrder, req);
	res.json(result);
});
router.post('/getSaleNotInsertOrder', async (req, res) => {
    const result = await modelCall(salesModel.getSaleNotInsertOrder, req);
	res.json(result);
});



module.exports = router;


// router.post('/iuBaseVend', async (req, res) => {
// 	const result = await modelCall(basejobModel.iuBaseVend, req);
// 	res.json(result);
// });
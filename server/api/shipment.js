const router = require('express').Router();
const shipmentModel = require('./_model/shipmentModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getDerliverlist', async (req, res) => {    
    const result = await modelCall(shipmentModel.getDerliverlist, req);
	res.json(result);
});
router.post('/getDerliverlistdt', async (req, res) => {    
    const result = await modelCall(shipmentModel.getDerliverlistdt, req);
	res.json(result);
});

router.post('/iuDerliverlist', async (req, res) => {
    const result = await modelCall(shipmentModel.iuDerliverlist, req);
	res.json(result);
});
router.post('/iuShipWorkset', async (req, res) => {
    const result = await modelCall(shipmentModel.iuShipWorkset, req);
	res.json(result);
});

router.post('/getDerliverview', async (req, res) => {    
    const result = await modelCall(shipmentModel.getDerliverview, req);
	res.json(result);
});

router.post('/getInvoicelist', async (req, res) => {    
    const result = await modelCall(shipmentModel.getInvoicelist, req);
	res.json(result);
});
router.post('/getInvoicelistInfo', async (req, res) => {    
    const result = await modelCall(shipmentModel.getInvoicelistInfo, req);
	res.json(result);
});
router.post('/getInvoicelistdt', async (req, res) => {    
    const result = await modelCall(shipmentModel.getInvoicelistdt, req);
	res.json(result);
});
router.post('/getDeliverNotInsert', async (req, res) => {    
    const result = await modelCall(shipmentModel.getDeliverNotInsert, req);
	res.json(result);
});
router.post('/getVend', async (req, res) => {    
    const result = await modelCall(shipmentModel.getVend, req);
	res.json(result);
});
router.post('/iuInvoicelist', async (req, res) => {
    const result = await modelCall(shipmentModel.iuInvoicelist, req);
	res.json(result);
});
router.delete('/delInvoic/:c_com/:i_invoiceser', async(req, res)=>{
	const result = await modelCall(shipmentModel.delInvoic, req);
	res.json(result);
});
router.post('/iuInvoiceJobend', async (req, res) => {
    const result = await modelCall(shipmentModel.iuInvoiceJobend, req);
	res.json(result);
});
router.post('/invoiceNochk', async (req, res) => {
    const result = await modelCall(shipmentModel.invoiceNochk, req);
	res.json(result);
});

router.post('/getAccountInvoce', async (req, res) => {
    const result = await modelCall(shipmentModel.getAccountInvoce, req);
	res.json(result);
});
router.post('/getAccountlist', async (req, res) => {
    const result = await modelCall(shipmentModel.getAccountlist, req);
	res.json(result);
});
router.post('/getInvoiceNotAccount', async (req, res) => {
    const result = await modelCall(shipmentModel.getInvoiceNotAccount, req);
	res.json(result);
});
// router.delete('/delAccountlist/:c_com/:i_accountser', async(req, res)=>{
// 	const result = await modelCall(shipmentModel.delAccountlist, req);
// 	res.json(result);
// });
router.post('/iuAccountlist', async (req, res) => {
    const result = await modelCall(shipmentModel.iuAccountlist, req);
	res.json(result);
});
router.post('/iuAccountJobend', async (req, res) => {
    const result = await modelCall(shipmentModel.iuAccountJobend, req);
	res.json(result);
});
router.post('/getInvoicelistView', async (req, res) => {    
    const result = await modelCall(shipmentModel.getInvoicelistView, req);
	res.json(result);
});
router.post('/getInvoicelistViewdt', async (req, res) => {    
    const result = await modelCall(shipmentModel.getInvoicelistViewdt, req);
	res.json(result);
});


module.exports = router;

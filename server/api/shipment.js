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


module.exports = router;

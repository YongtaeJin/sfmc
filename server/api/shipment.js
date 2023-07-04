const router = require('express').Router();
const shipmentModel = require('./_model/shipmentModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getDerliverlist', async (req, res) => {    
    const result = await modelCall(shipmentModel.getDerliverlist, req);
	res.json(result);
});

router.post('/iuDerliverlist', async (req, res) => {
    const result = await modelCall(shipmentModel.iuDerliverlist, req);
	res.json(result);
});



module.exports = router;

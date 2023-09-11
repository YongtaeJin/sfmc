const router = require('express').Router();
const metricsModel = require('./_model/metricsModel');
const { modelCall } = require('../../util/lib');
const passport = require('passport');
const jwt = require('../plugins/jwt');


router.post('/getDerliverrate', async (req, res) => {    
    const result = await modelCall(metricsModel.getDerliverrate, req);
	res.json(result);
});
router.post('/getDerliverratedt', async (req, res) => {    
    const result = await modelCall(metricsModel.getDerliverratedt, req);
	res.json(result);
});


module.exports = router;

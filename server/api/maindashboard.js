const router = require('express').Router();
const dashboardModel = require('./_model/dashboardModel');
const { modelCall } = require('../../util/lib');


router.post('/getLineChart', async (req, res) => {    
    const result = await modelCall(dashboardModel.getLineChart, req);
	res.json(result);
});
router.post('/getPieChart1', async (req, res) => {    
    const result = await modelCall(dashboardModel.getPieChart1, req);
	res.json(result);
});
router.post('/getPieChart2', async (req, res) => {    
    const result = await modelCall(dashboardModel.getPieChart2, req);
	res.json(result);
});
router.post('/getDataTable', async (req, res) => {    
    const result = await modelCall(dashboardModel.getDataTable, req);
	res.json(result);
});

module.exports = router;
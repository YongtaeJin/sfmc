const router = require('express').Router();
const shopinfoModel = require('./_model/shopinfoModel');
const passport = require('passport');
const jwt = require('../plugins/jwt');
const { modelCall } = require('../../util/lib');


router.get('/getShopUserList', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopUserList, req);
	res.json(result);
}),
router.patch('/patchShopUserList', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.patchShopUserList, req);
	res.json(result);
}),
router.patch('/patchShopUserDelete', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.patchShopUserDelete, req);
	res.json(result);
}),

router.get('/getShopMag', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopMag, req);
	res.json(result);
}),
router.get('/getShopMagFile', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopMagFile, req);
	res.json(result);
}),
router.post('/checkShopinfo', async (req, res)=> {
    const result = await modelCall(shopinfoModel.checkShopinfo, req);
	res.json(result);
}),
router.get('/', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.checkShopinfo, req);
	if ( result ) {
		res.cookie('i_shop', result.i_shop, { httpOnly: true });
		res.cookie('i_no', result.i_no, { httpOnly: true });
	}
	res.json(result);
}),
router.patch('/', async (req, res)=> {
	const result = await modelCall(shopinfoModel.updateShopinfo, req);
	res.json(result);
}),
router.patch('/attfiles/', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.attfiles, req);
	res.json(result);
}),

// 첨부파일 upload
router.patch('/attfiles/upload', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.attfilesupload, req);
	res.json(result);
}),

// 첨부파일 delete
router.delete('/attfiles/delete/:i_shop/:i_no/:i_ser', async(req, res)=>{
	const result = await modelCall(shopinfoModel.attfilesdelete, req);
	res.json(result);
});
    
router.get('/duplicgateCheckShop/:field/:value', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.duplicgateCheckShop, req.params);
	res.json(result);
}),

router.post('/shopInfoSave', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.shopInfoSave, req);
	res.json(result);
}),

router.post('/shopAddFile', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.shopAddFile, req);
	res.json(result);
}),
router.post('/shopAddFileDelete', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.shopAddFileDelete, req);
	res.json(result);
}),

router.get('/getShopInputMag', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopInputMag, req);
	res.json(result);
}),
router.patch('/getShopInputMag', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopInputMagUpdate, req);
	res.json(result);
}),

router.get('/getShopInputMag1', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopInputMag1, req);
	res.json(result);
}),
router.get('/getShopInputMag2', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopInputMag2, req);
	res.json(result);
}),
router.get('/getFileDown', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getFileDown, req);	
	res.json(result);
}),
router.get('/getFileDownZip', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getFileDownZip, req);	
	res.json(result);
}),
router.get('/getFileDownRes', async (req, res)=> {	
	// const result = await modelCall(shopinfoModel.getFileDownRes, req);	
	// res.json(result);
	// res.download("D:\WEBAPP\protagonist\server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx");
	res.download("D:/WEBAPP/protagonist/server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx");
}),

router.get('/getShopArgeeMag', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopArgeeMag, req);
	res.json(result);
}),
router.get('/getShopArgeeInDetail', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopArgeeInDetail, req);
	res.json(result);
}),
router.get('/getShopArgeeInChk', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopArgeeInChk, req);
	res.json(result);
}),
router.patch('/ShopInputMag2Save', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.ShopInputMag2Save, req);
	res.json(result);
}),
router.get('/getShopDocChkMail', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.getShopDocChkMail, req);
	res.json(result);
}),
router.post('/postMailSend', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.postMailSend, req);
	res.json(result);
}),
router.get('/shopgetEmail', async (req, res)=> {	
	const result = await modelCall(shopinfoModel.shopgetEmail, req);
	res.json(result);
}),

module.exports = router;
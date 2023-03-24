const router = require('express').Router();
const { modelCall } = require('../../util/lib');
const companyModel = require('./_model/companyModel');

// 사업장 전체 조회
router.get('/company', async (req, res) => {
	const result = await modelCall(companyModel.getCompany, req);
	res.json(result);
});

// 사업장 추가
router.post('/', async (req, res) => {	
	const result = await modelCall(companyModel.createCompany, req);
	res.json(result);
});

// 사업장 코드 중복 체크
router.get('/duplicateCheckCompany/:field/:value', async (req, res) => {
	const result = await modelCall(companyModel.duplicateCheckCompany, req.params);
	res.json(result);
});

// 사업장 수정
router.patch('/', async (req, res) => {
	const result = await modelCall(companyModel.updateCompany, req);
	res.json(result);
})

router.get('/companylist', async (req, res) => {
	const result = await modelCall(companyModel.getCompanyList, req);
	res.json(result);
});
router.get('/companyusers', async (req, res) => {
	const result = await modelCall(companyModel.getCompanyUsers, req);
	res.json(result);
});

// 사업장_사용자 추가 
router.post('/user', async (req, res) => {	
	const result = await modelCall(companyModel.createUser, req);
	res.json(result);
});
// 사업장_사용자 수정 
router.post('/userMod', async (req, res) => {	
	const result = await modelCall(companyModel.updateUser, req);
	res.json(result);
});
// 사업장_사용자 삭제  
router.post('/userDelete', async (req, res) => {		
	const result = await modelCall(companyModel.deleteUser, req);	
	res.json(result);
});
// 사용 ID 중복 체크
router.get('/duplicateCheckId/:field/:value', async (req, res) => {
	const result = await modelCall(companyModel.duplicateCheckId, req.params);
	res.json(result);
});


module.exports = router;
const fs = require('fs');
const path = require('path');

const db = require('../../plugins/mysql');
const jwt = require('../../plugins/jwt');
const sendMailer = require('../../plugins/sendMailer');
const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const moment = require('../../../util/moment');
const { LV, isGrant } = require('../../../util/level');

const zip = require("node-zip");


function clearShopmagField(shopmag) {
	if (shopmag.d_date1) { shopmag.d_date1 = moment(shopmag.d_date1).format('L')};
	if (shopmag.d_date2) { shopmag.d_date2 = moment(shopmag.d_date2).format('L')};
}

const shopinfoModel = {
	async getShopUserList(req) {
		const {f_serarch} = req.query;
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}
		const sql = "select mb_id, mb_name, mb_phone, mb_email, if(mb_level=2,'일반', '관리자') mb_level, chkpw, mb_login_at, 'N' f_del  " +
				    "  from member " +
	   			    " where not exists (select * from tb_notuserchk t where member.mb_id = t.mb_id) " +
					"   and (mb_id like '%" + f_serarch + "%' or mb_name like '%" + f_serarch + "%' or mb_email like '%" + f_serarch + "%')" +
	   			    " order by mb_id, mb_name";
		const [row] = await db.execute(sql);
	
       	return row;		
	},
	async patchShopUserList(req) {
		const {mb_id, mb_level} = req.query;
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}
		const sql = "update member set mb_level = if('" + mb_level + "'='일반', 5, 2) where mb_id = '" + mb_id + "'";		
		const [row] = await db.execute(sql);
	
       	return row;		
	},
	async patchShopUserDelete(req) {
		const {mb_id, mb_level} = req.query;
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}		
		
		let sql2 = "select i_no " +
				   "  from tb_shopinput " +
				   " where i_userid = '" + mb_id + "' " + 
				   " and i_shop = '23-001' ";
		const [[data]] = await db.execute(sql2);
				
		if (data) {		
			const {i_no} = data;
			sql2 = "delete from tb_shopinput_file where i_shop = '23-001' and i_no = " + i_no;
			let [data2] = await db.execute(sql2);
		}
		sql2 = "delete from tb_shopinput where i_userid = '" + mb_id + "' and i_shop = '23-001' ";
		[data2] = await db.execute(sql2);

		const sql = "delete from member where mb_id = '" + mb_id + "'";		
		const [row] = await db.execute(sql);
		
		return row;		
	},
	// 사업LIST
	async getShopMag(req) {
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}
		const sql = "select i_shop, n_shop, d_date1, d_date2, t_remark, t_remark2 from tb_shopmag order by i_shop desc";
		const [row] = await db.execute(sql);
		row.forEach((data) => {
			clearShopmagField(data);
		});

       	return row;		   
	},
	async getShopMagFile(req) {
		// 권한 확인
		//const sql = sqlHelper.SelectSimple("tb_shopmag_file", req.query, {i_shop, i_ser, f_gubun, f_yn, n_file, t_remark, t_sample});
		// console.log(req.query);
		const { i_shop, f_gubun } = req.query;
		const sql = "select i_shop, i_ser, f_gubun, f_yn, n_file, n_nm, t_filenm, t_remark, t_sample, i_sort" +
		            "  from tb_shopmag_file where i_shop  = '" + i_shop + "' and f_gubun = '" + f_gubun + "'" +
					" order by f_gubun, i_sort, i_ser";
		
		const [row] = await db.execute(sql);
		
       	return row;
	},

    // 공방신청 내용 조회
    async checkShopinfo(req) {       
		const sql1 = "select i_shop from tb_shopmag where  now() between d_date1 and d_date2";
    	const [[row]] = await db.execute(sql1);
    	
		const sql2 = "select a.i_shop, a.t_remark, a.t_remark2, i_no, ifnull(i_userid, '" + req.user.mb_id + "') i_userid, f_persioninfo, d_persioninfo, i_regno, n_company, n_person, t_tel1, t_tel2,  i_presno, i_email, i_post, t_addr1, t_addr2, f_saugup, f_run, f_dart, t_enarainfo, t_enarainfopw " +
  					 "	from tb_shopmag a " +
       				 "       left outer join tb_shopinput b on a.i_shop = b.i_shop and b.i_userid = '" + req.user.mb_id +"'" +
 					 " where a.i_shop = '" + row.i_shop + "'"
    	const [[data]] = await db.execute(sql2);
       return data;
    },

	async getShopinputNo(as_shop, as_userid) {
		sql = "select  ifnull(max(case i_userid when '" + as_userid + "' then i_no end), ifnull(max(i_no),0) + 1) i_no" +
			  "  from tb_shopinput " +
			  "	where i_shop = '" + as_shop + "' " ;
		const [[data]] = await db.execute(sql);
		
		return data;
	}, 

	async updateShopinfo(req) {	
		const at = moment().format('LT');	
		const payload = {
			... req.body,
		};
		const i_userid = payload.i_userid;
		const i_shop = payload.i_shop;
		const i_no = payload.i_no;
		
		if ( !i_no ) {
			const i_no_new = await shopinfoModel.getShopinputNo(i_shop, i_userid);
			payload.i_no = i_no_new.i_no;
			payload.d_persioninfo = at;
		} else {
			delete payload.d_persioninfo;
		}
		delete payload.t_remark;
		delete payload.t_remark2;
		sql = sqlHelper.InsertOrUpdate('tb_shopinput', payload, {i_shop, i_no});
		
		const [row] = await db.execute(sql.query, sql.values);
		return row;
	},

	async attfiles(req) {
		const token = req.cookies.token;
		const { mb_id } = jwt.vetify(req.cookies.token);
		const i_shop = req.cookies.i_shop;
		const i_no = req.cookies.i_no;	
		const { f_gubun } = req.query;
		
		sql = "select a.i_shop, a.i_ser, a.f_yn, a.n_file n_filename, " +
			  "			c.i_no, null n_file, b.n_file n_file2, b.t_att, b.f_noact, a.t_remark, a.t_sample, a.t_filenm t_samplefile" +
			  "  from tb_shopmag_file a " +
			  "       left outer join tb_shopinput c on a.i_shop = c.i_shop and c.i_userid = '" + mb_id + "' " +
			  "	      left outer join tb_shopinput_file b on a.i_shop = b.i_shop and a.i_ser = b.i_ser and c.i_no = b.i_no " +
			  "	where a.i_shop = '" + i_shop + "' " +
			  "   and a.f_gubun = '" + f_gubun + "'" +
			  "	order by a.i_shop, a.i_ser ";		
		const [row] = await db.execute(sql);
		return row;
	},


	// 첨부파일 Upload
	async attfilesupload(req) {
		const token = req.cookies.token;
		const { mb_id } = jwt.vetify(req.cookies.token);
		const payload = {
			...req.body,
		};
		delete payload.f_yn;

		// console.log(payload);
		
		const { i_shop, i_ser, f_yn, n_filename, i_no, t_att, f_del } = payload;		
		const makeFolder = (dir) => {
			if( !fs.existsSync(dir) )  { 				
				fs.mkdirSync(dir, { recursive: true }, err => {});				
			} ;
		}
		if ( !i_shop )  { return ; }

		const { n_file } = req.files;
		// UPLOAD 폴더 생성 (신청번호: 첫번재 i_shop)		
		let fPath = "";   // 서버 파일 저장 위치 Full Path  (Root 폴더 위치 부터)
		let tPath = "";   // DB 저장 칼럼 상태 위치 
		//req.files.mb_image.mv(`${MEMBER_PHOTO_PATH}/${fileName}.jpg`, (err) => {
		if (Array.isArray(i_shop)) {  
			fPath = `${UPLOAD_PATH}/shopsigned/${i_shop[0]}/${mb_id}` ;
			tPath = `/upload/shopsigned/${i_shop[0]}/${mb_id}` ;
		} else { 
			fPath = `${UPLOAD_PATH}/shopsigned/${i_shop}/${mb_id}` 
			tPath = `/upload/shopsigned/${i_shop}/${mb_id}` ;			
		} ;
		makeFolder(fPath);

		if (Array.isArray(i_shop)) {			
			i_shop.forEach(async function(item, index) {
				const fileName = `${i_ser[index]}_` + jwt.getRandToken(16);
				const newFile = `${fPath}/${fileName}${path.extname(n_file[index].name)}`;
				const tPathFile = `${tPath}/${fileName}${path.extname(n_file[index].name)}`;
				n_file[index].mv(newFile, (err)=>{
					if ( err ) {
						console.log('업로드 실패', err);
						return;
					}
				});
				sql = "select count(*) cnt  from tb_shopinput_file where i_shop = '" + i_shop[index] + "' and i_no = "  + i_no[index] + " and i_ser = " + i_ser[index];
				const [[data]] = await  db.execute(sql);
				if ( !data.cnt ) {
					sql = "insert into tb_shopinput_file (i_shop, i_no, i_ser, n_file, t_att, f_noact) " +
						  " values ('" + i_shop[index] + "'," + i_no[index] + "," + i_ser[index] + ", '" + t_att[index] + "', '" + tPathFile + "', 'I')";
				} else {
					sql = "update tb_shopinput_file set n_file = '" + t_att[index] + "', t_att = '" + tPathFile + "', f_noact = if(f_noact = 'N', 'R', f_noact)" +
						  " where i_shop = '" + i_shop[index] + "' and i_no = " + i_no[index] + " and i_ser = " + i_ser[index] ;
				}
				const [row] = await db.execute(sql);
			});
		} else {
			//const fileName = jwt.getRandToken(16);
			const fileName = `${i_ser}_` + jwt.getRandToken(16);
			const newFile = `${fPath}/${fileName}${path.extname(n_file.name)}`;
			const tPathFile = `${tPath}/${fileName}${path.extname(n_file.name)}`;
			n_file.mv(newFile, (err)=>{
				if ( err ) {
					console.log('업로드 실패', err);
					return;
				}
			});			

			sql = "select count(*) cnt  from tb_shopinput_file where i_shop = '" + i_shop + "' and i_no = "  + i_no + " and i_ser = " + i_ser;
			const [[data]] = await db.execute(sql);
			if ( !data.cnt ) {
				sql = "insert into tb_shopinput_file (i_shop, i_no, i_ser, n_file, t_att, f_noact) " +
				      " values ('" + i_shop + "'," + i_no + "," + i_ser + ", '" + t_att + "', '" + tPathFile + "', 'I')";
			} else {
				sql = "update tb_shopinput_file set n_file = '" + t_att + "', t_att = '" + tPathFile + "', f_noact = if(f_noact = 'N', 'R', f_noact)" +
				      " where i_shop = '" + i_shop + "' and i_no = " + i_no + " and i_ser = " + i_ser ;
			}
			const [row] = await db.execute(sql);
			
			return row;
		}
	},

	async attfilesdelete(req) {
		// 파일정보 삭제 처리 
		const { i_shop, i_no, i_ser } = req.params;
		
		const [[ {t_att } ]] = await db.execute("select t_att from tb_shopinput_file where i_shop = '" + i_shop + "' and i_no = " + i_no + " and i_ser = " + i_ser);
		
		const sql = sqlHelper.DeleteSimple('tb_shopinput_file', { i_shop, i_no, i_ser });
		const [row] = await db.execute(sql.query, sql.values);		
		if (row.affectedRows == 1) {
			// 실제 파일 삭제 처리 			
			let delFile = `${SERVER_PATH}${t_att}` ;
			try {				
				fs.unlinkSync(delFile);
			}  catch(e) {}
		}
		return row.affectedRows == 1;
	},
	async duplicgateCheckShop({ field, value }) {
		// SELECT COUNT(*) AS cnt FROM member WHERE mb_id=?;
		const sql = sqlHelper.SelectSimple(
			'tb_shopmag',
			{ [field]: value },
			['COUNT(*) AS cnt']
		);		
		const [[row]] = await db.execute(sql.query, sql.values);
		return row;
	},
	async shopInfoSave(req) {
		const data = req.body;
		const payload = {
			...req.body,
		};
		const { i_shop } = payload;
		sql = sqlHelper.InsertOrUpdate('tb_shopmag', payload, {i_shop});		
		const [row] = await db.execute(sql.query, sql.values);
		return row;

	},

	async shopAddFile(req) {
		const payload = {
			...req.body,
		};
		const {  i_shop,  i_ser,  f_gubun, f_yn, n_nm, n_file, t_filenm, t_remark,  t_sample,  i_sort,  isNew,  i_shop_select, f_del } = payload;
		let fPath = `${UPLOAD_PATH}/shopsigned/${i_shop}` ;
		let tPath = `/upload/shopsigned/${i_shop}` ;
		let tPathFile = "";
		let tFilenm = "";
		if ( req.files )  {
			const { t_image } = req.files;
			const fileName = `${i_ser}_` + jwt.getRandToken(16);
			const newFile = `${fPath}/${fileName}${path.extname(t_image.name)}`;
			tPathFile = `${tPath}/${fileName}${path.extname(t_image.name)}`;
			tFilenm = t_sample;

			t_image.mv(newFile, (err)=>{
				if ( err ) {
					console.log('업로드 실패', err);
					return;
				}
			});	
		} else {			
			if (!f_del) {
				tFilenm = t_filenm;
				tPathFile = t_sample;
			} else {
				let delFile = `${SERVER_PATH}${t_sample}` ;
				try {				
					fs.unlinkSync(delFile);
				}  catch(e) {}

			}
		} 
		
		if(isNew == "true") {
			const [[getser]] = await db.execute("select max(i_ser) ser from tb_shopmag_file where i_shop = '" + i_shop_select + "'");
			const { ser } = getser;
			if (!ser) { setser = 1  }  else { setser = ser + 1}
			
			sql = "insert into tb_shopmag_file " +
			      " (i_shop,  i_ser,  f_gubun, f_yn, n_nm, n_file, t_filenm, t_remark,  i_sort, t_sample) " +
				  " values ('" + i_shop_select + "' , " + setser + ", '" + f_gubun + "', '" + f_yn + "', '" + n_nm + "', '" + n_file + "', '" + tFilenm + "', '" + t_remark + "'," + i_sort + ", '" + tPathFile + "')";
			
		} else {
			sql = "update tb_shopmag_file  " +
			      "   set f_gubun = '" + f_gubun + "', " +
				  "       f_yn = '" + f_yn + "', " +
				  "       n_nm = '" + n_nm + "', " +
				  "       n_file = '" + n_file + "', " +
				  "       t_filenm = '" + tFilenm + "', " +
				  "       t_remark = '" + t_remark + "', " +
				  "       t_sample = '" + tPathFile + "', " +			
				  "       i_sort   = " + i_sort +
				  " where i_shop = '" + i_shop + "' and i_ser = " + i_ser 
		};
		
		const [row] = await db.execute(sql);
		return row;
	},
	async shopAddFileDelete(req) {
		const payload = {
			...req.body,
		};
		const {  i_shop,  i_ser,  f_gubun, f_yn,  n_file,  t_remark,  t_sample,  i_sort,  isNew,  i_shop_select } = payload;
		sql = "delete from tb_shopmag_file  " +
		      " where i_shop = '" + i_shop + "' and i_ser = " + i_ser ;

		const [row] = await db.execute(sql);
		return row;
	},

	async getShopInputMag(req) {
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}
		const {i_shop, chkf_serarch, chkf_dochk, chkf_enara} = req.query;
		// console.log(req.query);
		// var ls_comnm = chkf_serarch ? chkf_serarch : "%";
		// console.log(ls_comnm);

		const sql = "select a.i_shop, a.i_no, " +
					"		coalesce(n_company, a.i_userid) n_company, " +
					"		f_persioninfo, " +
					"		if(coalesce( " +
					"			length(trim(i_regno)) + length(trim(n_company)) + length(trim(n_person)) + length(trim(t_tel1)) + length(trim(t_tel2)) + length(trim(i_email)) + " +
					"			length(trim(i_presno)) + length(trim(i_post)) + length(trim(t_addr1)) + length(trim(t_addr2)) + length(trim(t_tel2)) + length(trim(f_saugup)) + " +
					"			length(trim(f_run)) + length(trim(f_dart)) + length(trim(t_enarainfo)) + length(trim(t_enarainfopw)) " +
					"			, 0) > 0, 'Y', 'N') chk1, " +
					"		if(b.f_f1y = c.f_u1y, 'Y', 'N') chk2, " +
					"		if(b.f_f2y = 0, '-', if(b.f_f2y = c.f_u2y, 'Y', 'N')) chk3, " +
					"		if(b.f_f3y = c.f_u3y, 'Y', 'N') chk4, " +
					"		f_dochk, " +
					"		f_enarachk	 " +				
					" from tb_shopinput a " +
					"		left outer join (select i_shop,  " +
					"								sum(case when f_gubun = '1' and f_yn = '1' then 1 else 0 end) f_f1y, " +
					"								sum(case when f_gubun = '1' and f_yn = '0' then 1 else 0 end) f_f1n, " +
					"								sum(case when f_gubun = '2' and f_yn = '1' then 1 else 0 end) f_f2y, " +
					"								sum(case when f_gubun = '2' and f_yn = '0' then 1 else 0 end) f_f2n, " +
					"								sum(case when f_gubun = '3' and f_yn = '1' then 1 else 0 end) f_f3y, " +
					"								sum(case when f_gubun = '3' and f_yn = '0' then 1 else 0 end) f_f3n " +
					"						from tb_shopmag_file  " +
					"						where i_shop = '" + i_shop + "' " +
					"						group by i_shop) b on a.i_shop = b.i_shop " +
					"		left outer join (select c2.i_shop, c2.i_no, " +
					"								sum(case when f_gubun = '1' and f_yn = '1' and f_noact <> 'N' then 1 else 0 end) f_u1y, " +
					"								sum(case when f_gubun = '1' and f_yn = '0' and f_noact <> 'N' then 1 else 0 end) f_u1n, " +
					"								sum(case when f_gubun = '2' and f_yn = '1' and f_noact <> 'N' then 1 else 0 end) f_u2y, " +
					"								sum(case when f_gubun = '2' and f_yn = '0' and f_noact <> 'N' then 1 else 0 end) f_u2n, " +
					"								sum(case when f_gubun = '3' and f_yn = '1' and f_noact <> 'N' then 1 else 0 end) f_u3y, " +
					"								sum(case when f_gubun = '3' and f_yn = '0' and f_noact <> 'N' then 1 else 0 end) f_u3n " +
					"						from tb_shopmag_file c1 " +
					"								join tb_shopinput_file c2 on  c1.i_shop = c2.i_shop and c1.i_ser = c2.i_ser " +
					"						where c1.i_shop = '" + i_shop + "' " + 
					"						group by c2.i_shop, c2.i_no) c on a.i_shop = b.i_shop and a.i_no = c.i_no " +
					" where a.i_shop = '" + i_shop + "' " +
					"   and trim(coalesce(n_company, a.i_userid)) like '" + chkf_serarch + "%'" +
					"   and coalesce(f_dochk, 'N') like '" + chkf_dochk + "'" +
					"   and coalesce(f_enarachk, 'N') like '" + chkf_enara + "'";
					
		const [row] = await db.execute(sql);
		// console.log(sql);
       	return row;		   
	},
	async getShopInputMagUpdate(req) {
		const at = moment().format('LT');
		
		const { i_shop, i_no, f_dochk, f_enarachk, f_argeechk } = req.query;
		if(!f_dochk && !f_enarachk && !f_argeechk) { return }
		
		const dtime = at;
		sql = "update tb_shopinput set ";
		if(f_dochk) { sql = sql + " f_dochk = '" + f_dochk + "', d_docchk = now()"}
		if(f_dochk && f_enarachk) { sql = sql + ', '}
		if(f_enarachk) { sql = sql + " f_enarachk = '" + f_enarachk + "', d_enarachk = now()"}
		if(f_argeechk) { sql = sql + " f_argeechk = '" + f_argeechk + "', d_argee = now()"}
		sql = sql + " where i_shop = '" + i_shop + "' and i_no = " + i_no
		// console.log(sql)
		const [row] = await db.execute(sql);
		return row;		
	},
	async getShopInputMag1(req) {		
		const { i_shop, i_no } = req.query;		
		const sql = "select * from tb_shopinput where i_shop = '" + i_shop + "' and i_no = " + i_no;
		const [[row]] = await db.execute(sql);				
       	return row;		   		
	},
	async getShopInputMag2(req) {
		const { i_shop, i_no, f_gubun } = req.query;	
		
		const sql = "select a.i_shop, a.i_ser, a.f_gubun, a.f_yn, a.n_file n_filename, " +
					"       c.i_no, b.n_file, b.t_att, b.f_noact " +
					"  from tb_shopmag_file a " +
					"       left outer join tb_shopinput c on a.i_shop = c.i_shop and c.i_no = " + i_no +
					"       left outer join tb_shopinput_file b on a.i_shop = b.i_shop and a.i_ser = b.i_ser and c.i_no = b.i_no " +
					" where a.i_shop = '" + i_shop + "' " +
					"   and a.f_gubun = '" + f_gubun + "'" +
					" order by a.i_shop, a.i_ser ";	
		const [row] = await db.execute(sql);				
       	return row;		   		
	},
	async ShopInputMag2Save(req) {
		const { i_shop, i_no, i_ser, f_noact } = req.query;	
		const sql = "update tb_shopinput_file set f_noact = '" + f_noact + "' " +
		            " where i_shop = '" + i_shop + "' and i_no = " + i_no + " and i_ser = " + i_ser;
		const [row] = await db.execute(sql);				
       	return row;		   		
		
		// 메일발송 test
		// try {
		// 	await sendMailer('관리자?', 'freview@nate.com', '제목', '본문');
		// 	console.log("mail 보냄!!!!");
		// } catch (e) {
		// 	return { err : `email 발송 실패 !!`}
		// }
	
	},
	async getFileDown(req, res) {		
		let fPath = `${SERVER_PATH}` ;
		const { path } = req.query;		
		let filePath = fPath + path;
		
		const file = fs.readFileSync(filePath);	
		
		return file;
	},
	async getFileDownZip(req, res) {
		const { i_shop, i_no, f_gubun, f_filetype } = req.query;
		let fPath = `${SERVER_PATH}` ;
		var t_path = "";
		// D:/WEBAPP/protagonist/server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx
		let sql = "select a.n_file, a.t_att, b.n_file n_title " +
		          " from tb_shopinput_file  a " +
				  "      join tb_shopmag_file b on a.i_shop = b.i_shop and a.i_ser = b.i_ser and b.f_gubun = '" + f_gubun + "'" +
				  " where a.i_shop = '" + i_shop + "' "+
				  "   and a.i_no = " + i_no ;
		const [files] = await db.execute(sql); 

		//  console.log(files);
		var zip = new require('node-zip')();
		files.forEach((data) => {
			var tPath = fPath + data.t_att;
			if (fs.existsSync(tPath)) {
				t_path = tPath.split("/").slice(0, -1).join("/");
				// var t_file = tPath.substring(tPath.lastIndexOf('/') + 1);
				// var to_path = t_path + "/" + data.n_file;
				
				// fs.copyFileSync(tPath, to_path);   // 파일명 변경 작업
				// fs.unlinkSync(to_path);  // 압축후 파일 삭제
				var nfilename = "";
				if(f_filetype == "2") { 
					nfilename = data.n_title + tPath.substring(tPath.lastIndexOf('.')) ;					
				} else {
					nfilename = data.n_file;
				}
				zip.file(nfilename, fs.readFileSync(tPath));
			}

		});
		
		if (t_path) {
			var data = zip.generate({base64:false, compression:'DEFLATE'});
			fs.writeFileSync(`${t_path}/zip.zip`, data, 'binary');
			const file = fs.readFileSync(`${t_path}/zip.zip`);	
			return file;
		}

		return ;


		// row.forEach((data) => {
		// 	clearShopmagField(data);
		// });

		// fs.exists("D:/WEBAPP/protagonist/server/upload/shopsigned/23-001/freeview/2_afUOwFG3RaccbLph.xlsx",  function(exists){
		// 	if(exists){
		// 	  console.log("exixts! : ",exists);
		// 	} else {
		// 	  console.log("No exixts! : ",exists);
		// 	}
		//    });

		// try {fs.unlinkSync(delFile);}  catch(e) {}  // 파일삭제
		// return filePath;
		

	},
	async getFileDownRes(req, res) {	
		let fPath = `${SERVER_PATH}` ;
		const { path } = req.query;		
		let filePath = fPath + path;
		
		res.download(filePath);

	},
	async getShopArgeeMag(req) {
		// 권한 확인
		if (!isGrant(req, LV.VIP)) {
			throw new Error('사용 권한이 없습니다.');
		}
		const {i_shop, f_gubun, f_serarch, chkf_arfe } = req.query;
		const sql = "select a.i_shop, a.i_no, trim(coalesce(a.n_company, a.i_userid)) n_company, a.i_userid, a.f_argeechk, "+
			  "			max(b.rnum) rnum, "+
			  "			max(if(b.rnum = 1, b.n_nm, '')) h1, max(if(b.rnum = 2, b.n_nm, '')) h2, max(if(b.rnum = 3, b.n_nm, '')) h3, max(if(b.rnum = 4, b.n_nm, '')) h4, max(if(b.rnum = 5, b.n_nm, '')) h5, max(if(b.rnum = 6, b.n_nm, '')) h6, max(if(b.rnum = 7, b.n_nm, '')) h7, max(if(b.rnum = 8, b.n_nm, '')) h8, max(if(b.rnum = 9, b.n_nm, '')) h9, max(if(b.rnum = 10, b.n_nm, '')) h10, " +
			  "			max(if(b.rnum = 11, b.n_nm, '')) h11, max(if(b.rnum = 12, b.n_nm, '')) h12, max(if(b.rnum = 13, b.n_nm, '')) h13, max(if(b.rnum = 14, b.n_nm, '')) h14, max(if(b.rnum = 15, b.n_nm, '')) h15, max(if(b.rnum = 16, b.n_nm, '')) h16, max(if(b.rnum = 17, b.n_nm, '')) h17, max(if(b.rnum = 18, b.n_nm, '')) h18, max(if(b.rnum = 19, b.n_nm, '')) h19, max(if(b.rnum = 20, b.n_nm, '')) h20, " +

			  "         max(if(b.rnum = 1 and c.f_noact <> 'N', c.t_att, '')) t1, max(if(b.rnum = 2 and c.f_noact <> 'N', c.t_att, '')) t2, max(if(b.rnum = 3 and c.f_noact <> 'N', c.t_att, '')) t3, max(if(b.rnum = 4 and c.f_noact <> 'N', c.t_att, '')) t4, max(if(b.rnum = 5 and c.f_noact <> 'N', c.t_att, '')) t5, max(if(b.rnum = 6 and c.f_noact <> 'N', c.t_att, '')) t6, max(if(b.rnum = 7 and c.f_noact <> 'N', c.t_att, '')) t7, max(if(b.rnum = 8 and c.f_noact <> 'N', c.t_att, '')) t8, max(if(b.rnum = 9 and c.f_noact <> 'N', c.t_att, '')) t9, max(if(b.rnum = 10 and c.f_noact <> 'N', c.t_att, '')) t10,  " +
			  "         max(if(b.rnum = 11 and c.f_noact <> 'N', c.t_att, '')) t11, max(if(b.rnum = 12 and c.f_noact <> 'N', c.t_att, '')) t12, max(if(b.rnum = 13 and c.f_noact <> 'N', c.t_att, '')) t13, max(if(b.rnum = 14 and c.f_noact <> 'N', c.t_att, '')) t14, max(if(b.rnum = 15 and c.f_noact <> 'N', c.t_att, '')) t15, max(if(b.rnum = 16 and c.f_noact <> 'N', c.t_att, '')) t16, max(if(b.rnum = 17 and c.f_noact <> 'N', c.t_att, '')) t17, max(if(b.rnum = 18 and c.f_noact <> 'N', c.t_att, '')) t18, max(if(b.rnum = 19 and c.f_noact <> 'N', c.t_att, '')) t19, max(if(b.rnum = 20 and c.f_noact <> 'N', c.t_att, '')) t20 " +
						
			//   "			max(if(b.rnum = 1, c.t_att, '')) t1, max(if(b.rnum = 2, c.t_att, '')) t2, max(if(b.rnum = 3, c.t_att, '')) t3, max(if(b.rnum = 4, c.t_att, '')) t4, max(if(b.rnum = 5, c.t_att, '')) t5, max(if(b.rnum = 6, c.t_att, '')) t6, max(if(b.rnum = 7, c.t_att, '')) t7, max(if(b.rnum = 8, c.t_att, '')) t8, max(if(b.rnum = 9, c.t_att, '')) t9, max(if(b.rnum = 10, c.t_att, '')) t10, " +
			//   "			max(if(b.rnum = 11, c.t_att, '')) t11, max(if(b.rnum = 12, c.t_att, '')) t12, max(if(b.rnum = 13, c.t_att, '')) t13, max(if(b.rnum = 14, c.t_att, '')) t14, max(if(b.rnum = 15, c.t_att, '')) t15, max(if(b.rnum = 16, c.t_att, '')) t16, max(if(b.rnum = 17, c.t_att, '')) t17, max(if(b.rnum = 18, c.t_att, '')) t18, max(if(b.rnum = 19, c.t_att, '')) t19, max(if(b.rnum = 20, c.t_att, '')) t20 " +
						
			  "	from tb_shopinput a " +
			  "			left outer  join  (select i_shop, i_ser, f_gubun,  @rownum := @rownum+1 AS rnum, n_nm " +
			  "								from tb_shopmag_file, (SELECT @rownum := 0) AS R " +
			  "							where i_shop = '" + i_shop + "' and f_gubun = '3' order by i_sort) b on a.i_shop = b.i_shop " +
			  "			left outer join tb_shopinput_file c on a.i_shop = c.i_shop and a.i_no = c.i_no and b.i_ser = c.i_ser " +
			  "	where a.i_shop = '" + i_shop + "' " +
			  "   and trim(coalesce(n_company, a.i_userid)) like '" + f_serarch + "%'" +
			  "   and coalesce(f_argeechk, 'N') like '" + chkf_arfe + "'" +			  
			  "	group by a.i_shop, a.i_no, a.n_company, a.f_argeechk " +
			  "	order by i_no " ;
		const [row] = await db.execute(sql);				
		return row;
	},
	async getShopArgeeInDetail(req) {		
		const { i_shop, i_no } = req.query;		
		const sql = "select a.i_shop, b.i_ser, b.f_gubun, b.n_nm, b.n_file, b.i_sort, if(f_yn = '1', '필수', '선낵') f_yn, c.i_no, c.f_noact, c.n_file n_filename, c.t_att " +
					" from tb_shopinput a " +
					"      left outer join tb_shopmag_file b on a.i_shop = b.i_shop and b.f_gubun = '3' " +
					"      left outer join tb_shopinput_file c on a.i_shop = c.i_shop and a.i_no = c.i_no and b.i_ser = c.i_ser " +
					" where a.i_shop = '" + i_shop + "' " +
					"   and a.i_no = " + i_no +
					" order by b.i_sort ";
		const [row] = await db.execute(sql);
       	return row;		   		
	},
	async getShopArgeeInChk(req) {		
		const { i_shop } = req.query;				
		const { mb_id } = req.user;		
		const sql = "select  count(*) as cnt " +
					" from tb_shopinput a " +
					" where a.i_shop = '" + i_shop + "' " +
					"   and a.i_userid = '" + mb_id + "' " +
					"   and a.f_dochk = 'Y' and a.f_enarachk = 'Y' ";
		const [[row]] = await db.execute(sql);
       	return row;		   		
	},
	async getShopDocChkMail(req) {		
		const title = 'Protagonist';
		const { i_shop, i_no, f_gubun } = req.query;				
		sql = "select a.i_shop, a.i_ser, b.i_no, b.f_noact, c.i_userid, u.mb_email, a.n_nm, a.n_file, b.f_noact,  b.n_file n_file2 " +
			  "  from tb_shopmag_file a " +
			  "       left outer join tb_shopinput_file b on a.i_shop = b.i_shop and a.i_ser = b.i_ser and b.i_no = " + i_no +
			  "       left outer join tb_shopinput c on b.i_shop = c.i_shop and b.i_no = c.i_no " +
       		  "       left outer join member u on c.i_userid = u.mb_id " +
			  " where a.i_shop  = '" + i_shop + "' " +
			  "   and a.f_gubun = '" + f_gubun + "' " +
			  " order by a.i_sort ";
				
		const [rows] = await db.execute(sql);
		let body = "<p>상기 제목 관련 하여 아래와 같이 첨부 서류 확인 결과 전달 드립니다.</p>";

		if (f_gubun == "1") {
			body = body + "<p></p><p>공방 신청 서류</p>"
		} else if (f_gubun == "2") {
			body = body + "<p></p><p>공방 추가 서류</p>"
		} else if(f_gubun == "3") {
			body = body + "<p></p><p>협약서 서류</p>"
		}


		let to_email = "";
		rows.forEach((data) => {
			if (!to_email) to_email = data.mb_email;
			let n_status = data.f_noact=='Y' ? "접수" : data.f_noact=='N' ? "반려" : data.f_noact=='I' ? '검토' : data.f_noact=='R' ? '검토' : '미등록';
			body = body + `<p ${data.f_noact=='Y'?'':'style="color:red"'}>${data.n_file} : 서류${n_status}</p>`;
		});
		body = body + `<p>반려된 첨부서류에 대해서 재 등록 부탁 드립니다.</p>`;
		body = body + `<p></p>.</p>감사 합니다.`
		if (!to_email) {
			console.log('이메일 주소 미확인 !!');
			return  { err: '이메일 주소 미확인 !!' }
		}
		
		try {
			// await sendMailer(`${title} 스마트공방 관리자`, to_email, '스마트공방 신청 서류 확인 안내', body);
			await sendMailer(`스마트공방 관리자`, to_email, '', '스마트공방 신청 서류 확인 안내', body);			
		} catch (e) {
			console.log(e);
			return { err: `email 발송에 필패 하였습니다.\n관리자에게 문의 주세요.` }
		}
       	return 'ok';
	},
	async postMailSend(req) {	
		
		const title = 'Protagonist';
		// const { to_email, cc_email, body } = req.query;		
		const payload = {
			...req.body,
		};
		try {		
			const tb_mailsend = {
				e_to: payload.to_email,
				e_cc: payload.cc_email,
				t_subject: payload.title,
				t_content: payload.body,
				d_crdt: moment().format('LT'),
			}
			await sendMailer(`스마트공방 관리자`, payload.to_email, payload.cc_email, payload.title, payload.body);
			const smSql = sqlHelper.Insert('tb_mailsend', tb_mailsend);
			await db.execute(smSql.query, smSql.values);
			
		} catch (e) {
			console.log(e);
			return { err: `email 발송에 필패 하였습니다.\n관리자에게 문의 주세요.` }
		}
       	return 'ok';
	},
	async shopgetEmail(req) {
		const { gubun, i_shop, i_no, i_userid } = req.query;
		let sql = "";
		if (gubun == 'S') {
			sql = "select i_email to_email from tb_shopinput where i_shop = '" + i_shop+ "' and i_no = " + i_no;
		} else if (gubun == 'TOKEN') {
			const token = req.cookies.token;
			const { mb_id } = jwt.vetify(token);
			sql = "select mb_email to_email from member where mb_id = '" + mb_id + "'";
		} else {
			sql = "select mb_email to_email from member where mb_id = '" + i_userid + "'";
		}
		
		const [row] = await db.execute(sql);
       	return row;	
	},


}
module.exports = shopinfoModel;
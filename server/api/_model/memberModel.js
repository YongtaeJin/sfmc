const fs = require('fs');
const path = require('path');

const db = require('../../plugins/mysql');
const jwt = require('../../plugins/jwt');
const sendMailer = require('../../plugins/sendMailer');

const sqlHelper = require('../../../util/sqlHelper');
const TABLE = require('../../../util/TABLE');
const { LV } = require('../../../util/level');
const moment = require('../../../util/moment');
const { getIp, getIdComDiv } = require('../../../util/lib');

function clearMemberField(member) {
	delete member.p_password;
	member.d_create_at = moment(member.d_create_at).format('LT');
	member.d_update_at = moment(member.d_update_at).format('LT');
	if (member.mb_login_at) {
		member.d_login_at = moment(member.d_login_at).format('LT');
	}
	if (member.d_leave_at) {
		member.d_leave_at = moment(member.d_leave_at).format('LT');
	}	
	return member;
}

async function getDefaultMemberLevel() {
	const sql = sqlHelper.SelectSimple(
		TABLE.MEMBER,
		null,
		['COUNT(*) AS cnt']
	);
	const [[{ cnt }]] = await db.execute(sql.query);
	return cnt == 0 ? LV.SUPER : LV.MEMBER;
}

const memberModel = {
	async duplicateCheck({ field, value }) {
		// SELECT COUNT(*) AS cnt FROM member WHERE mb_id=?;
		const sql = sqlHelper.SelectSimple(
			TABLE.MEMBER,
			{ [field]: value },
			['COUNT(*) AS cnt']
		);
		const [[row]] = await db.execute(sql.query, sql.values);
		return row;
	},
	async createMember(req) {
		const at = moment().format('LT');
		const ip = getIp(req);

		const payload = {
			...req.body,
			i_level: await getDefaultMemberLevel(),
			d_create_at: at,
			t_create_ip: ip,
			d_update_at: at,
			t_update_ip: ip,			
		}
		// 이미지 업로드 처리
		delete payload.mb_image;
		const fileName = jwt.getRandToken(16);
		if (req.files && req.files.mb_image) {
			payload.mb_photo = `/upload/memberPhoto/${fileName}.jpg`;
			req.files.mb_image.mv(`${MEMBER_PHOTO_PATH}/${fileName}.jpg`, (err) => {
				if (err) {
					console.log("Member Image Upload Error", err);
				}
			});
		}

		payload.p_password = jwt.generatePassword(payload.p_password);
		const sql = sqlHelper.Insert(TABLE.MEMBER, payload);
		const [row] = await db.execute(sql.query, sql.values);
		await db.execute('COMMIT');
		return row.affectedRows == 1;
	},
	async updateMember(req) {
		// return {body : req.body, file:req.files};
		console.log("req.files", req.files);
		const at = moment().format('LT');
		const ip = getIp(req);

		const payload = {
			...req.body,
			d_update_at : at,
			t_update_ip : ip,
		};
		

		const admMode = payload.admMode;
		const mb_id = payload.i_id;
		const deleteImage = payload.deleteImage;
		delete payload.admMode;
		delete payload.i_id;
		delete payload.deleteImage;

		// 비밀번호가 변경 해야 한다
		if(payload.p_password) {			
			payload.p_password = jwt.generatePassword(payload.p_password);
		} else {
			delete payload.t_password;			
		}

		// 이미지 처리
		delete payload.mb_image;
		const t_photo = payload.t_photo || '';
		const photoPathInfo = path.parse(t_photo);
		const oldName = photoPathInfo.name;
		const oldFile = `${MEMBER_PHOTO_PATH}/${oldName}.jpg`;
		const cachePath = `${MEMBER_PHOTO_PATH}/.cache`;

		console.log(mb_photo, photoPathInfo); ///////////////////////////////

		// 기존 이미지 삭제
		if(deleteImage || (req.files && req.files.mb_image)) {
			payload.t_photo = '';
			try {
				fs.unlinkSync(oldFile);
				const cacheDir = fs.readdirSync(cachePath);
				for(const p of cacheDir) {
					if(p.startsWith(oldName)) {
						try {
							fs.unlinkSync(`${cachePath}/${p}`);
						} catch(e) {}
					}
				}
			} catch(e) {}
		}

		// 이미지 업로드 되었으면 처리
		if(req.files && req.files.mb_image) {
			const newName = jwt.getRandToken(16);
			payload.t_photo = `/upload/memberPhoto/${newName}.jpg`;
			const newFile = `${MEMBER_PHOTO_PATH}/${newName}.jpg`;
			req.files.mb_image.mv(newFile, (err)=>{
				if(err) {
					console.log('Member Photo 업로드 실패', err);
				}
			})
		}

		const sql = sqlHelper.Update(TABLE.MEMBER, payload, {i_id});
		const [row] = await db.execute(sql.query, sql.values);
		await db.execute('COMMIT');
		return await memberModel.getMemberBy({i_id});
	},
	async getMemberBy(form, cols = []) {
		// const sql = sqlHelper.SelectSimple(TABLE.MEMBER, form, cols);
		// console.log("getMemberBy", form);

		const { p_idcom, p_password, c_com, i_id } = form;
		const sql = { query: null, values:[]};
		if (p_idcom) {
			let idcom = getIdComDiv(p_idcom);
			delete form.p_idcom;			
			form.i_id = idcom[0];
			form.c_com = idcom[1];				
			sql.query = "select 'system' c_com, i_id, p_password, n_name, i_level, i_provider  from tb_member where 'system'=? and i_id=? and p_password=? and  d_leave_at is null " +
						"union " +
			 			"select c_com, i_id, p_password, n_name, i_level, null i_provider from tb_users where c_com=? and i_id=? and p_password=? and f_use = 'Y' and d_leave_at is null "
			sql.values.push(idcom[1]); sql.values.push(idcom[0]); sql.values.push(p_password);   // tb_member where
			sql.values.push(idcom[1]); sql.values.push(idcom[0]); sql.values.push(p_password);   // tb_users where			
			// console.log("aaa", sql)
		} else {						
			sql.query = "select 'system' c_com, i_id, p_password, n_name, i_level, i_provider  from tb_member where 'system'=? and i_id=? " +
						"union " +
			 			"select c_com, i_id, p_password, n_name, i_level, null i_provider from tb_users where c_com=? and i_id=?  "
			// sql.values.push(form.c_com|"-"); sql.values.push(form.i_id);   // tb_member where
			// sql.values.push(form.c_com|"-"); sql.values.push(form.i_id);   // tb_users where
			sql.values.push(c_com); sql.values.push(i_id);
			sql.values.push(c_com); sql.values.push(i_id);
		}
		const [[row]] = await db.execute(sql.query, sql.values);
		if (!row) {			
			throw new Error('존재하지 않는 회원입니다.');
		}
		
		return clearMemberField(row);
	},
	loginMember(req) {
		// getMemberBy -> 확인후 -> 접속시간, IP 저장
		const { i_id, c_com } = req.body;
		const data = {
			d_login_at: moment().format('LT'),
			t_login_ip: getIp(req),
		};
		if (c_com == "system") {
			const sql = sqlHelper.Update(TABLE.MEMBER, data, { i_id });
			db.execute(sql.query, sql.values);
		} else {
			const sql2 = sqlHelper.Update(TABLE.USERS, data, { i_id, c_com });
			db.execute(sql2.query, sql2.values);
		}
		const logsql = `insert into tb_login (c_com, i_id, d_loing, i_ip) values ('${c_com}', '${i_id}', '${data.d_login_at}', '${data.t_login_ip}')`;
		db.execute(logsql);
		db.execute('COMMIT');
		return data;
	},
	async findId(data) {
		const sql = sqlHelper.SelectSimple(TABLE.MEMBER, data, ['i_id']);
		const [[row]] = await db.execute(sql.query, sql.values);
		if (!row) throw new Error('일치하는 회원이 없습니다.');
		return row;
	},
	async findPw(req) {
		// 검색을 해서 일치 하는 회원이 있는 보고
		const data = req.query;
		const sql = sqlHelper.SelectSimple(TABLE.MEMBER, data, ['n_name']);
		const [[member]] = await db.execute(sql.query, sql.values);
		if (!member) throw new Error('일치하는 회원정보가 없습니다.');

		// sm_to, sm_type, sm_hash, sm_subject, sm_content, sm_create_at, sm_expire_at
		// 있으면 토큰 하나 발급
		const sm_hash = jwt.getRandToken(64);
		const title = 'SFMC'; // 나중에 사이트 설정갑에서 가지고 오자
		const sm_subject = `${title} 비밀번호 찾기`;
		const sm_create_at = moment().format('LT');
		const expire_at = moment().add('30', 'm');

		const hostName = req.headers['x-forwarded-host'] || req.headers.host;
		const baseUrl = `${req.protocol}://${hostName}/modifyPassword/`;

		let sm_content = fs.readFileSync(__dirname + '/findPwForm.html').toString();
		sm_content = sm_content.replace('{{name}}', member.n_name);
		sm_content = sm_content.replace('{{time}}', expire_at.format('LLLL') + '분');
		sm_content = sm_content.replace('{{link}}', baseUrl + sm_hash);

		const sm = {
			sm_to: data.mb_email,
			sm_type: 1,
			sm_hash,
			sm_subject,
			sm_content,
			sm_create_at,
			sm_expire_at: expire_at.format('LT'),
		}

		try {
			await sendMailer(`${title} 관리자`, data.mb_email, sm_subject, sm_content);
			const smSql = sqlHelper.Insert(TABLE.SEND_MAIL, sm);
			await db.execute(smSql.query, smSql.values);
		} catch (e) {
			console.log(e);
			return { err: `email 발송에 필패 하였습니다.\n관리자에게 문의 주세요.` }
		}
		await db.execute('COMMIT');
		return member;
	},
	async modifyPassword(data) {
		// 유효시간이 경과된 거 삭제
		const delQuery = `DELETE FROM ${TABLE.SEND_MAIL} WHERE sm_type=1 AND sm_expire_at < NOW()`;
		await db.execute(delQuery);
		// 유효시간 안에 해쉬로 검색
		const sql = {
			query: `SELECT sm_to FROM ${TABLE.SEND_MAIL} WHERE sm_type=? AND sm_hash=? AND sm_expire_at > NOW()`,
			values: [1, data.hash],
		};
		const [[row]] = await db.execute(sql.query, sql.values);
		// 없으면 에러
		if (!row) {
			throw new Error('시간이 만료되었거나 이미 처리되었습니다.');
		}
		// 있으면 비밀번호를 변경 하고
		const e_email = row.sm_to;
		const p_password = await jwt.generatePassword(data.password);
		const upSql = sqlHelper.Update(TABLE.MEMBER, { p_password }, { e_email });
		const [upRes] = await db.execute(upSql.query, upSql.values);

		// 처리한거 삭제
		const delSql = sqlHelper.DeleteSimple(TABLE.SEND_MAIL, { sm_hash: data.hash });
		db.execute(delSql.query, delSql.values);
		await db.execute('COMMIT');
		return upRes.affectedRows == 1;
	},
	async loginSocial(req, data) {
		let member = null;
		const { id, provider, email, nickname, image }  = data;
		
		try {
			member = await memberModel.getMemberBy({ e_email: email })
		} catch (e) {
			const at = moment().format('LT');
			const ip = getIp(req);
			const data = {
				i_id: id,
				p_password: '',
				i_provider : provider,
				n_name: nickname,
				e_email: email,
				t_photo: image,
				i_level: await getDefaultMemberLevel(),
				d_create_at: at,
				t_create_ip: ip,
				d_update_at: at,
				t_update_ip: ip,
			};
			const sql = sqlHelper.Insert(TABLE.MEMBER, data);
			await db.execute(sql.query, sql.values);
			member = await memberModel.getMemberBy({ e_email: email });
		}
		await db.execute('COMMIT');
		return member;
	},
	async socialCallback(req, res, err, member) {
		let html = fs.readFileSync(__dirname + '/socialPopup.html').toString();
		let payload = {};
		if (err) {
			payload.err = err;
		} else {
			// 토큰 만들고 쿠키 설정
			const token = jwt.getToken(member);
			req.body.mb_id = member.i_id;
			const data = memberModel.loginMember(req);
			member.d_login_at = data.d_login_at;
			member.t_login_ip = data.t_login_ip;
			res.cookie('token', token, { httpOnly: true });
			payload.member = member;
			payload.token = token;
		}

		html = html.replace('{{payload}}', JSON.stringify(payload));
		return html;
	},
	async checkPassword(req) {
		if(!req.user) {
			throw new Error('로그인 되어 있지 않습니다.');
		}
		const data = {
			i_id : req.user.i_id,
			p_password : await jwt.generatePassword(req.body.p_password),
		};
		const sql = sqlHelper.SelectSimple(TABLE.MEMBER, data, ['COUNT(*) AS cnt']);
		const [[{cnt}]] = await db.execute(sql.query, sql.values);
		if(cnt == 0) {
			throw new Error('비밀번호가 올바르지 않습니다.');
		} else {
			return true;
		}
	}
};

module.exports = memberModel;
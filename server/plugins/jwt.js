require('dotenv').config();
const jwt = require('jsonwebtoken');
const randToken = require('rand-token');
const crypto = require('crypto');

const { SECRET_KEY } = $config.server;

const options = {
	algorithm : 'HS256',
	issuer : 'Itsjin',
	// expiresIn : '30m',
};

const token = {
	getRandToken(len = 64) {
		return randToken.generate(len);
	},
	generatePassword(password) {
		return crypto.pbkdf2Sync(password, SECRET_KEY, 10, 64, 'sha512').toString('base64');
	},	
	getToken(user) {
		const payload = {
			i_id : user.i_id,
			c_com : user.c_com
		};
		return jwt.sign(payload, SECRET_KEY, options);
	},
	vetify(token) {
		try {
			return jwt.verify(token, SECRET_KEY);
		} catch(e) {
			return {err : e.message}
		}
	}
};

module.exports = token;


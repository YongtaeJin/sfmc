require('dotenv').config();
const nodemailer = require('nodemailer');

const { NODEMAILER_USER, NODEMAILER_PASS } = $config.server;

const transPorter = nodemailer.createTransport({
	service : 'gmail',
	host : 'smtp.gamil.com',
	port : 587,
	secure : false,
	auth : {
		user: NODEMAILER_USER,
		pass : NODEMAILER_PASS
	},
});

function sendMailer() {
	let instance = null;
	return {
		getInstance : function() {
			if(instance == null) {
				instance = async(from, to, cc, subject, html) => {					
					const info = await transPorter.sendMail({
						// from : `"스마트공방 관리자" <${NODEMAILER_USER}>`,
						from : `${from} <${NODEMAILER_USER}>`,
						to,
						cc,
						subject,
						html,
					});
					console.log("form:", NODEMAILER_USER);
					console.log("SendMailer Info", info);
					return info;
				};
			}
			return instance;
		}
	}
}
module.exports = sendMailer().getInstance();
const nodemailer = require('nodemailer');
const hbs = require('hbs');
var engine = require('engine-handlebars');
const juice = require('juice');
const htmlToText = require('html-to-text');
const promisify = require('es6-promisify');

const transport = nodemailer.createTransport({
	//host: process.env.MAIL_HOST,
	//port: process.env.MAIL_PORT,
	service: "Gmail",
  	debug: true,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASS
	}
});

const generateHTML = async (filename, options = {}) =>{
	let blas;
	await engine.__express(`${__dirname}/../views/email/${filename}.hbs`, options, (err, res)=>{
		 blas = juice(res);
	})
	return(blas);
}	
	
exports.send = async(options) =>{
	const html = await generateHTML(options.filename, options);
	const text = htmlToText.fromString(html);
	const mailOptions = {
		from: `me <mail@mail.com>`,
		to: options.user.email,
		subject: options.subject,
		html,
		text
	};
	const sendMail = promisify(transport.sendMail, transport);
	return sendMail(mailOptions);
}
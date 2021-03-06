const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const request = require("request");
const tumblr = require("../handlers/tumblr_posts");

exports.loginForm = async (req, res) => {
	var some = await tumblr.GetRandomTumblrImage();
	res.render('login', {
		welcomeMessage: 'Login',
		pageTitle: 'Login page',
		backimage: some
	});
};

exports.registerForm = (req, res) => {
	res.render('register', {
		welcomeMessage: 'Register',
		pageTitle: 'Register page'
	});
};

exports.validateRegister = (req, res, next) =>{
	req.sanitizeBody('name');
	req.checkBody('name', 'You must supply a name').notEmpty();
	req.checkBody('email', 'That email is not valid').isEmail();
	req.sanitizeBody('email').normalizeEmail({
		remove_dots: false,
		remove_extension:false,
		gmail_remove_subaddress: false
	});
	req.checkBody('password', 'Password can not be blank!').notEmpty();
	req.checkBody('password-confirm', 'Confrimed-password can not be blank!').notEmpty();
	req.checkBody('password-confirm', 'Oops your passwords do not match!').equals(req.body.password);

	const errors = req.validationErrors();
	if(errors){
		req.flash('error', errors.map(err=>err.msg));
		res.render('register', {
		welcomeMessage: 'Register',
		body: req.body,
		flashes: req.flash()
		});
		return;
	}
	next();
}

 exports.register = async (req, res, next)=>{
 	const user = new User({
 		email: req.body.email,
 		name: req.body.name,
 	});
 	const register = promisify(User.register, User);

 	try{
 		await register(user, req.body.password);
 	}catch(e){
 		req.flash('error', `Can not create user. Eroor massege = ${e}`);
		return res.redirect('/register');
 	}// res.send('it works!!!');
 	next();
 }

 exports.account = (req, res) =>{
 	res.render('account', {
 		welcomeMessage: 'Personal page',
		pageTitle: 'Personal page'
 	})
 }

 exports.updateAccount = async (req, res, next) =>{

 	const updates = {};
	if(req.body.name){
		updates.name = req.body.name;
	}
	if(req.body.email){
		updates.email = req.body.email;
		req.checkBody('email', 'That email is not valid').isEmail();
	}

 	
 	const errors = req.validationErrors();
 	if(errors){
		req.flash('error', errors.map(err=>err.msg));
		res.render('account', {
		welcomeMessage: 'account',
		body: req.body,
		flashes: req.flash()
		});
		return;
	}
 	const user = await User.findOneAndUpdate(
 		{_id : req.user._id },
 		{$set: updates},
 		{new:true, runValidators:true, context: 'query'}
 	);
 	if(!user){
 		req.flash('error', 'Something went wrong');
 		return res.redirect('/account')
 	}
 	req.flash("success", "Updated the profile!");
 	res.redirect('/account')
 }
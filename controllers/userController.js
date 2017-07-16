const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
	res.render('login', {
		welcomeMessage: 'Login',
		pageTitle: 'Login page'
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
		console.log(errors);
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

 exports.updateAccount = async (req, res) =>{
 	const updates = {
 		name:req.body.name,
 		email:req.body.email
 	};

 	const user = await User.findOneAndUpdate(
 		{_id : req.user._id },
 		{$set: updates},
 		{new:true, runValidators:true, context: 'query'}
 	);
 	req.flash("success", "Updated the profile!");
 	res.redirect('/account');
 }
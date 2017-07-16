const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

exports.login = passport.authenticate('local', {
	failureRedirect: '/login',
	failureFlash: 'Failed login!',
	successRedirect: '/account',
	 successFlash: 'You are now logged in!'
});


exports.logout = (req, res) =>{
	req.logout();
	req.flash("success", "You're logout");
	res.redirect('/login');
}

exports.isLoggedIn = (req, res, next)=>{
	if(req.isAuthenticated()){
		next();
		return;
	}else{
		req.flash('error', "Oops, you must be logged in");
		res.redirect('/login'); 
	}
}

exports.forgot = async (req, res)=>{
	const user = await User.findOne({email : req.body.email});
	if(!user){
		req.flash('error', "No account with this email exist");
		return res.redirect('/login');
	}

	user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
	user.resetPasswordExpires = Date.now() + 3600000;

	await user.save();

	const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
	await mail.send({
		user,
		filename: 'password-reset',
		subject: 'Password reset',
		resetUrl
	})

	req.flash('success', `You have been emailed a password reset link. ${resetUrl}`);

	res.redirect('/login');
 }

 exports.reset = async (req, res)=>{
 	const user = await User.findOne({
 		resetPasswordToken: req.params.token,
 		resetPasswordExpires: { $gt: Date.now()}
 	});
 	if(!user){
 		req.flash('error', "Password reset is invalid or has expired");
		return res.redirect('/login');
 	}

 	res.render('reset', {
 		welcomeMessage: 'reset page',
		pageTitle: 'reset page'
 	})
 }

 exports.confrimedPasswords = (req, res, next)=>{
 	if(req.body.password===req.body['password-confirm']){
 		next();
 		return;
 	}
 	req.flash('error', "Password do not match");
 	res.redirect('back');
 }

exports.update = async (req, res)=>{
 	const user = await User.findOne({
 		resetPasswordToken: req.params.token,
 		resetPasswordExpires: { $gt: Date.now()}
 	});
 	if(!user){
 		req.flash('error', "Password reset is invalid or has expired");
		return res.redirect('/login');
 	}

 	const setPassword = promisify(user.setPassword, user);
 	await setPassword(req.body.password);

 	user.resetPasswordToken = undefined;
	user.resetPasswordExpires = undefined;
	const updatedUser  = await user.save();
	await req.login(updatedUser);
	req.flash('success', 'Nice! Your password has been reset');
	res.redirect('/user');
 }
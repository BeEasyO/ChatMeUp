const express = require('express');
const router = express.Router();
const passport = require('passport');
const userController = require('../controllers/userController.js');
const authController = require('../controllers/authController.js');
const { catchErrors } = require('../handlers/erros');

router.get('/login', userController.loginForm);
router.post('/login', authController.login);

router.get('/register', userController.registerForm);
router.post('/register', 
	userController.validateRegister,
	userController.register,
	authController.login
	)

router.get('/user', authController.isLoggedIn, (req, res) => {
	res.render('user', {
		welcomeMessage: 'user',
		pageTitle: 'user page'
	});
});

router.get('/auth/facebook', passport.authenticate('facebook', { authType: 'rerequest', scope: ['user_friends', 'manage_pages'] }));

router.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/login'}),
	  function(req, res) {
	    res.redirect('/account');
	  }
  );

router.get('/auth/google', passport.authenticate('google',  {scope: ['email', 'profile'] }));

router.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login'}),
	  function(req, res) {
	    res.redirect('/account');
	  }
  );
router.get('/connect/facebook', passport.authenticate('facebook',  {scope: ['user_friends', 'manage_pages'] }));
router.get('/connect/google', passport.authenticate('google',  {scope: ['email', 'profile'] }));



router.get('/logout', authController.logout);

router.get('/account', authController.isLoggedIn, userController.account);
router.post('/account', catchErrors(userController.updateAccount));
router.post('/account/forgot', catchErrors(authController.forgot));
router.get('/account/reset/:token', catchErrors(authController.reset));
router.post('/account/reset/:token', 
	authController.confrimedPasswords, 
	catchErrors(authController.update)
);
module.exports = router;
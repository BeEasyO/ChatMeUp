const passport = require('passport');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const FacebookStrategy = require('passport-facebook').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

passport.use(User.createStrategy());
// passport.serializeUser(User.serializeUser());
// passport.deserializeUser(User.deserializeUser());
	passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

passport.use(new FacebookStrategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: "https://chat-me-up.herokuapp.com/auth/facebook/callback",
    profileFields: ['id', 'displayName', 'email'],
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, cb) {
    process.nextTick(function(){
        //user is not logged in yet
        if(!req.user){
            User.findOne({'facebook.id': profile.id}, (err, user) => {
                if(err){
                    return cb(err);
                }
                if(user)
                    return cb(null, user);
                else{
                    const newUser = new User();
                    //newUser.email = profile.emails[0].value;
                    //newUser.facebook.email    = profile.emails[0].value;
                    newUser.facebook.id    = profile.id; // set the users facebook id                   
                    newUser.facebook.token = accessToken; // we will save the token that facebook provides to the user                    
                    newUser.facebook.name  = profile.displayName; // look at the passport user profile to see how names are returned
                    newUser.save(function(err){
                        if(err)
                            throw err;
                        return cb(null, newUser);
                    })
                }
            })
        }
        //user is logged in already
        else{
            var user = req.user;
            user.facebook.id = profile.id;
            user.facebook.token = accessToken;
            user.facebook.name = profile.displayName;
            //user.facebook.email = profile.emails[0].value;
             user.save(function(err){
                        if(err)
                            throw err;
                        return cb(null, user);
                    })
        }
    	
    });
  }
));

passport.use(new GoogleStrategy({
    clientID: process.env.clientIDGoogle,
    clientSecret: process.env.clientSecretGoogle,
    callbackURL: "https://chat-me-up.herokuapp.com/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, cb) {
    process.nextTick(function(){
        User.findOne({'google.id': profile.id}, (err, user) => {
            if(err){
                return cb(err);
            }
            if(user)
                return cb(null, user);
            else{
                const newUser = new User();
                //newUser.email = profile.emails[0].value;
                newUser.google.email    = profile.emails[0].value;
                newUser.google.id    = profile.id; // set the users facebook id                   
                newUser.google.token = accessToken; // we will save the token that facebook provides to the user                    
                newUser.google.name  = profile.displayName; // look at the passport user profile to see how names are returned
                newUser.save(function(err){
                    if(err)
                        throw err;
                    return cb(null, newUser);
                })
            }
        })
    });
  }
));
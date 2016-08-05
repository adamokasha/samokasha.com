var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var mongo = require('mongodb');
var mongoose = require('mongoose');

var db = mongoose.createConnection('mongodb://'+process.env.MLABDB_SAMBLOG_USER+':'+process.env.MLABDB_SAMBLOG_PASS+'@ds017175.mlab.com:17175/samsblog');

var User = require('../models/user');

router.get('/', function(req, res, next) {
	if (req.isAuthenticated()) {
		req.flash('success', 'You are already logged in');
		if(req.user.username === 'admin'){
			res.redirect('/blog/admin');
		} else {
			res.redirect('/blog/users/home');
		}
	} else {
		res.render('login');
	}
	res.render('login');
});


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});


passport.use(new localStrategy(function(username, password, done){
	// Checking if there's a user if not throw error. getUserByUsername is a function that we created using mongoose query functions(in models)
	// we are using this function instead of the default in the passport docs
	// mongoose will fetch user!!!!
	User.getUserByUsername(username, function(err, user){
		if (err) throw err;
		if (!user){
			return done(null, false, {message: 'Unknown User'});
		}

		// Getting user password and checking
		// comparePassword is a custom function we built using bcryptjs since passport doesnt have encryption
		// isMatch is the reponse(true or false). The rest of the if else code comes from passport docs.
		// comparePassword 3rd param is a callback which we've modified to use bcrypt by passing original passport code in it.
		// Note: many of these functions were passing and their callbacks have err response (between diff modules!)
		User.comparePassword(password, user.password, function(error, isMatch){
			if(err) return done(err);
			if(isMatch){
				return done(null, user);
			} else {
				return done(null, false, {message: 'Invalid Password'});
			}
		});
	});
}));

router.post('/', function(req, res, next) {
	passport.authenticate('local', function(err, user, info){
		if (err) throw err;

		var username = req.body.username;
		var password = req.body.password;

		req.checkBody('username', 'Please enter a username').notEmpty();
		req.checkBody('password', 'Please enter a password').notEmpty();

		var errors = req.validationErrors();

		if (errors) {
			res.render('login', {errors: errors})
		} else {
				if(!user){
					req.flash('error', 'Username or password invalid.');
					res.redirect('/blog/login');
				}
				if(user.suspended){
					req.flash('error', 'Account suspended.');
					res.redirect('/blog/login');
				}
			// req.logIn will start the session
			req.logIn(user, function(err) {
				if (err) { return next(err); }
				if(user.username == 'admin'){
					req.flash('success', 'You are now logged in as Admin');
					console.log(req.session);
					res.redirect('/blog/admin');
				} else{
					req.flash('success', 'You are now logged in');
					console.log(req.session);
					res.location('/');
					res.redirect('/blog/users/home')
				}
				});
			}
	})(req, res, next)
});

// FB Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: "http://www.samokasha.com/blog/login/auth/facebook/callback",
		profileFields: ['id', 'displayName', 'photos', 'email']
  },
  function(accessToken, refreshToken, profile, done) {
	console.log(profile);
    User.findOne({ providerId: profile.id }, function (err, user) {
		if (err) throw err;
		if(!user){
			var user = new User ({
				providerId: profile.id,
				provider: profile.provider,
				username: profile.displayName,
				usernameLowerCase: profile.displayName.toLowerCase(),
				email: profile.email,
				socialMediaProfilePhoto: profile.photos[0].value
			});
			user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
            });
		} else {
			return done(err, user);
		}
    });
  }
));

router.get('/auth/facebook',
  passport.authenticate('facebook'));

router.get('/auth/facebook/callback', function(req, res, next) {
	passport.authenticate('facebook', function(err, user, info){
		if (err) throw err;
		if(user.suspended){
			req.flash('error', 'Your account is suspended.');
			res.redirect('/blog/login');
		}
		// req.logIn establishes a session
		req.logIn(user, function(err) {
			if (err) { return next(err); }

			req.flash('success','You are now logged in')
			res.redirect('/blog/users/home')

		});
	})(req,res,next);
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://www.samokasha.com/blog/login/auth/google/callback"
  },
  function(accessToken, refreshToken, profile, done) {
	console.log(profile);
	User.findOne({ providerId: profile.id }, function (err, user) {
		if (err) throw err;
		if(!user){
			var user = new User ({
				providerId: profile.id,
				provider: profile.provider,
				username: profile.displayName,
				usernameLowerCase: profile.displayName.toLowerCase(),
				email: profile.email,
				socialMediaProfilePhoto: profile.photos[0].value
			});
			user.save(function(err) {
                    if (err) console.log(err);
                    return done(err, user);
            });
		} else {
			return done(err, user);
		}
    });
  }
));

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));


router.get('/auth/google/callback', function(req, res, next) {
	passport.authenticate('google', function(err, user, info){
		if (err) throw err;
		if(user.suspended){
			req.flash('error', 'Your account is suspended.');
			res.redirect('/blog/login');
		}
		// req.logIn establishes a session
		req.logIn(user, function(err) {
			if (err) { return next(err); }
			req.flash('success','You are now logged in')
			res.redirect('/blog/users/home')
		});
	})(req,res,next);
});



module.exports = router;

var express = require('express');
var router = express.Router();
var passport = require('passport');
var localStrategy = require('passport-local').Strategy;
var aws = require('aws-sdk');
var multer = require('multer');
var multerS3 = require('multer-s3');
var s3 = new aws.S3({params: {Bucket: 'samsblog', Key: 'SUtqEuhMVINcwwsKexZfwVPgS+yr/jsrIb144YkD'}});
aws.config.update({accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY});

var upload = multer({
					storage: multerS3({
					    s3: s3,
					    bucket: 'samsblog',
							acl: 'public-read',
					    metadata: function (req, file, cb) {
					      cb(null, {fieldName: file.fieldname});
					    },
					    key: function (req, file, cb) {
					      cb(null, "avatars/" + Date.now().toString())
					    }
					  }),

					  fileFilter: function (req, file, cb) {
						if (file.mimetype !== 'image/jpeg') {
						  var err;
						  return cb(
								err = {msg:'Wrong file type. Only JPG files may be used as avatars.'}
							)
						}
						
						cb(null, true)
					  },
					  limits: {
						fileSize: 51200,
						files: 1,
					  }
					}).single('avatar');

var mongo = require('mongodb');
var mongoose = require('mongoose');

var db = mongoose.createConnection('mongodb://'+process.env.MLABDB_SAMBLOG_USER+':'+process.env.MLABDB_SAMBLOG_PASS+'@ds017175.mlab.com:17175/samsblog');

var User = require('../models/user');



router.get('/', function(req, res, next) {
	res.render('register');
});

router.get('/privacypolicy', function(req, res, next) {
	res.render('privacy');
});

router.get('/termsofuse', function(req, res, next) {
	res.render('termsofuse');
});

router.post('/', function(req,res,next){
	upload(req, res, function (err) {
		// Get form values
		var name = req.body.name;
		var email = req.body.email;
		var username = req.body.username;
		var usernameLowerCase = (function(){if(username){return username.toLowerCase()}})(username);
		var password = req.body.password;
		var password2 = req.body.password2;

		if (err) {
			// An error occurred when uploading
			console.log(err);
			var errors = [{msg : err[Object.keys(err)[0]]}];
			res.render('register', {errors: errors});
		} else {

		// Everything went fine
		if(req.file){
			var avatar = req.file.location;
		} else {
			var avatar = 'noavatar.jpg';
		}
		}

		var user = new User ({
			name: name,
			email: email,
			username: username,
			// usernameLowerCase needed because mongoose sort Z > a
			usernameLowerCase: usernameLowerCase,
			password: password,
			avatar: avatar
		})

		req.checkBody('name', 'Name field must be filled').isLength({min:5, max: 24});
		req.checkBody('email', 'Email is not valid').isLength({min:5, max: 32});
		req.checkBody('username', 'Invalid Username').isLength({min:5, max: 12});
		req.checkBody('password', 'Invalid Password').isLength({min:6, max: 12});
		req.checkBody('password2', 'Passwords do not match').equals(req.body.password2);

		var errors = req.validationErrors();

		if (errors){
			console.log(errors);
			res.render('register', {errors: errors});
		}  else {
				User.find({ usernameLowerCase: usernameLowerCase }, function(err, username){
					if (err) throw err;
					if (username.length) {
						req.flash('error', 'Username already exists. Please try another username.');
						res.redirect('/blog/register');
					} else {
						User.find({email: email}, function(err, email){
							if(email.length){
								req.flash('error', 'Email is already registered. Please try again.');
								res.redirect('/blog/register');
							} else{
								User.createUser(user, function(err){
									if (err) throw err;
									req.flash('success', 'You are now registered. Please log in below');
									res.redirect('/blog/users/login');
								});
							}
						});
					}
				});
			}
	});
});


module.exports = router;

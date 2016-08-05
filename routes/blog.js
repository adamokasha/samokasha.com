var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var customPagination = require('custom-pagination');
var nodemailer = require('nodemailer');

// Connect to database
mongoose.connect('mongodb://'+process.env.MLABDB_SAMBLOG_USER+':'+process.env.MLABDB_SAMBLOG_PASS+'@ds017175.mlab.com:17175/samsblog');

var Post = require('../models/post');

router.get('/', function(req, res, next) {
	Post.paginate({}, customPagination.paginateOptions(req), function(err, posts) {
		if (err) throw err;
		customPagination.buildPagination(req, res, posts, 'blogindex');
	});
});


router.get('/page/:page', function(req, res, next) {
	Post.paginate({}, customPagination.paginateOptions(req), function(err, posts) {		
		if (err) throw err;
		customPagination.buildPagination(req, res, posts, 'blogindex');
	});
});


router.get('/about', function(req, res, next) {
	if(req.user){
		res.render('about', {loggedIn: true});
	} else{
		res.render('about');
	}
});

router.get('/contact', function(req, res, next) {
	if(req.user){
		res.render('contact', {loggedIn: true});
	} else{
		res.render('contact');
	}
});

router.post('/contact/send', function(req, res){

	var name = req.body.name;
	var email = req.body.email;
	var message= req.body.message;

	req.checkBody('name', 'Name field is required').notEmpty();
	req.checkBody('email', 'Email field is required').isEmail();
	req.checkBody('message', 'Please write a message').notEmpty();

	var errors = req.validationErrors();

	if (errors){
		res.render('contact', {errors: errors})
	} else {
		var transporter = nodemailer.createTransport({
		service: process.env.NODEMAILER_SERVICE,
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS
			}
		});
		
		var mailOptions = {
			from: 'Sam Okasha <okasha86@hotmail.com>',
			to: 'okasha86@hotmail.com',
			subject: 'Blog Submission',
			text: 'You have a submission with the following detail... Name: ' + req.body.name + 'Email: ' + req.body.email + 'Message: ' + req.body.message,
			html: '<p>You have a submission with the following detail...</p><ul><li> Name:'+ req.body.name +'</li>'+'<li>Email: '+ req.body.email +'</li>'+'<li>Message: '+ req.body.message +'</li></ul>'
		}
		
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				req.flash('error','Your email could not be sent');
				res.redirect('/blog/contact');
			} else {
				req.flash('success','Your email was sent')
				res.redirect('/blog/contact');
			}
		});
	}
});

module.exports = router;

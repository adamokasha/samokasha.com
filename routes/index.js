var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var mongoosePaginate = require('mongoose-paginate');
var customPagination = require('custom-pagination');
var nodemailer = require('nodemailer');


router.get('/', function(req, res, next) {
	res.render('index');
});

router.post('/sendmsg', function(req, res){

	var name = req.body.name;
	var email = req.body.email;
	var message= req.body.message;

	req.checkBody('name', '*Name field is required').notEmpty();
	req.checkBody('email', '*Email field is required').isEmail();
	req.checkBody('message', '*Please write a message').notEmpty();

	var errors = req.validationErrors();

	if (errors){
		for(i=0;i<errors.length;i++){
			req.flash('errors', errors[i].msg);
		}
		res.location('/#contact');
		res.redirect('/#contact');
	} else {
		var transporter = nodemailer.createTransport({
		service: process.env.NODEMAILER_SERVICE,
		auth: {
			user: process.env.NODEMAILER_USER,
			pass: process.env.NODEMAILER_PASS
			}
		});
		
		var mailOptions = {
			from: 'Sam Okasha <okasha86@hotmail.com.com>',
			to: 'okasha86@hotmail.com',
			subject: 'Homepage Submission',
			text: 'You have a submission with the following detail... Name: ' + req.body.name + 'Email: ' + req.body.email + 'Message: ' + req.body.message,
			html: '<p>You have a submission with the following detail...</p><ul><li> Name:'+ req.body.name +'</li>'+'<li>Email: '+ req.body.email +'</li>'+'<li>Message: '+ req.body.message +'</li></ul>'
		}
		
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				req.flash('errors','*Your email could not be sent');
				res.location('/#contact');
				res.redirect('/#contact');
			} else {
				req.flash('success','*Your email was sent')
				res.location('/#contact');
				res.redirect('/#contact');
			}
		});
	}
});

module.exports = router;

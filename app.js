var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var flash = require('connect-flash');
var bcrypt = require('bcryptjs');
var multer = require('multer');
var upload = multer({ dest: 'uploads/' });
var expressValidator = require('express-validator');

var mongo = require('mongodb');
var mongoose = require('mongoose');
// Create database variable
var db = mongoose.connection;


var routes = require('./routes/index');
var blog = require('./routes/blog');
var login = require('./routes/login');
var register = require('./routes/register');
var users = require('./routes/users');
var admin = require('./routes/admin');
var posts = require('./routes/posts');

var app = express();

// Make moment global
app.locals.moment = require('moment');
// To truncate text in index so that we dont see whole blog post. Also check index.jade
app.locals.truncateText = function(text,length){
	var truncatedText = text.substring(0, length);
	return truncatedText;
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname,'public','images','favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport
app.use(passport.initialize());
app.use(passport.session());


// Connect-flash mw
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Express-validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));


app.use('/', routes);
app.use('/blog', blog);
app.use('/blog/login', login);
app.use('/blog/register', register);
app.use('/blog/users', users);
app.use('/blog/admin', admin);
app.use('/blog/posts', posts);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

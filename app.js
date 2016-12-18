

var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
 
var passport = require('passport');
var config = require('./oauth.js');
var InstagramStrategy = require('passport-instagram').Strategy;

var INSTAGRAM_CLIENT_ID = "f1137177dcc746e6859eae329e233ed5";
var INSTAGRAM_CLIENT_SECRET = "5f38d5792ae1485abc803b3a6484264a";

var db = require('./model/db'),
    blob = require('./model/blobs');

var routes = require('./routes/index'),
    blobs = require('./routes/blobs');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

  // Initialize Passport!  Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
//  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

app.use('/', routes);
app.use('/blobs', blobs);
//app.use('/users', users);



app.get('/', function (req, res) {
  res.render('index', { user: req.user })
})


app.get('/about', function(req, res){
  res.render('about.jade', { title: 'about' });
});

//PASSPORT

// serialize and deserialize
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});


passport.use(new InstagramStrategy({
    clientID: 'f1137177dcc746e6859eae329e233ed5',
    clientSecret: '5f38d5792ae1485abc803b3a6484264a',
    callbackURL: "http://127.0.0.1:3000/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function () {
      

      return done(null, profile);
    });
  }
));


// routes

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
  res.render('login', { user: req.user });
});

app.get('/auth/instagram',
  passport.authenticate('instagram'),
  function(req, res){
  });


app.get('/auth/instagram/callback', 
  passport.authenticate('instagram', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//app.listen(3000);

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


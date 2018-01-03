require('rootpath')();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var session = require('express-session');

var config = require('config.json');

var app = express();

// view engine setup
app.set('view engine', 'html');
app.set('view engine', 'ejs');
app.set('admin_path',path.join(__dirname,'views','admin'+path.sep));

// Initialize Session
app.use(session({secret: config.secret, resave: false, saveUninitialized: true}));

// Morgan Debugger
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// use JWT auth to secure the api
app.use('/api', expressJwt({ secret: config.secret }).unless({
  path: ['/api/users/authenticate', '/api/users/forgotpassword']
}));


// Making Middleware function - Application Level
function app_level_middleware(req, res, next){
  // Checking for session
  console.log("Application Level Middleware");
  next();
}

app.use(app_level_middleware);


// Making custom function for middleware for specific route
function custom_middleware(req, res, next){
  console.log("Inside Custom Middleware");
  console.log("session "+ req.session.token);
  if(req.session.token){
    next();
  }else{
    res.redirect("/admin/");
  }
}


// Routing for admin-
app.use('/admin', require('./controllers/admin/login.controller'));
app.use('/admin/logout',custom_middleware , require('./controllers/admin/logout.controller'));

app.use('/api/users' , require('./controllers/api/users.controller'));

app.use('/admin/user', custom_middleware , require('./controllers/admin/user.controller'));
app.use('/admin/bus', custom_middleware,  require('./controllers/admin/bus.controller'));
app.use('/admin/city', custom_middleware,  require('./controllers/admin/city.controller'));


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler middleware
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(req.app.get("admin_path")+"error",  {title:'Opps !!! Something went wrong.', error: err});
});

app.listen(3000, function (){
  console.log("Server Up at port 3000");
});

module.exports = app;

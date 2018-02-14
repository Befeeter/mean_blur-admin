require('rootpath')();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');
var session = require('express-session');
var ConnectRoles = require('connect-roles');
var acl = require('acl');
var mongoose = require('mongoose');

var config = require('config.json');

var app = express();

//Making DB connection for ACL Module
var dbconnection = mongoose.connect(config.connectionString, function(err) {
    if(err) console.log('MongoDb: Connection error: ' + err);
})

// view engine setup
app.set('view engine', 'html');
app.set('view engine', 'ejs');
app.set('admin_path', path.join(__dirname, 'views', 'admin' + path.sep));
app.set('email_layout_path', path.join(__dirname, 'views', 'emailLayout' + path.sep));

// Initialize Session
app.use(session({secret: config.secret, resave: false, saveUninitialized: true}));

// Morgan Debugger
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// use JWT auth to secure the api
app.use('/api', expressJwt({secret: config.secret}).unless({
  path: ['/api/users/authenticate', '/api/users/forgotpassword']
}));


// Making Middleware function - Application Level
function app_level_middleware(req, res, next) {
  // Checking for session
  console.log("Application Level Middleware");
  next();
}

app.use(app_level_middleware);


// Making custom function for middleware for specific route
function custom_middleware(req, res, next) {
  console.log("Inside Custom Middleware");
  console.log("session " + req.session.token);
  if (req.session.token) {
    next();
  } else {
    res.redirect("/admin/");
  }
}


var user = new ConnectRoles({
  failureHandler: function (req, res, action) {
    // optional function to customise code that runs when
    // user fails authorisation
    var accept = req.headers.accept || '';
    res.status(403);
    if (~accept.indexOf('html')) {
      res.render(req.app.get("admin_path") + "error", {title: 'Access Denied - You don\'t have permission to: ', error: action});
    } else {
      res.send('Access Denied - You don\'t have permission to: ' + action);

    }
  }
});

app.use(user.middleware());

//anonymous users can only access the home page
//returning false stops any more rules from being
//considered


//user.use(function (req, action) {
//    console.log(req.session.token);
//    console.log("Access Home Page .....................................");
//    if (!req.session.roles)
//        return action === 'access home page';
//});

//users logged can access to public pages


//user.use(function (req, action) {
//    console.log("Access Private Page .....................................");
//    if (req.session.roles && action != 'access private page' && action != 'access admin page')
//        return true;
//});

//moderator users can access private page, but
//they might not be the only ones so we don't return
//false if the user isn't a moderator


//user.use('access private page', function (req) {
//    console.log('access private page..........................................');
//    if (req.user.roles === 'moderator') {
//        return true;
//    }
//});


//admin users can access all pages

user.use("access admin page", function (req) {
  console.log("########################## Roles Permission ##################");
  console.log(req.session.roles);
  if (req.session.roles === 'administrator') {

      return true;
  }
});


// ACL User Role
mongoose.connection.on('open', function (ref) {
    console.log('Connected to mongo server.');
    //var dbconnection = mongoose.connect('mongodb://localhost/acl-test', {});
	var db = mongoose.connection;
    console.log("Lets do this to " + db)
    acl = new acl(new acl.mongodbBackend(db, "acl_"));

// initialize acl system storing data in the redis backend
//acl = new acl(new acl.mongodbBackend(dbconnection, "acl_"));

    /* now assign permissions to roles */

// allow guests to view posts
    acl.allow("guest", "/index", "view");

// allow registered users to view and create posts
//acl.allow("registered users", "post", ["view", "create"]);

// allow administrators to perform any action on posts
//
    acl.allow("administrator", "/", "*");
});
mongoose.connection.on('error', function (err) {
    console.log('Could not connect to mongo server!');
    console.log(err);
});


// Routing for admin-
app.use('/admin', require('./controllers/admin/login.controller'));
app.use('/admin/logout', require('./controllers/admin/logout.controller'));

app.use('/admin/forgot', require('./controllers/admin/forgot.controller'));

app.use('/api/users', require('./controllers/api/users.controller'));

app.use('/admin/user', custom_middleware, require('./controllers/admin/user.controller'));
app.use('/admin/bus', user.can('access admin page'),require('./controllers/admin/bus.controller'));
app.use('/admin/city', custom_middleware, require('./controllers/admin/city.controller'));
app.use('/admin/customer', user.can('access admin page'), require('./controllers/admin/customer.controller'));


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handler middleware
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render(req.app.get("admin_path") + "error", {title: 'Opps !!! Something went wrong.', error: err});
});

process.env['TZ'] = 'Asia/Kolkata';

var server = app.listen(6181, function () {
  console.log('Server listening at http://' + server.address().address + ':' + server.address().port);
});

module.exports = app;

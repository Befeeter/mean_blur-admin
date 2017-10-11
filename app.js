require('rootpath')();
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressJwt = require('express-jwt');

var config = require('config.json');

var app = express();

// view engine setup
// app.set('view engine', 'ejs');
app.set('view engine', 'html');
app.set('admin_path',path.join(__dirname,'views','admin'+path.sep));

// Routing for admin-
const adminRoutes = require('./routes/adminRoutes');
app.use('/admin',adminRoutes);

// For admin Routing use
// localhost:3000/admin/

// Morgan Debugger
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Defining Routes
// app.use('/', require('./controllers/login.controller'));
// app.use('/reg', require('./controllers/reg.controller'));
// app.use('/users', require('./routes/users'));

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

app.listen(3000, function (){
	console.log("Server Up at port 3000");
})

module.exports = app;

require('rootpath')();
var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
	// log user out
	//delete req.session.token;
	console.log("Inside Login Controller");
	// res.redirect("/admin/");
	//check if session is exists
	if(req.session){
		// redirect to returnUrl
		// var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/dashboard';
		//       res.sendfile('angular/release/auth.html');
		//       res.redirect(returnUrl);
		res.sendFile(req.app.get("admin_path")+"index.html");
	}
	//
	// move success message into local variable so it only appears once (single read)
	// var viewData = { success: req.session.success};
	// delete req.session.success;


	res.render(req.app.get("admin_path")+"auth");


	// res.redirect('auth', viewData);




});

router.post('/', function (req, res) {

	// authenticate using api to maintain clean separation between layers
	request.post({
		url: config.apiUrl_local + '/users/authenticate',
		form: req.body,
		json: true
	}, function (error, response, body) {
		if (error) {
			res.render(req.app.get("admin_path")+"auth", { error: 'An error occurred !' });
		}

		if (!body.token) {
			res.render(req.app.get("admin_path")+"auth", { error: body, username: req.body.username });
		}

		// save JWT token in the session to make it available to the angular app
		req.session = body.token;
		req.userId = body.username;
		// console.log(req.session);return false;

		res.sendFile(req.app.get("admin_path")+"index.html");
	});
});

module.exports = router;

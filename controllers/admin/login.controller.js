require('rootpath')();
var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');


router.get('/', function (req, res) {
	// log user out
	delete req.session.token;
	//check if session is exists
	if(req.session.token){
		res.sendFile(req.app.get("admin_path")+"index.html");
	}

	res.render(req.app.get("admin_path")+"auth",{ success: req.session.success});

});

router.post('/', function (req, res) {

	// authenticate using api to maintain clean separation between layers
	request.post({
		url: config.apiUrl + '/users/authenticate',
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

		req.session.token = body.token;
		req.session.userId = body.username;
		req.session.roles = body.role;

		res.sendFile(req.app.get("admin_path")+"index.html");
	});
});

module.exports = router;

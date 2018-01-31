require('rootpath')();
var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');
var validator = require("email-validator");

router.get('/', function (req, res) {
	res.render(req.app.get("admin_path")+"forgot");
});

router.post('/', function (req, res) {
	//... check email is not blank ...
	if(req.body.email == '' || req.body.email == null){
		return res.render(req.app.get("admin_path")+"forgot", { error: 'The field email is required!' });
	}

	if(validator.validate(req.body.email)==false){
		return res.render(req.app.get("admin_path")+"forgot", { error: 'Please enter a valid email!' });
	}

	// authenticate using api to maintain clean separation between layers

	request.post({
		url: config.apiUrl + '/users/forgotpassword',
		form: req.body,
		json: true
	}, function (error, response, body) {

		if (error) {
			return res.render(req.app.get("admin_path")+"forgot", { error: 'An error occurred !' });
		}
		if (response.statusCode !== 200) {
			return res.render(req.app.get("admin_path")+"forgot", {
				error: response.body,
				email: req.body.email
			});
		}
		// return to login page with success message
		req.session.success = response.body;
		return res.redirect("/admin/");
	});
});

module.exports = router;

require('rootpath')();
var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
	console.log('Inside get Reg controller');
	// return false;
    // log user out
    //delete req.session.token;	

	// check if session is exists
	// if(req.session.token){
	// 	// redirect to returnUrl
	// 	var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/dashboard';
    // res.sendfile('angular/release/auth.html');
	// 	res.redirect(returnUrl);
// }
// 
    // move success message into local variable so it only appears once (single read)
    // var viewData = { success: req.session.success};
    // delete req.session.success;

    // router.use('auth', express.static('public/release'));

    // res.sendfile('angular/release/reg.html');
    res.render('angular/release/reg.html',{
        title:'Yes'
    });
    // res.redirect('auth', viewData);


});

router.post('/', function (req, res) {
    console.log('Inside controller Post');
    return false;
    // console.log(config.apiUrl_local);
    // authenticate using api to maintain clean separation between layers    
    request.post({
        url: config.apiUrl_local + '/users/authenticate',
        form: req.body,
        json: true
    }, function (error, response, body) {		
        if (error) {			
            return res.render('login', { error: 'An error occurred !' });
        }
        // console.log("API RESPONSE:");
        // console.log(response);
        console.log('After api and service');
        console.log(body);

        if (!body.token) {			
            return res.render('login', { error: body, username: req.body.username });
        }

        // save JWT token in the session to make it available to the angular app
        req.session.token = body.token;

        // redirect to returnUrl
        var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/dashboard';
        res.redirect(returnUrl);
    });
});

module.exports = router;

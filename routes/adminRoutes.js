var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {

	//check if session is exists
	// if(req.session.token){
		
		// var returnUrl = req.query.returnUrl && decodeURIComponent(req.query.returnUrl) || '/dashboard';
		// res.redirect(returnUrl);

	// 	res.sendFile(req.app.get("admin_path")+"index.html");
	// }

	res.sendFile(req.app.get("admin_path")+"auth.html");

});



router.post('/', function(req,res){

	console.log("Inside Login Post");
	console.log(req);
	return false;


	// Now validating the email and password
	



});

module.exports = router;
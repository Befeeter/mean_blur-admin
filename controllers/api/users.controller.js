var config = require('config.json');
var express = require('express');
var router = express.Router();
var userService = require('services/user.service');
var generatePassword = require("services/passwordGenerator.service");

var emailTemplateService = require('services/emailTemplate.service');
var nodemailerService = require('services/nodemailer.service');

var multer  = require('multer');
var crypto = require ("crypto");
var mime = require('mime');
var storage = multer.diskStorage({
	  destination: function (req, file, cb) {
	    cb(null, config.media_path+'profile')
	  },
	  filename: function (req, file, cb) {
		  crypto.pseudoRandomBytes(16, function (err, raw) {
		      cb(null, raw.toString('hex') + Date.now() + '.png');
		  });
	  }
});
var upload = multer({ storage: storage });

// routes
router.post('/authenticate', authenticateUser);
router.post('/register', registerUser);
router.get('/current', getCurrentUser);
router.get('/appsetting', getSetting);
router.put('/:_id', upload.single('profile_image'), updateUser);
router.put('/setting/:_id', updateSetting);
router.delete('/:_id', deleteUser);

router.put('/changePassword/:_id', changePassword);
router.post('/forgotpassword', forgotpassword);

module.exports = router;

function authenticateUser(req, res) {

    userService.authenticate(req.body.username, req.body.password)
        .then(function (token) {
            if (token) {
                // authentication successful
                res.send({ token: token, username: req.body.username });
            } else {
                // authentication failed
                res.status(401).send('Incorrect username or password');
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerUser(req, res) {
    userService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getCurrentUser(req, res) {
    userService.getById(req.user.sub)
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function getSetting(req, res) {

    userService.getSetting()
        .then(function (user) {
            if (user) {
                res.send(user);
            } else {
                res.sendStatus(404);
            }
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.update(userId, req.body, req.file)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function updateSetting(req, res) {
	console.log(req.body);
    var userId = req.body.adminId;

    userService.updateSetting(userId, req.body).then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function deleteUser(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only delete own account
        return res.status(401).send('You can only delete your own account');
    }

    userService.delete(userId)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}


//.............................................
function changePassword(req, res) {
    var userId = req.user.sub;
    if (req.params._id !== userId) {
        // can only update own account
        return res.status(401).send('You can only update your own account');
    }

    userService.setPassword(userId, req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

//#########################
function forgotpassword(req, res) {

    userService.forgotpassword(req.body.email)
        .then(function (user) {
            if (user) {
				var to = user.email;
				var customPassword = generatePassword.customPassword();
				userService.updatepassword(user._id, customPassword);

				var viewVars = {};
				viewVars.email = user.email;
				var titleName = '<span style="font-style:Arial, Helvetica, sans-serif;font-size:16px;color:#000;font-weight:bold;"> Hi '+user.first_name+'</span>';

				emailTemplateService.getByTitle('admin reset password').then(function(result){

					viewVars.subject = result.emailSubject;
					result.emailMessage = result.emailMessage.replace('Hi {first_name}', titleName);
					result.emailMessage = result.emailMessage.replace('{otp_code_email}', user.email);
					result.emailMessage = result.emailMessage.replace('{otp_code_password}', customPassword);
					result.emailMessage = result.emailMessage.replace(/(?:\r\n|\r|\n)/g, '<br />');
					viewVars.bodyHtml = result.emailMessage;

					nodemailerService.sendMailHtml(viewVars, "default").then(function(response){
						if(response){
							console.log("Email Sent");
							res.status(200).send("Password send to your email, Please check your email");
						}
						else{
							console.log("Email Falied");
							res.status(404).send("Somethin went wront! Please try again.");
						}
					})
					.catch(function (err) {
						console.log({"Email err":err});
						res.status(404).send(err);
					});
				})
				.catch(function (err) {
					console.log({"Email Template not found":err});
					res.status(404).send(err);
				});
            } else {
                // authentication failed
				console.log({"data":{"status":0,"msg":"Username does not exists in our database"}});
				res.status(400).send("User does not exists in our database");
            }
        })
        .catch(function (err) {
            console.log(err);
			res.status(400).send(err);
        });
}

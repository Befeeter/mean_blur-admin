var config = require('config.json');
var nodemailer = require('nodemailer');
var Q = require('q');

var path = require('path');
// var templatesDir = path.resolve(__dirname, '..', 'views'); 
var templatesDir = config.email_template_path;
// var EmailTemplate = require('email-templates').EmailTemplate;


var service = {};

service.sendMailHtml = sendMailHtml; 
service.sendMail = sendMail; 

module.exports = service;


function sendMailHtml(context, templateName) {

	var deferred = Q.defer();  
	//console.log({"templatesDir":templatesDir+"/"+templateName});
	var emailTemplate = new EmailTemplate(templatesDir+"/"+templateName);
	emailTemplate.render(context, function (err, result) { 
		//console.log({"result":result});
		var transporter = nodemailer.createTransport(config.smtpConfig);
		var mailOptions = {
			from: config.fromNameEmail, 
			to: context.email, 
			subject: result.subject, 
			text: result.text, 
			html: result.html 
		};
		//console.log({"mailOptions":mailOptions});
		transporter.sendMail(mailOptions, function (err, info) {
			if (err) deferred.reject(err.name + ': ' + err.message);
			//console.log({"info":info});
			if (info) {			 
				deferred.resolve(info);
			} else { 
				deferred.resolve();
			}
		});
	}); 	
	return deferred.promise; 		
}

function sendMail(to,subject,bodyText,bodyHtml,header) {	
	var deferred = Q.defer();
	var transporter = nodemailer.createTransport(config.smtpConfig);
	var mailOptions = {
		from: config.fromNameEmail, 
		to: to, 
		subject: subject, 
		text: bodyText, 
		html: bodyHtml 
	};
	transporter.sendMail(mailOptions, function (err, info) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		if (info) {			 
			deferred.resolve(info);
		} else {
			// owner not found
			deferred.resolve();
		}
	});
	return deferred.promise;
}
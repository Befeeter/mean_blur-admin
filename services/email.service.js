var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_emails');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'emailId');

var service = {};

service.update = update;
service.getAll = getAll;
service.getById = getById;

module.exports = service;

// To get all data of emails 
function getAll() {
    var deferred = Q.defer();
	
		db.tbl_emails.aggregate([
		{$sort:{emailId:-1}},
		{
			$project:{
			"_id" : 1,
			"emailId" : 1,
			"emailTitle" : 1,
			"type" : 1,
			"emailSubject" : 1,
			"emailMessage" : 1
			}
		}
		],function(err, result) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				
				if (result) {				
					deferred.resolve(_.omit(result, 'hash'));
				} else {				
					deferred.resolve();
				}
		});
		return deferred.promise;
}

// To get email data with unique object id of email.
function getById(_id) {
    var deferred = Q.defer();
	//console.log(_id);
	   db.tbl_emails.findById(_id, function (err, result) {
		   //console.log(result);
			if (result) {				
				deferred.resolve(_.omit(result, 'hash'));
			} else {				
				deferred.resolve();
			}
		});

    return deferred.promise;
}


function update(_id, userParam){
    var deferred = Q.defer();
	var set = { };
	
	if(userParam.emailTitle){
		set.emailTitle = userParam.emailTitle;
	} 
	if(userParam.emailSubject){
		set.emailSubject = userParam.emailSubject;
	}
	if(userParam.emailMessage){
		set.emailMessage = userParam.emailMessage;
	} 
	
	set.updatedon = new Date();
	db.tbl_emails.update(
		{ _id: mongo.helper.toObjectID(_id) },
		{ $set: set },
		function (err, doc) {
			if (err) deferred.reject(err.name + ': ' + err.message);

			deferred.resolve();
		});

    return deferred.promise;
}





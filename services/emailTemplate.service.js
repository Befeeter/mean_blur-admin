var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_emails');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'storeId');

var service = {};

service.getById = getById;
service.getAll = getAll;
service.getByTitle = getByTitle;

//service.updatePassword = updatePassword;

module.exports = service;

function getAll(_id) {
    var deferred = Q.defer();
	db.tbl_emails.find({ retailer_id: _id }).toArray(function(err, user) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		
		if (user) {			
			deferred.resolve(_.omit(user, 'hash'));		   
        } else {        
            deferred.resolve();
        }
	});
	return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
	
    db.tbl_emails.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {            
            deferred.resolve(_.omit(user, 'hash'));
        } else {            
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getByTitle(title) {
    var deferred = Q.defer();
	
    db.tbl_emails.findOne({ emailTitle: title  }, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result) {            
            deferred.resolve(result);
        } else {            
            deferred.resolve();
        }
    });

    return deferred.promise;
}




var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_country');
db.bind('tbl_region');

var service = {};

service.getAll = getAll;
service.getById = getById;
service.getStates = getStates;

module.exports = service;

// To get all data of drivers 
function getAll() {
    var deferred = Q.defer();
	db.tbl_country.find().toArray(function(err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		if (result) {
			// data found
			// return user (without hashed password)
			deferred.resolve(result);
        } else {
            // data not found
            deferred.resolve();
        }
	});
	return deferred.promise;
}

// To get driver data with unique object id of driver.
function getById(_id) {
    var deferred = Q.defer();
	
    db.tbl_country.findById(_id, function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result) {
            // data found
			// return user (without hashed password)
            deferred.resolve(result);
        } else {
            // user not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}
// To get states list by country name.
function getStates(country) {
    var deferred = Q.defer();
	//console.log(country);
    db.tbl_region.find( { country: { $eq:country } }).toArray(function (err, result) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (result) {            			
            deferred.resolve(result);
        } else {            
            deferred.resolve();
        }
    });
    return deferred.promise;
}

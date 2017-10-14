var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });

db.bind('tbl_customers');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'customerId');

var service = {};

//service.authenticate = authenticate;
service.getById = getById;
service.update = update;
service.getAll = getAll;

module.exports = service;

function getAll() {
    var deferred = Q.defer();
	db.tbl_customers.find().toArray(function(err, user) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		if (user) {
			// data found
			deferred.resolve(_.omit(user, 'hash'));
		   // deferred.resolve(user);
        } else {
            // data not found
            deferred.resolve();
        }
	});
	return deferred.promise;
}

function getById(_id) {
    var deferred = Q.defer();
	
    db.tbl_customers.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {
            // return user (without hashed password)
            deferred.resolve(_.omit(user, 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });

    return deferred.promise;
}


function update(_id, userParam, files) {
    var deferred = Q.defer();
	console.log(userParam);
	if(userParam.password != userParam.confpassword ){
		deferred.reject('Confirm Password mismatched');
	}
	else{
		//... check email exists or not ...
		db.tbl_customers.findOne({ $and: [{email: {$eq:userParam.email}}, {customerId: { $ne: userParam.customerId}} ]}, function (err, result) {
			if (err) deferred.reject(err.name + ': ' + err.message);

			if (result) {						
				// email already exists
				deferred.reject('Email "' + userParam.email + '" is already taken');
			} 
			else {
				//... check mobile number exists or not ...
				db.tbl_customers.findOne({ $and: [{mobile: userParam.mobile}, {customerId: { $ne: userParam.customerId}}]}, function (err, result2) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					
					if (result2) {				
						// mobile number already exists
						deferred.reject('Mobile Number "' + userParam.mobile + '" is already taken');
					}
					else{
						updateUser();
					}			
				});
			}
		});
	}
    // validation
    /*db.tbl_customers.findById(_id, function (err, user) {
        if (err){ deferred.reject(err.name + ': ' + err.message); }
		
		if (user.email !== userParam.email) { 			
            // email has changed so check if the new email is already taken
            db.tbl_customers.findOne({ email: userParam.email },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // email already exists
                        deferred.reject('Email "' + userParam.email + '" is already taken')
                    }else{ 
						updateUser();
					} 
                });
        }
        else {
            updateUser();
        }
    });*/
	

    function updateUser() {
        // fields to update
        var set = {};
		var user = _.omit(userParam, 'password');
		if(typeof files !='undefined' || files != null){
			if(typeof files != 'undefined') {
				if(files.profile_image){
					if(files.profile_image[0].filename){
						set.profile_image = files.profile_image[0].filename;
					} 
				}
			} 
        }
		
		if(userParam.first_name){
			set.first_name = userParam.first_name;
		}
		
		if(userParam.last_name){
			set.last_name = userParam.last_name;
		} 
	
        if(userParam.email){
			set.email = userParam.email.toLowerCase();
		}            
      
		if(userParam.country_code){
			set.country_code = userParam.country_code;
		} 		
     
        if(userParam.mobile){
			set.mobile = userParam.mobile;
		}   
        
		if(userParam.allowDeliveryTransfer){
			set.allowDeliveryTransfer = userParam.allowDeliveryTransfer;
		} 
		
		if(userParam.address){
			//set.address = JSON.parse(userParam.address);
			set.address = userParam.address;
		}  	
		if(user.hash){
			set.hash = bcrypt.hashSync(user.hash, 10);
		}
		
		set.updatedon = new Date();
	
		if(userParam.status){
			set.status = userParam.status;
		} 
		// update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }
        
        db.tbl_customers.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set }, function (err, doc) {
			if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve(doc);
		});
    }

    return deferred.promise;
}





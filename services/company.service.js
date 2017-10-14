var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_driver_company');
db.bind('tbl_drivers');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'driverCompanyId');

var service = {};

//service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.getAll = getAll;
service.delete = _delete;
service.getCompanyDriver = getCompanyDriver;

module.exports = service;

function getAll() {
    var deferred = Q.defer();
	db.tbl_driver_company.find().toArray(function(err, user) {
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
	
    db.tbl_driver_company.findById(_id, function (err, user) {
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

function create(userParam, files) {
    var deferred = Q.defer();	
    
    if(userParam.password != userParam.confpassword ){
		deferred.reject('Confirm Password mismatched');
	}
    // validation
    db.tbl_driver_company.findOne({ username: userParam.username }, function (err, user) {
		if (err) deferred.reject(err.name + ': ' + err.message);

		if (user) {				
			// username already exists
			deferred.reject('Username "' + userParam.username + '" is already taken');
		}
		else {
			db.tbl_driver_company.findOne({ email: userParam.email }, function (err, user1) {
				if (err) deferred.reject(err.name + ': ' + err.message);

				if (user1) {						
					// email already exists
					deferred.reject('email "' + userParam.email + '" is already taken');
				} 
				else {
					createUser();
				}
			});
		}
		
	});
    
	
    function createUser() {
		incrementer()
			.then( function(autoIncrementId){
				// set user object to userParam without the cleartext password
				var user = _.omit(userParam, 'password');
				// add hashed password to user object
				user.hash = bcrypt.hashSync(userParam.password, 10);
				
				var set = {};
				
				set.driverCompanyId = autoIncrementId;
				
				if(userParam.username){
					set.username = userParam.username;
				} 
				else{
					set.username = null;
				}
				if(userParam.email){
					set.email = userParam.email;
				} 
				else{
					set.email = null;
				}
				if(user.hash){
					set.hash = user.hash;
				}
				else{
					set.hash = null;
				}
				if(userParam.company_name){
					set.company_name = userParam.company_name;
				} 
				else{
					set.company_name = null;
				}
				if(userParam.contact_name){
					set.contact_name = userParam.contact_name;
				} 
				else{
					set.contact_name = null;
				}				
				if(userParam.contact_email){
					set.contact_email = userParam.contact_email;
				} 
				else{
					set.contact_email = null;
				}
				if(userParam.phone){
					set.phone = userParam.phone;
				} 
				else{
					set.phone = null;
				}				
				if(userParam.address){
					set.address = userParam.address;
				} 
				else{
					set.address = null;
				}
				
				if(userParam.country){
					set.country = userParam.country;
				} 
				else{
					set.country = null;
				}
				if(userParam.region){
					set.region = userParam.region;
				} 
				else{
					set.region = null;
				}
				if(userParam.city){
					set.city = userParam.city;
				} 
				else{
					set.city = null;
				}
				if(userParam.pincode){
					set.pincode = userParam.pincode;
				} 
				else{
					set.pincode = null;
				}
				
				if(userParam.status){
					set.status = userParam.status;
				} 
				else{
					set.status = null;
				}
				
				set.addedon = new Date();
				set.updatedon = new Date();	

				if(typeof files !='undefined' || files != null){
					if(typeof files != 'undefined') {
						if(files.profile_image){
							if(files.profile_image[0].filename){
								set.profile_image = files.profile_image[0].filename;
							} 
						}
					} 
				}
				
				db.tbl_driver_company.insert(set, function (err, doc) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					
					deferred.resolve(doc);
				});
			});
    }

    return deferred.promise;
}

function update(_id, userParam, files) {
    var deferred = Q.defer();
	
	if(userParam.password != userParam.confpassword ){
		deferred.reject('Confirm Password mismatched');
	}
    // validation
    db.tbl_driver_company.findById(_id, function (err, user) {
        if (err){
			deferred.reject(err.name + ': ' + err.message);
		}
		if (user.username !== userParam.username) { 
            // username has changed so check if the new username is already taken
            db.tbl_driver_company.findOne({ username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + userParam.username + '" is already taken')
                    }else{ 
						updateUser();
					}
                });
        }
        else if (user.email !== userParam.email) { 			
            // email has changed so check if the new email is already taken
            db.tbl_driver_company.findOne({ email: userParam.email },
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
    });

    function updateUser() {
        // fields to update
        var set = {};
		
		if(typeof files !='undefined' || files != null){
			if(typeof files != 'undefined') {
				if(files.profile_image){
					if(files.profile_image[0].filename){
						set.profile_image = files.profile_image[0].filename;
					} 
				}
			} 
        }
		
		if(userParam.username){
			set.username = userParam.username;
		} 
		else{
			set.username = null;
		}
		if(userParam.email){
			set.email = userParam.email;
		} 
		else{
			set.email = null;
		}
		// update password if it was entered
		if (userParam.password) {
			set.hash = bcrypt.hashSync(userParam.password, 10);
		}
		
		if(userParam.company_name){
			set.company_name = userParam.company_name;
		} 
		else{
			set.company_name = null;
		}
		if(userParam.contact_name){
			set.contact_name = userParam.contact_name;
		} 
		else{
			set.contact_name = null;
		}		
		if(userParam.contact_email){
			set.contact_email = userParam.contact_email;
		} 
		else{
			set.contact_email = null;
		}
		if(userParam.phone){
			set.phone = userParam.phone;
		} 
		else{
			set.phone = null;
		}		
		if(userParam.address){
			set.address = userParam.address;
		} 
		else{
			set.address = null;
		}
		
		if(userParam.country){
			set.country = userParam.country;
		} 
		else{
			set.country = null;
		}
		if(userParam.region){
			set.region = userParam.region;
		} 
		else{
			set.region = null;
		}
		if(userParam.city){
			set.city = userParam.city;
		} 
		else{
			set.city = null;
		}
		if(userParam.pincode){
			set.pincode = userParam.pincode;
		} 
		else{
			set.pincode = null;
		}
				
		if(userParam.status){
			set.status = userParam.status;
		} 
		else{
			set.status = null;
		}		
		set.updatedon = new Date();
        
        db.tbl_driver_company.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set }, function (err, doc) {
			if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve(doc);
		});
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.tbl_driver_company.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

function getCompanyDriver(companyId){
	 var deferred = Q.defer();
	//console.log(companyId);	
	db.tbl_drivers.find( { driverCompanyId: companyId } ).toArray(function(err, result) {
			if (err) deferred.reject(err.name + ': ' + err.message);
			if (result) {
				deferred.resolve(_.omit(result, 'hash'));
			} else {				
				deferred.resolve();
			}
		});
	return deferred.promise;
}

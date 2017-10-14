var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_drivers');
db.bind('tbl_review');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'driverId');

var service = {};

service.create = create;
service.update = update;
service.getAll = getAll;
service.getById = getById;
service.delete = _delete;
service.updateApplication = updateApplication;
service.getReviewRating = getReviewRating;


module.exports = service;

// To get all data of drivers 
function getAll(companyId) {
    var deferred = Q.defer();
	//console.log(companyId);
	if(companyId != 'null' && companyId != 'individual'){ 
		db.tbl_drivers.aggregate([
		{
			$match:{
				driverCompanyId:parseInt(companyId)
				}
		},
		{$sort:{driverId:-1}},
		{
			$project:{
			"_id" : 1,
			"driverId" : 1,
			"driverCompanyId" : 1,
			"profile_image" : 1,
			"first_name" : 1,
			"last_name" : 1,
			"mobile" : 1,
			"country_code" : 1,
			"address" : 1,
			"email" : 1,
			"hash" : 1,
			"device_id" : 1,
			"device_token" : 1,
			"device_type" : 1,
			"latitude" : 1,
			"longitude" : 1,
			"mobile_verified" : 1,
			"email_verified" :1,
			"heavy_oversized_package" : 1,
			"vehicle_config" :1,
			"city" : 1,
			"region" : 1,
			"country" : 1,
			"pincode" : 1,
			"locations" : 1,
			"profile_status" : 1,
			"online_status" : 1,
			"status" : 1,
			"availability" : 1,
			"addedon" : 1,
			"updatedon" : 1,
			"uuId" : 1,
			"stripe_id" : 1,
			"actualStatus": {"$cond": { 
				"if": { $eq : ["$status", 0] }, 
				"then": "Disable", //Inactive
				"else": {
					"$cond": {
						"if": { $and : [ { $eq : [ "$status", 1 ] }, { $eq : [ "$profile_status", 1 ] } ] }, 
						"then": "Active", 
						"else": {
							"$cond": {
								"if": { $eq : ["$profile_status", 2]}, 
								"then": "Rejected", 
								"else": {
									"$cond": {
										"if": { $eq : ["$profile_status", 3]}, 
										"then": "Awaiting Driver Input", 
										"else": 'Pending'
											}
										}
									}
								}
								   
							}
						}
			} }
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
	}
	else if(companyId == 'individual'){
		
		db.tbl_drivers.aggregate([
		{ $sort:{driverId:-1}},
		{
			$match:{ "driverCompanyId": {$in:[0,null,'']} }
		},
		{
			$project:{
			"_id" : 1,
			"driverId" : 1,
			"driverCompanyId" : 1,
			"profile_image" : 1,
			"first_name" : 1,
			"last_name" : 1,
			"mobile" : 1,
			"country_code" : 1,
			"address" : 1,
			"email" : 1,
			"hash" : 1,
			"device_id" : 1,
			"device_token" : 1,
			"device_type" : 1,
			"latitude" : 1,
			"longitude" : 1,
			"mobile_verified" : 1,
			"email_verified" :1,
			"heavy_oversized_package" : 1,
			"vehicle_config" :1,
			"city" : 1,
			"region" : 1,
			"country" : 1,
			"pincode" : 1,
			"locations" : 1,
			"profile_status" : 1,
			"online_status" : 1,
			"status" : 1,
			"availability" : 1,
			"addedon" : 1,
			"updatedon" : 1,
			"uuId" : 1,
			"actualStatus": {"$cond": { 
						"if": { $eq : ["$status", 0] }, 
						"then": "Inactive",
						"else": {
							"$cond": {
								"if": { $and : [ { $eq : [ "$status", 1 ] }, { $eq : [ "$profile_status", 1 ] } ] }, 
								"then": "Active", 
								"else": {
									"$cond": {
										"if": { $eq : ["$profile_status", 2]}, 
										"then": "Rejected", 
										"else": {
											"$cond": {
												"if": { $eq : ["$profile_status", 3]}, 
												"then": "Awaiting Driver Input", 
												"else": 'Pending'
													}
												}
											}
										}
										   
									}
								}
					} }
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
		
	}	
	else{
		db.tbl_drivers.aggregate([
		{$sort:{driverId:-1}},
		{
			$project:{
			"_id" : 1,
			"driverId" : 1,
			"driverCompanyId" : 1,
			"profile_image" : 1,
			"first_name" : 1,
			"last_name" : 1,
			"mobile" : 1,
			"country_code" : 1,
			"address" : 1,
			"email" : 1,
			"hash" : 1,
			"device_id" : 1,
			"device_token" : 1,
			"device_type" : 1,
			"latitude" : 1,
			"longitude" : 1,
			"mobile_verified" : 1,
			"email_verified" :1,
			"heavy_oversized_package" : 1,
			"vehicle_config" :1,
			"city" : 1,
			"region" : 1,
			"country" : 1,
			"pincode" : 1,
			"locations" : 1,
			"profile_status" : 1,
			"online_status" : 1,
			"status" : 1,
			"availability" : 1,
			"addedon" : 1,
			"updatedon" : 1,
			"uuId" : 1,
			"actualStatus": {"$cond": { 
						"if": { $eq : ["$status", 0] }, 
						"then": "Inactive",
						"else": {
							"$cond": {
								"if": { $and : [ { $eq : [ "$status", 1 ] }, { $eq : [ "$profile_status", 1 ] } ] }, 
								"then": "Active", 
								"else": {
									"$cond": {
										"if": { $eq : ["$profile_status", 2]}, 
										"then": "Rejected", 
										"else": {
											"$cond": {
												"if": { $eq : ["$profile_status", 3]}, 
												"then": "Awaiting Driver Input", 
												"else": 'Pending'
													}
												}
											}
										}
										   
									}
								}
					} }
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
	}
	
	return deferred.promise;
}

// To get driver data with unique object id of driver.
function getById(_id) {
    var deferred = Q.defer();
	
    db.tbl_drivers.aggregate([
    {
	$match:{
			_id:mongo.helper.toObjectID(_id)
		   }
	},
    {
		$project:{
		"_id" : 1,
		"driverId" : 1,
		"driverCompanyId" : 1,
		"profile_image" : 1,
		"first_name" : 1,
		"last_name" : 1,
		"mobile" : 1,
		"country_code" : 1,
		"address" : 1,
		"email" : 1,
		"hash" : 1,
		"device_id" : 1,
		"device_token" : 1,
		"device_type" : 1,
		"latitude" : 1,
		"longitude" : 1,
		"mobile_verified" : 1,
		"email_verified" :1,
		"heavy_oversized_package" : 1,
		"vehicle_config" :1,
		"city" : 1,
		"region" : 1,
		"country" : 1,
		"pincode" : 1,
		"locations" : 1,
		"home_apartment" :1,
		"profile_status" : 1,
		"online_status" : 1,
		"status" : 1,
		"availability" : 1,
		"driver_license" : 1,
		"car_insurance" : 1,
		"car_registration" : 1,
		"addedon" : 1,
		"updatedon" : 1,
		"uuId" : 1,
		"stripe_id" : 1,
		"actualStatus": {"$cond": { 
					"if": { $eq : ["$status", 0] }, 
					"then": "Inactive",
					"else": {
						"$cond": {
							"if": { $and : [ { $eq : [ "$status", 1 ] }, { $eq : [ "$profile_status", 1 ] } ] }, 
							"then": "Active", 
							"else": {
								"$cond": {
									"if": { $eq : ["$profile_status", 2]}, 
									"then": "Rejected", 
									"else": {
										"$cond": {
											"if": { $eq : ["$profile_status", 3]}, 
											"then": "Awaiting Driver Input", 
											"else": 'Pending'
												}
											}
										}
									}
									   
								}
							}
				} }
		}
    }
    ], function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user[0]) {
            // data found
			// return user (without hashed password)
            deferred.resolve(_.omit(user[0], 'hash'));
        } else {
            // user not found
            deferred.resolve();
        }
    });
    return deferred.promise;
}

// To create new driver account
function create(userParam, driverCompanyId, files) {
    var deferred = Q.defer();	
    // validation
	db.tbl_drivers.findOne({ email: userParam.email }, function (err, user) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		if (user) {
			// Drivers already exists
			deferred.reject('Drivers with "' + userParam.email + '" already exists');
		} else {
			
			db.tbl_drivers.findOne({ mobile: userParam.mobile }, function (err, user) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				if (user) {
					// Drivers already exists
					deferred.reject('Driver with "' + userParam.mobile + '" already exists');
				} else {
			
					createUser();
				 }
			});

		}
	});

    function createUser() {		
		incrementer().then( function(autoIncDriverId){
			var set = {};
			set.driverId = autoIncDriverId;
			
			if(userParam.driverCompanyId){
				set.driverCompanyId = parseInt(userParam.driverCompanyId);
			} else{
				set.driverCompanyId = null;
			}
			
			var user = _.omit(userParam, 'password');
			// add hashed password to user object
			user.hash = bcrypt.hashSync(userParam.password, 10);
		   
			if(typeof files !='undefined' || files != null){
				if(typeof files != 'undefined') {
					if(files.profile_image){
						if(files.profile_image[0].filename){
							set.profile_image = files.profile_image[0].filename;
						} 
					}
				} 
			} 		
			
			if(typeof files !='undefined' || files != null){
				if(typeof files != 'undefined') {
					if(files.driver_license){
						if(files.driver_license[0].filename){
							set.driver_license = files.driver_license[0].filename;
						}
					}				
				} 
			}
			if(typeof files !='undefined' || files != null){
				if(typeof files != 'undefined') {
					if(files.car_insurance){
						if(files.car_insurance[0].filename){
							set.car_insurance = files.car_insurance[0].filename;
						} 
					}
				} 
			}
			if(typeof files !='undefined' || files != null){
				if(typeof files != 'undefined') {
					if(files.car_registration){
						if(files.car_registration[0].filename){
							set.car_registration = files.car_registration[0].filename;
						} 
					}
				} 
			} 		
			
			if(userParam.first_name){
				set.first_name = userParam.first_name;
			} else{
				set.first_name = null;
			}
			if(userParam.last_name){
				set.last_name = userParam.last_name;
			} else{
				set.last_name = null;
			}
			if(userParam.mobile){
				set.mobile = userParam.mobile;
			} else{
				set.mobile = null;
			}
			if(userParam.country_code){
				set.country_code = userParam.country_code;
			} else{
				set.country_code = null;
			}
			if(userParam.address){
				set.address = userParam.address;
			} else{
				set.address = null;
			}
			if(userParam.email){
				set.email = userParam.email.toLowerCase();
			} else{
				set.email = null;
			}
			if(user.hash){
				set.hash = user.hash;
			}else{
				set.hash = null;
			}
			if(userParam.device_id){
				set.device_id = userParam.device_id;
			} else{
				set.device_id = null;
			}              
			if(userParam.device_token){
				set.device_token = userParam.device_token;
			}else{
				set.device_token = null;
			}             
			if(userParam.device_type){
				set.device_type = userParam.device_type;
			}else{
				set.device_type = null;
			}
			if(userParam.latitude){
				set.latitude = userParam.latitude;
			} else{
				set.latitude = null;
			} 
			if(userParam.longitude){
				set.longitude = userParam.longitude;
			}else{
				set.longitude = null;
			}
			if(userParam.mobile_verified){
				set.mobile_verified = parseInt(userParam.mobile_verified);
			} else{
				set.mobile_verified = 0;
			}
			if(userParam.email_verified){
				set.email_verified = parseInt(userParam.email_verified);
			} else{
				set.email_verified = 0;
			}			  
		
			
			if(userParam.heavy_oversized_package){
				set.heavy_oversized_package = userParam.heavy_oversized_package;
			}else{
				set.heavy_oversized_package = 0;
			}
			if(userParam.vehicle_config){
				set.vehicle_config = userParam.vehicle_config.toUpperCase();
			} else{
				set.vehicle_config = 0;
			}       		
			if(userParam.city){
				set.city = userParam.city.substr(0,1).toUpperCase() + userParam.city.substr(1);
			} else{
				set.city = null;
			} 
			if(userParam.region){
				set.region = userParam.region;
			}else{
				set.region = null;
			}              
			if(userParam.country){
				set.country = userParam.country;
			} else{
				set.country = null;
			}            
			if(userParam.pincode){
				set.pincode = userParam.pincode;
			} else{
				set.pincode = null;
			}		
			set.locations =  {
								"type" : "Point",
								"coordinates" : [ 
									parseFloat(-131.8984164), 
									parseFloat(48.4352696)
								]
							};
			if (userParam.home_apartment) {
				set.home_apartment = userParam.home_apartment;
			}	
			if(userParam.profile_status){
				set.profile_status = parseInt(userParam.profile_status);
			}else{
				set.profile_status = 0;
			}
			if(userParam.online_status){
				set.online_status = parseInt(userParam.online_status);
			}else{
				set.online_status = 0;
			}		
			if(userParam.status){
				set.status = parseInt(userParam.status);
			}else{
				set.status = 1;
			}
			if(userParam.availability){
				set.availability = parseInt(userParam.availability);
			}else{
				set.availability = 1;
			}
			
			set.stripe_id = '';
			
			set.addedon = new Date();
			set.updatedon = new Date();
			
			db.tbl_drivers.insert(set, function (err, doc) {
			
				if (err) deferred.reject(err.name + ': ' + err.message);
				
				deferred.resolve(doc);
			});			
		});	
    }//

    return deferred.promise;
}

function update(_id, userParam, files) {
    var deferred = Q.defer();
	// validation
	db.tbl_drivers.findById(_id, function (err, user) {
		if (err){
			deferred.reject(err.name + ': ' + err.message);
		}
		if (user.mobile !== userParam.mobile) { 
			// mobile has changed so check if the new mobile is already taken
			db.tbl_drivers.findOne({ mobile: userParam.mobile },
				function (err, user) {
					if (err) deferred.reject(err.name + ': ' + err.message);

					if (user) {
						// mobile already exists
						deferred.reject('Mobile "' + userParam.mobile + '" is already registered')
					}else{ 
					  updateUser();
					}
				});
		}else if (user.email !== userParam.email) { 
			// console.log(user.email+'-'+userParam.email);
			// email has changed so check if the new email is already taken
			db.tbl_drivers.findOne({ email: userParam.email },
				function (err, user) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					if (user) {
						// email already exists
						deferred.reject('Email "' + userParam.email + '" is already taken')
					}else{ 
						updateUser();
					} 
				});
		}else {
			updateUser();
		}
	});

    function updateUser() {
		 
        var set = { };
        if(userParam.driverCompanyId){
			set.driverCompanyId = parseInt(userParam.driverCompanyId);
		} else{
			set.driverCompanyId = null;
		}
			
		var user = _.omit(userParam, 'password');
        // fields to update
		if(typeof files !='undefined' || files != null){
        	if(typeof files != 'undefined') {
				if(files.profile_image){
					if(files.profile_image[0].filename){
						set.profile_image = files.profile_image[0].filename;
					} 
				}
        	} 
        } 		
		
		if(typeof files !='undefined' || files != null){
        	if(typeof files != 'undefined') {
	        	if(files.driver_license){
					if(files.driver_license[0].filename){
						set.driver_license = files.driver_license[0].filename;
					}
				}				
        	} 
        }
		if(typeof files !='undefined' || files != null){
        	if(typeof files != 'undefined') {
				if(files.car_insurance){
					if(files.car_insurance[0].filename){
						set.car_insurance = files.car_insurance[0].filename;
					} 
				}
        	} 
        }
		if(typeof files !='undefined' || files != null){
        	if(typeof files != 'undefined') {
				if(files.car_registration){
					if(files.car_registration[0].filename){
						set.car_registration = files.car_registration[0].filename;
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
		if(userParam.mobile){
			set.mobile = userParam.mobile;
		} 
		if(userParam.country_code){
			set.country_code = userParam.country_code;
		}
		if(userParam.address){
			set.address = userParam.address;
		}
        if(userParam.email){
			set.email = userParam.email.toLowerCase();
		}
		if(user.hash){
			set.hash = bcrypt.hashSync(user.hash, 10);
		}
		if(userParam.device_id){
			set.device_id = userParam.device_id;
		}             
        if(userParam.device_token){
			set.device_token = userParam.device_token;
		}           
        if(userParam.device_type){
			set.device_type = userParam.device_type;
		}
		if(userParam.latitude){
			set.latitude = userParam.latitude;
		} 
        if(userParam.longitude){
 			set.longitude = userParam.longitude;
 		}
		if(userParam.mobile_verified){
 			set.mobile_verified = parseInt(userParam.mobile_verified);
 		}
 		if(userParam.email_verified){
 			set.email_verified = parseInt(userParam.email_verified);
 		}		  
	
	
		if(userParam.heavy_oversized_package){
			set.heavy_oversized_package = userParam.heavy_oversized_package;
		}
		if(userParam.vehicle_config){
			set.vehicle_config = userParam.vehicle_config.toUpperCase();
		}       		
		if(userParam.city){
			set.city = userParam.city.substr(0,1).toUpperCase() + userParam.city.substr(1);
		} 
        if(userParam.region){
			set.region = userParam.region;
		}            
        if(userParam.country){
			set.country = userParam.country;
		}           
		if(userParam.pincode){
			set.pincode = userParam.pincode;
		} 
		if (userParam.home_apartment) {
			set.home_apartment = userParam.home_apartment;
		}		
		if(userParam.profile_status){
			set.profile_status = parseInt(userParam.profile_status);
		}
		if(userParam.online_status){
			set.online_status = parseInt(userParam.online_status);
		}		
		if(userParam.status){
			set.status = parseInt(userParam.status);
		}
		if(userParam.availability){
			set.availability = parseInt(userParam.availability);
		}		
		
		set.updatedon = new Date();
        db.tbl_drivers.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve(doc);
            });
    }

    return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.tbl_drivers.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

//......................................................
function updatePassword(_id, userParam) {
    var deferred = Q.defer();
		
    // validation
    db.tbl_drivers.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		
		if(!userParam.oldPassword || !userParam.password){
			deferred.reject('Please fill the form fields');
		}        
        else if (!(user && bcrypt.compareSync(userParam.oldPassword, user.hash))){
			deferred.reject('Incorrect old password entered!');
		}
		else if(userParam.password != userParam.confPassword){
			deferred.reject('Confirm password mismatched!');
			
        } else {
            changePassword();            
        }
    });

    function changePassword() {
        // update password if it was entered                
        var set = {            
            hash: bcrypt.hashSync(userParam.password, 10),
        };
        
        db.tbl_drivers.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function updateApplication(_id, userParam) {
    var deferred = Q.defer();
	//console.log({"userParam":userParam});	  
	//console.log(_id);		
	var set = {            
		profile_status: userParam.application_status,
	};
	
	db.tbl_drivers.update(
		{ _id: mongo.helper.toObjectID(_id) },
		{ $set: set },
		function (err, doc) {
			if (err) deferred.reject(err.name + ': ' + err.message);

			deferred.resolve();
	});
    return deferred.promise;
}

function getReviewRating(driverId){
	var deferred = Q.defer();

	db.tbl_review.count({"driverId": parseInt(driverId)}, function (err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		
		if (result) {			
			deferred.resolve(result);
		} else {			
			deferred.resolve();
		}
	});

	return deferred.promise;
}


var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_store');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'storeId');

var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google', // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyBHYqLnCfXuCl37mu8DgWvQfo1XhEFOuHI', // for Mapquest, OpenCage, Google Premier 
  formatter: null  // 'gpx', 'string', ... 
}; 
var geocoder = NodeGeocoder(options);


var service = {};

service.getById = getById;
service.create = create;
service.update = update;
service.getAll = getAll;
service.delete = _delete;
service.setStoreDefault = setStoreDefault;

//service.updatePassword = updatePassword;

module.exports = service;

function getAll(_id) {
    var deferred = Q.defer();
	db.tbl_store.find({ retailer_id: _id }).toArray(function(err, user) {
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
	
    db.tbl_store.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user) {            
            deferred.resolve(_.omit(user, 'hash'));
        } else {            
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function create(userParam) {
    var deferred = Q.defer();	
    // validation    
    if(userParam.password !== userParam.confPassword){
		deferred.reject('Confirm Password is mismatched!');
	}
	else{
		db.tbl_store.findOne({ mobile_number: userParam.mobile_number }, function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {				
                // mobile number already exists
                deferred.reject('Mobile Number "' + userParam.mobile_number + '" is already taken');
            }
            else {
				db.tbl_store.findOne({ email: userParam.email }, function (err, user1) {
					if (err) deferred.reject(err.name + ': ' + err.message);

					if (user1) {						
						// email already exists
						deferred.reject('Email "' + userParam.email + '" is already taken');
					} 
					else {
						createStore();
					}
				});
			}            
        });
	}
    	
    function createStore(){
		incrementer().then(function(autoIncStoreId){
			// set user object to userParam without the cleartext password
			var user = _.omit(userParam, 'password');
			// add hashed password to user object
			user.hash = bcrypt.hashSync(userParam.password, 10);
				
			var set = {};
				
			set.storeId = parseInt(autoIncStoreId);
				
			if(userParam.retailerId){
				set.retailerId = parseInt(userParam.retailerId);
			} 
			else{
				set.retailerId = null;
			}
			if(userParam.retailer_id){
				set.retailer_id = userParam.retailer_id;
			} 
			else{
				set.retailer_id = null;
			}
			if(userParam.store_name){
				set.store_name = userParam.store_name;
			} 
			else{
				set.store_name = null;
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
			if(userParam.default_store){
				set.default_store = userParam.default_store;
			} 
			else{
				set.default_store = 'No';
			}
			if(userParam.first_name){
				set.first_name = userParam.first_name;
			} 
			else{
				set.first_name = null;
			}
			if(userParam.last_name){
				set.last_name = userParam.last_name;
			} 
			else{
				set.last_name = null;
			}
			if(userParam.mobile_number){
				set.mobile_number = userParam.mobile_number;
			} 
			else{
				set.mobile_number = null;
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
			
			if(userParam.alternate_first_name){
				set.alternate_first_name = userParam.alternate_first_name;
			} 
			else{
				set.alternate_first_name = null;
			}
			if(userParam.alternate_last_name){
				set.alternate_last_name = userParam.alternate_last_name;
			} 
			else{
				set.alternate_last_name = null;
			}
			if(userParam.alternate_mobile_number){
				set.alternate_mobile_number = userParam.alternate_mobile_number;
			} 
			else{
				set.alternate_mobile_number = null;
			}
			if(userParam.alternate_email){
				set.alternate_email = userParam.alternate_email;
			} 
			else{
				set.alternate_email = null;
			}
			
			
			var Address = userParam.address+' '+userParam.city+' '+userParam.region;
			var lat1=null, long1=null;
			set.locations = { "type" : "Point", "coordinates" : [ lat1,  long1 ] }
			
			set.profile_image = null;				
			set.addedon = new Date();
			set.updatedon = new Date();
			
			geocoder.geocode({address: Address, country: userParam.country, zipcode: userParam.pincode}).then(function(res){
				if(res){
					lat1 = res[0].latitude;
					long1 = res[0].longitude;						
					set.latitude = lat1;
					set.longitude = long1;
					set.locations = { "type" : "Point", "coordinates" : [ long1,lat1 ] }
				}						
					
				db.tbl_store.insert(set, function (err, doc) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					
					deferred.resolve(doc);
				});
			})
			.catch(function(err) {
				console.log(err);
			});				
		});
    }//

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();
	// validation
	
	
	db.tbl_store.findById(_id, function (err, user) {
		if (err){
			deferred.reject(err.name + ': ' + err.message);
		}
		if (user.mobile_number !== userParam.mobile_number) { 
			// email has changed so check if the new email is already taken
			db.tbl_store.findOne({ mobile_number: userParam.mobile_number },
				function (err, user) {
					if (err) deferred.reject(err.name + ': ' + err.message);

					if (user) {
						// username already exists
						deferred.reject('Mobile Number "' + userParam.mobile_number + '" is already taken')
					}else{ 
						updateUser();
					}
				});
		}
		else if (user.email !== userParam.email) { 				
			// email has changed so check if the new email is already taken
			db.tbl_store.findOne({ email: userParam.email },
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
                
        if(userParam.store_name){
			set.store_name = userParam.store_name;
		} 
		else{
			set.store_name = null;
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
		if(userParam.default_store){
			set.default_store = userParam.default_store;
		} 
		else{
			set.default_store = null;
		}
		if(userParam.first_name){
			set.first_name = userParam.first_name;
		} 
		else{
			set.first_name = null;
		}
		if(userParam.last_name){
			set.last_name = userParam.last_name;
		} 
		else{
			set.last_name = null;
		}
		if(userParam.mobile_number){
			set.mobile_number = userParam.mobile_number;
		} 
		else{
			set.mobile_number = null;
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
		
		
		if(userParam.alternate_first_name){
			set.alternate_first_name = userParam.alternate_first_name;
		} 
		else{
			set.alternate_first_name = null;
		}
		if(userParam.alternate_last_name){
			set.alternate_last_name = userParam.alternate_last_name;
		} 
		else{
			set.alternate_last_name = null;
		}
		if(userParam.alternate_mobile_number){
			set.alternate_mobile_number = userParam.alternate_mobile_number;
		} 
		else{
			set.alternate_mobile_number = null;
		}
		if(userParam.alternate_email){
			set.alternate_email = userParam.alternate_email;
		} 
		else{
			set.alternate_email = null;
		}
		
		var Address = userParam.address+' '+userParam.city+' '+userParam.region;
		
        set.updatedon = new Date();
        
        //var lat1 = null, long1 = null;
        geocoder.geocode({address: Address, country: userParam.country, zipcode: userParam.pincode})
			.then(function(res) {				
				if(res){
					var lat1 = res[0].latitude;
					var long1 = res[0].longitude;					
					set.latitude = lat1;
					set.longitude = long1;
					set.locations = { "type" : "Point", "coordinates" : [ long1,lat1 ] }
				}
				
				db.tbl_store.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set }, function (err, doc) {
					if (err) deferred.reject(err.name + ': ' + err.message);

					deferred.resolve(doc);
				});
			})
			.catch(function(err) {
				console.log(err);
			});
    }

    return deferred.promise;
}

function setStoreDefault(_id, retailerId){
	var deferred = Q.defer();
	var set = {};
	set.default_store = "No";
	
	//db.tbl_store.update({ retailerId:1000000005, _id: {$ne: ObjectId("5943edbbb195ee18d45f0527")}}, { $set: {default_store:"No"} },{multi:true})
	
	db.tbl_store.update({retailerId:parseInt(retailerId), _id:{$ne:mongo.helper.toObjectID(_id)}},{$set:set}, {multi:true}, function(err, doc){
		if (err) deferred.reject(err.name + ': ' + err.message);

		deferred.resolve(doc);
	});
	return deferred.promise;
}

function _delete(_id) {
    var deferred = Q.defer();

    db.tbl_store.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}

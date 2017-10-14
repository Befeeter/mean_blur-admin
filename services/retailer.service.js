var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_retailers');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'retailerId');

var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'google', // Optional depending on the providers 
  httpAdapter: 'https', // Default 
  apiKey: 'AIzaSyBHYqLnCfXuCl37mu8DgWvQfo1XhEFOuHI', // for Mapquest, OpenCage, Google Premier 
  formatter: null  // 'gpx', 'string', ... 
}; 
var geocoder = NodeGeocoder(options);


var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.create = create;
service.update = update;
service.getAll = getAll;
service.delete = _delete;

service.updatePassword = updatePassword;

module.exports = service;

function authenticate(username, password) {
    var deferred = Q.defer();

    db.tbl_retailers.findOne({ username: username }, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user && bcrypt.compareSync(password, user.hash)) {
            // authentication successful
            deferred.resolve(jwt.sign({ sub: user._id }, config.secret));
        } else {
            // authentication failed
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function getAll() {
    var deferred = Q.defer();
	db.tbl_retailers.find().toArray(function(err, user) {
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
	
    db.tbl_retailers.findById(_id, function (err, user) {
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
		db.tbl_retailers.findOne({ mobile_number: userParam.mobile_number }, function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {				
                // mobile number already exists
                deferred.reject('Mobile Number "' + userParam.mobile_number + '" is already taken');
            }
            else {
				db.tbl_retailers.findOne({ email: userParam.email }, function (err, user1) {
					if (err) deferred.reject(err.name + ': ' + err.message);

					if (user1) {						
						// email already exists
						deferred.reject('Email "' + userParam.email + '" is already taken');
					} 
					else {
						createUser();
					}
				});
			}
            
        });
	}
    
	
    function createUser() {
		incrementer()
			.then( function(autoIncDeliveryId){
				// set user object to userParam without the cleartext password
			   var user = _.omit(userParam, 'password');
			   // add hashed password to user object
				user.hash = bcrypt.hashSync(userParam.password, 10);
				
				var set = {};
				
				set.retailerId = parseInt(autoIncDeliveryId);
				
				if(userParam.retailer_name){
					set.retailer_name = userParam.retailer_name;
				} 
				else{
					set.retailer_name = null;
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
				if(userParam.retailer_type){
					set.retailer_type = userParam.retailer_type;
				} 
				else{
					set.retailer_type = null;
				}
				if(userParam.status){
					set.status = userParam.status;
				} 
				else{
					set.status = null;
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
				
				geocoder.geocode({address: Address, country: userParam.country, zipcode: userParam.pincode})
					.then(function(res) {						
						if(res){
							lat1 = res[0].latitude;
							long1 = res[0].longitude;			
							console.log(lat1);				  
							console.log(long1);	
							set.latitude = lat1;
							set.longitude = long1;
							set.locations = { "type" : "Point", "coordinates" : [ long1,lat1 ] }
						}						
						
						db.tbl_retailers.insert(set, function (err, doc) {
							if (err) deferred.reject(err.name + ': ' + err.message);
							
							deferred.resolve(doc);
						});
					})
					.catch(function(err) {
						console.log(err);
					});
						
						
			});
    } //

    return deferred.promise;
}

function update(_id, userParam) {
    var deferred = Q.defer();
	// validation
    if(userParam.password !== userParam.confPassword){
		deferred.reject('Confirm Password is mismatched!');
	}
	else{
		db.tbl_retailers.findById(_id, function (err, user) {
			if (err){
				deferred.reject(err.name + ': ' + err.message);
			}
			if (user.username !== userParam.username) { 
				// username has changed so check if the new username is already taken
				db.tbl_retailers.findOne({ username: userParam.username },
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
				db.tbl_retailers.findOne({ email: userParam.email },
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
	}

    function updateUser() {
        // fields to update
        var set = {};
                
        if(userParam.retailer_name){
			set.retailer_name = userParam.retailer_name;
		} 
		else{
			set.retailer_name = null;
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
		if(userParam.retailer_type){
			set.retailer_type = userParam.retailer_type;
		} 
		else{
			set.retailer_type = null;
		}
		if(userParam.status){
			set.status = userParam.status;
		} 
		else{
			set.status = null;
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
				console.log(res);
				if(res){
					var lat1 = res[0].latitude;
					var long1 = res[0].longitude;			
					console.log(lat1);				  
					console.log(long1);	
					set.latitude = lat1;
					set.longitude = long1;
					set.locations = { "type" : "Point", "coordinates" : [ long1,lat1 ] }
				}
				
				db.tbl_retailers.update({ _id: mongo.helper.toObjectID(_id) }, { $set: set }, function (err, doc) {
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

function _delete(_id) {
    var deferred = Q.defer();

    db.tbl_retailers.remove(
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
    db.tbl_retailers.findById(_id, function (err, user) {
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
        
        db.tbl_retailers.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

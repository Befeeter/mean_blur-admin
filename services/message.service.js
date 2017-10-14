var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
var FCM = require('fcm-push');
var apn = require("apn");
db.bind('tbl_message'); 
db.bind('tbl_drivers');
db.bind('tbl_customers');

ObjectId = require('mongodb').ObjectID;
var service = {};
 
service.getAllMessage = getAllMessage;
service.sendMessage = sendMessage;   
service.getChatHistory = getChatHistory; 
service.sendNotification = sendNotification;
service.sendNotificationiOS = sendNotificationiOS;
service.getCustomerDeviceToken = getCustomerDeviceToken;
module.exports = service;

function getAllMessage(driverId, messageParam) {
	 
    var deferred = Q.defer();
    db.tbl_message.aggregate(
  [
   { "$match": { 
     $or:[{"senderId" : parseInt(driverId)},{"receiverId" : parseInt(driverId)}]
    } 
   },
                       
   {
    $lookup: {
     from: "tbl_customers",
     localField: "senderId",
     foreignField: "customerId",
     as: "customer_details"
    }
    },
    { 
    $sort: { 
     addedon: -1 
    } 
   },
   {
    $lookup: {
     from: "tbl_delivery_request_status",
     localField: "deliveryId",
     foreignField: "deliveryId",
     as: "delivery_status"
    }
    }
   ,
   {$unwind:"$delivery_status"}
   , 
   { "$match": { 
     "delivery_status.status" : {$nin:["completed","cancel", "ignore"]}
    } 
   },
    {$group:{
     _id:"$tracking_code",
     total:{$sum:1},
     first:{$last:"$$ROOT"},
     last:{$first:"$$ROOT"},
     status: {$addToSet: "$delivery_status"}
     }
    },
   
    { 
"$project": { 
            
            "first":1,
            "last":{$cond: [{$gt: ["$total", 1]}, '$last', null]},
            //status:1,
                                    
                                         
    }
   }
  ],
		function(err, message) {
			if (err) deferred.reject(err.name + ': ' + err.message);
			
			if (message) {			 
				deferred.resolve(message);
			} else {				 
				deferred.resolve();
			}
		}); 
	return deferred.promise;
}
 
function sendMessage(deliveryId, messageParam) { 
	var deferred = Q.defer();
 
	var set = {}; 
	
	
	if(deliveryId){
		set.deliveryId = parseInt(deliveryId); 
	}
	else{
		set.deliveryId = null;
	}	
	if(messageParam.senderId){
		set.senderId = parseInt(messageParam.senderId); 
	}
	else{
		set.senderId = null;
	}	
	if(messageParam.receiverId){
		set.receiverId = parseInt(messageParam.receiverId); 
	}
	else{
		set.receiverId = null;
	}	 
	if(messageParam.tracking_code){
		set.tracking_code = messageParam.tracking_code; 
	}
	else{
		set.tracking_code = null;
	} 
	if(messageParam.message){
		set.message = messageParam.message; 
	}
	else{
		set.message = null;
	} 
	if(messageParam.publish){
		set.publish = messageParam.publish;
	} 
	else{
		set.publish = 1;
	}
	if(messageParam.status){
		set.status = messageParam.status;
	}
	else{
		set.status = 1;
	}	
	
	set.addedon = new Date();
	set.updatedon = new Date();
	 
	db.tbl_message.insert(set, function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);
		if(doc){	
			db.tbl_message.aggregate(
			[
				{ "$match": { _id:mongo.helper.toObjectID(doc.ops[0]._id)
					} 
				},
				
				{
					$lookup: {
						from: "tbl_customers",
						localField: "senderId",
						foreignField: "customerId",
						as: "customer_details"
					}
					},
					{
					$lookup: {
						from: "tbl_drivers",
						localField: "senderId",
						foreignField: "driverId",
						as: "driver_details"
					}
					},
					{ 
					"$project": { 
										"_id":1,
										"senderId":1,
										"receiverId":1,
										"deliveryId":1,
										"tracking_code":1,
										"message":1,
										"addedon":1,
										"customer_details.first_name":1,
										"customer_details.last_name":1,
										"customer_details.profile_image":1,
										"driver_details.first_name":1,
										"driver_details.last_name":1,
										"driver_details.profile_image":1,
														 
					}
				}
			],
			function(err, message) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				
				if (message) {			 
					deferred.resolve(message);
				} else {				 
					deferred.resolve();
				}
			}); 
		}
		else{
			deferred.resolve("Your message not created");
		}
           
       });		 

    return deferred.promise;
}
  
function getChatHistory(deliveryId, messageParam) {
	 
    var deferred = Q.defer();
    db.tbl_message.aggregate(
		[
			{ "$match": { deliveryId:parseInt(deliveryId)
				//,$or:[{"senderId" : parseInt(messageParam.driverId)},{"receiverId" : parseInt(messageParam.driverId)}]
				} 
			},			
			{
				$lookup: {
					from: "tbl_customers",
					localField: "senderId",
					foreignField: "customerId",
					as: "customer_details"
				}
			},
			{
				$lookup: {
					from: "tbl_drivers",
					localField: "senderId",
					foreignField: "driverId",
					as: "driver_details"
				}
			},
			{ 
				$sort: { 
					addedon: 1 
				} 
			},
			{
				$lookup: {
					from: "tbl_delivery_request_status",
					localField: "deliveryId",
					foreignField: "deliveryId",
					as: "delivery_details"
				}
			}, 
			//{$unwind:"$delivery_details"}, 
			{$group:{
				_id:"$tracking_code",
				data:{$push:"$$ROOT"}
				}
			},
			//{$match:{"data.delivery_details.status":{$nin:["completed"]}}},
			{ 
				"$project": { 
					"data._id":1,
					"data.senderId":1,
					"data.receiverId":1,
					"data.deliveryId":1,
					"data.tracking_code":1,
					"data.message":1,
					"data.type":1,                                    
					"data.addedon":1,
					"data.customer_details.first_name":1,
					"data.customer_details.last_name":1,
					"data.customer_details.profile_image":1,
					"data.driver_details.first_name":1,
					"data.driver_details.last_name":1,
					"data.driver_details.profile_image":1,
				}
			}
		],
		function(err, message) {
			if (err) deferred.reject(err.name + ': ' + err.message);
			
			if (message) {			 
				deferred.resolve(message);
			} else {				 
				deferred.resolve();
			}
		}); 
	return deferred.promise;
}

function getCustomerDeviceToken(customerId) {
    var deferred = Q.defer();
    db.tbl_customers.find({"customerId": parseInt(customerId), "online_status": 1}, {
        _id: 0,
        latitude: 1,
        longitude: 1,
        device_token: 1,
        device_type: 1
    }).toArray(function (err, customer) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (customer) {
            deferred.resolve(customer);
        } else {
            deferred.resolve();
        }
    });
    return deferred.promise;
}

function sendNotification(device_token, data_message, notification, CB) {
    var deferred = Q.defer();
    var androidServerKey = config.androidServerKey;
    var fcm = new FCM(androidServerKey);
    var message = {
        to: device_token,
        data: data_message
    };
    if (notification) {
        message.notification = notification;
    }
    fcm.send(message, CB)
        .then(function (response) {
            if (response) {
                deferred.resolve(response);
            } else {
                deferred.resolve();
            }
        })
        .catch(function (err) {
            deferred.reject(err.name + ': ' + err.message);
        });
    return deferred.promise;
}

function sendNotificationiOS(device_token, data_message, notification, CB) {
    var tokens = [device_token];
    if(process.env.NODE_ENV == "production" ){
        var bundle_identifier = config.ios.production.bundle_identifier;
        var service = new apn.Provider(config.ios.production.options);
    }else{
        var bundle_identifier = config.ios.sandbox.bundle_identifier;
        var service = new apn.Provider(config.ios.sandbox.options);
    }

    var note = new apn.Notification(data_message);

    note.topic = bundle_identifier;
    service.send(note, tokens).then(result =>{return true;});
    return false;
    service.shutdown();
}

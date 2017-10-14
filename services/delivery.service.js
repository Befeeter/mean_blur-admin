var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_order_delivery');
db.bind('tbl_delivery_status');
db.bind('tbl_delivery_return');
db.bind('tbl_delivery_request_status');
db.bind('tbl_drivers');
db.bind('tbl_review');

var increment = require('mongo-sequential');
var incrementer = increment.bind(null, db.collection('tbl_counters'), 'driverId');
var randomstring = require("randomstring");

var util = require('util'), http = require('http'), geolib = require('geolib');

var service = {};

service.getAll = getAll;
service.getAllReturn = getAllReturn;
service.getById = getById;
service.getAllDeliveryStatus = getAllDeliveryStatus;
service.getAllDeliveryStatusReturn = getAllDeliveryStatusReturn;
service.getAllDeliveryStatusCount = getAllDeliveryStatusCount;
service.getDeliveryAverageTime = getDeliveryAverageTime;
service.getAllAccepted = getAllAccepted;
service.getReviewRating = getReviewRating;

service.getDeliveryById = getDeliveryById;
service.getDeliveryByCustomer = getDeliveryByCustomer;

module.exports = service;



function getAll(driverCompanyId,status,driverId) {
	
	if(status==1){ 
		var status = ["new" , "accepted","readyToPick", "pickedUp", "onTheWay", "attemped"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==2){  
		var status = ["ignore","cancel"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==3){  
		var status = ["completed"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==4){ 
		var status = ["new","accepted","onTheWay", "completed"];
		var return_status = 1;
		var type = "return";
	}
	
    var deferred = Q.defer();
	
	if( (driverId == null || driverId == '') && (driverCompanyId == null || driverCompanyId == '') ){ 
			
			db.tbl_delivery_request_status.aggregate([	
					{ $lookup:{
						  from: "tbl_order_delivery",
						  localField: "deliveryId",
						  foreignField: "deliveryId",
						  as: "deliveryDetails"
						}
				   },
				   {$match: {
						"status": {$in:status},
						"deliveryDetails.return_status": return_status,
						"type": type,
					}
				   },
				   { $unwind: "$deliveryDetails" },
				   { $lookup:{
						  from: "tbl_drivers",
						  localField: "driverId",
						  foreignField: "driverId",
						  as: "driverDetails"
						}
				   },
				   { $unwind: "$driverDetails" },
				   { $project : { 
							"deliveryDetails._id" : 1,
							"deliveryDetails.tracking_code" : 1,
							"driverId" : 1,
							"deliveryId":1,
							"deliveryDetails.driverCompanyId" : 1,
							"deliveryDetails.retailerId" : 1,
							"deliveryDetails.storeId" : 1,
							"deliveryDetails.quote" : 1,
							"deliveryDetails.delivery_type" : 1,
							"deliveryDetails.pickup_address" : 1,
							"deliveryDetails.delivery_address" : 1,
							"deliveryDetails.pickup_miles" : 1,
							"deliveryDetails.delivery_miles" : 1,
							"deliveryDetails.estimated_delivery_time" : 1,
							"deliveryDetails.pkg_dimention" : 1,
							"deliveryDetails.pkg_weight" : 1,
							"deliveryDetails.receiver_last_name" : 1,
							"deliveryDetails.estimated_proceeds" : 1,
							"deliveryDetails.additional_instruction" : 1,
							"deliveryDetails.pickup_status" : 1,
							"deliveryDetails.delivery_status" : 1,
							"deliveryDetails.online_status" : 1,
							"deliveryDetails.availability" : 1,		
							"deliveryDetails.first_name":1,	
							"deliveryDetails.last_name":1,
							"deliveryDetails.addedon":1,
							"deliveryDetails.signature_image":1	,
							"deliveryDetails.return_details":1,
							  "actualStatus": {"$cond": { 
									"if": { $eq : ["$status", 'accepted'] }, 
									"then": "Delivery Confirmed",
									"else": {
										"$cond": {
											"if": { $eq : ["$status", 'readyToPick'] }, 
											"then": "Package is Ready for Pick Up", 
											"else": {
												"$cond": {
													"if": { $eq : ["$status", 'pickedUp']}, 
													"then": "Package Picked Up", 
													"else": {
														"$cond": {
															"if": { $eq : ["$status", 'onTheWay']}, 
															"then": "Package is OnItsWay", 
																"else": {
																	"$cond": {
																		"if": { $eq : ["$status", 'attemped']}, 
																		"then": "Delivery was Attempted", 
																			"else": {
																				"$cond": {
																					"if": { $eq : ["$status", 'completed']}, 
																					"then": "Package Delivered", 
																					"else": "New"
																					}
																			}
																		}
																	}
																}
															}
														}
													}
													   
												}
											}
								} }	
						} 
					},
				 { $sort : { deliveryId : -1} },	
				],function(err, result) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				if (result) {
					deferred.resolve(_.omit(result, 'hash'));// return delivery (without hashed password)
					//console.log(result);
				} else {
					deferred.resolve();
				}
			});
		
	}else{
		//console.log(driverId);
		db.tbl_delivery_request_status.aggregate([	
					{ $lookup:{
						  from: "tbl_order_delivery",
						  localField: "deliveryId",
						  foreignField: "deliveryId",
						  as: "deliveryDetails"
						}
				   },
				   {$match: {
						"driverId": parseInt(driverId) ,
						"status": {$in:status},
						"deliveryDetails.return_status": return_status,
						"type": type,
					}
				   },
				   { $unwind: "$deliveryDetails" },
				   { $lookup:{
						  from: "tbl_drivers",
						  localField: "driverId",
						  foreignField: "driverId",
						  as: "driverDetails"
						}
				   },
				   { $unwind: "$driverDetails" },
				   { $project : { 
							"deliveryDetails._id" : 1,
							"deliveryDetails.tracking_code" : 1,
							"driverId" : 1,
							"deliveryId":1,
							"deliveryDetails.driverCompanyId" : 1,
							"deliveryDetails.retailerId" : 1,
							"deliveryDetails.storeId" : 1,
							"deliveryDetails.quote" : 1,
							"deliveryDetails.delivery_type" : 1,
							"deliveryDetails.pickup_address" : 1,
							"deliveryDetails.delivery_address" : 1,
							"deliveryDetails.pickup_miles" : 1,
							"deliveryDetails.delivery_miles" : 1,
							"deliveryDetails.estimated_delivery_time" : 1,
							"deliveryDetails.pkg_dimention" : 1,
							"deliveryDetails.pkg_weight" : 1,
							"deliveryDetails.receiver_last_name" : 1,
							"deliveryDetails.estimated_proceeds" : 1,
							"deliveryDetails.additional_instruction" : 1,
							"deliveryDetails.pickup_status" : 1,
							"deliveryDetails.delivery_status" : 1,
							"deliveryDetails.online_status" : 1,
							"deliveryDetails.availability" : 1,		
							"deliveryDetails.first_name":1,	
							"deliveryDetails.last_name":1,
							"deliveryDetails.addedon":1,
							"deliveryDetails.signature_image":1	,
							"deliveryDetails.return_details":1,
							  "actualStatus": {"$cond": { 
									"if": { $eq : ["$status", 'accepted'] }, 
									"then": "Delivery Confirmed",
									"else": {
										"$cond": {
											"if": { $eq : ["$status", 'readyToPick'] }, 
											"then": "Package is Ready for Pick Up", 
											"else": {
												"$cond": {
													"if": { $eq : ["$status", 'pickedUp']}, 
													"then": "Package Picked Up", 
													"else": {
														"$cond": {
															"if": { $eq : ["$status", 'onTheWay']}, 
															"then": "Package is OnItsWay", 
																"else": {
																	"$cond": {
																		"if": { $eq : ["$status", 'attemped']}, 
																		"then": "Delivery was Attempted", 
																			"else": {
																				"$cond": {
																					"if": { $eq : ["$status", 'completed']}, 
																					"then": "Package Delivered", 
																					"else": "New"
																					}
																			}
																		}
																	}
																}
															}
														}
													}
													   
												}
											}
								} }	
						} 
					},
				 { $sort : { deliveryId : -1} },	
				],function(err, result) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				if (result) {
					deferred.resolve(_.omit(result, 'hash'));// return delivery (without hashed password)
					//console.log(result);
				} else {
					deferred.resolve();
				}
			});
	}
    return deferred.promise;
}


function getAllReturn(driverCompanyId,status,driverId) {
	
	if(status==1){ 
		var status = ["new" , "accepted","readyToPick", "pickedUp", "onTheWay", "attemped"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==2){  
		var status = ["ignore","cancel"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==3){  
		var status = ["completed"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==4){ 
		var status = ["new","accepted","onTheWay", "completed"];
		var return_status = 1;
		var type = "return";
	}
	
    var deferred = Q.defer();
	
	if( (driverId == null || driverId == '') && (driverCompanyId == null || driverCompanyId == '') ){ 
			
			db.tbl_delivery_request_status.aggregate([	
					{ $lookup:{
						  from: "tbl_order_delivery",
						  localField: "deliveryId",
						  foreignField: "deliveryId",
						  as: "deliveryDetails"
						}
				   },
				   {$match: {
						"status": {$in:status},
						"deliveryDetails.return_status": return_status,
						"type": type,
					}
				   },
				   { $unwind: "$deliveryDetails" },
				   { $lookup:{
						  from: "tbl_drivers",
						  localField: "driverId",
						  foreignField: "driverId",
						  as: "driverDetails"
						}
				   },
				   { $unwind: "$driverDetails" },
				   { $project : { 
							"deliveryDetails._id" : 1,
							"deliveryDetails.tracking_code" : 1,
							"driverId" : 1,
							"deliveryId":1,
							"deliveryDetails.driverCompanyId" : 1,
							"deliveryDetails.retailerId" : 1,
							"deliveryDetails.storeId" : 1,
							"deliveryDetails.quote" : 1,
							"deliveryDetails.delivery_type" : 1,
							"deliveryDetails.pickup_address" : 1,
							"deliveryDetails.delivery_address" : 1,
							"deliveryDetails.pickup_miles" : 1,
							"deliveryDetails.delivery_miles" : 1,
							"deliveryDetails.estimated_delivery_time" : 1,
							"deliveryDetails.pkg_dimention" : 1,
							"deliveryDetails.pkg_weight" : 1,
							"deliveryDetails.receiver_last_name" : 1,
							"deliveryDetails.estimated_proceeds" : 1,
							"deliveryDetails.additional_instruction" : 1,
							"deliveryDetails.pickup_status" : 1,
							"deliveryDetails.delivery_status" : 1,
							"deliveryDetails.online_status" : 1,
							"deliveryDetails.availability" : 1,		
							"deliveryDetails.first_name":1,	
							"deliveryDetails.last_name":1,
							"deliveryDetails.addedon":1,
							"deliveryDetails.signature_image":1	,
							"deliveryDetails.return_details":1,
							  "actualStatus": {"$cond": { 
									"if": { $eq : ["$status", 'accepted'] }, 
									"then": "Return Initiated",
									"else": {
										"$cond": {
											"if": { $eq : ["$status", 'readyToPick'] }, 
											"then": "Package is Ready for Pick Up", 
											"else": {
												"$cond": {
													"if": { $eq : ["$status", 'pickedUp']}, 
													"then": "Package Picked Up", 
													"else": {
														"$cond": {
															"if": { $eq : ["$status", 'onTheWay']}, 
															"then": "Return is OnItsWay", 
																"else": {
																	"$cond": {
																		"if": { $eq : ["$status", 'attemped']}, 
																		"then": "Delivery was Attempted", 
																			"else": {
																				"$cond": {
																					"if": { $eq : ["$status", 'completed']}, 
																					"then": "Return is Completed", 
																					"else": "New"
																					}
																			}
																		}
																	}
																}
															}
														}
													}
													   
												}
											}
								} }	
						} 
					},
				 { $sort : { deliveryId : -1} },	
				],function(err, result) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				if (result) {
					deferred.resolve(_.omit(result, 'hash'));// return delivery (without hashed password)
					//console.log(result);
				} else {
					deferred.resolve();
				}
			});
		
	}else{
		//console.log(driverId);
		db.tbl_delivery_request_status.aggregate([	
					{ $lookup:{
						  from: "tbl_order_delivery",
						  localField: "deliveryId",
						  foreignField: "deliveryId",
						  as: "deliveryDetails"
						}
				   },
				   {$match: {
						"driverId": parseInt(driverId) ,
						"status": {$in:status},
						"deliveryDetails.return_status": return_status,
						"type": type,
					}
				   },
				   { $unwind: "$deliveryDetails" },
				   { $lookup:{
						  from: "tbl_drivers",
						  localField: "driverId",
						  foreignField: "driverId",
						  as: "driverDetails"
						}
				   },
				   { $unwind: "$driverDetails" },
				   { $project : { 
							"deliveryDetails._id" : 1,
							"deliveryDetails.tracking_code" : 1,
							"driverId" : 1,
							"deliveryId":1,
							"deliveryDetails.driverCompanyId" : 1,
							"deliveryDetails.retailerId" : 1,
							"deliveryDetails.storeId" : 1,
							"deliveryDetails.quote" : 1,
							"deliveryDetails.delivery_type" : 1,
							"deliveryDetails.pickup_address" : 1,
							"deliveryDetails.delivery_address" : 1,
							"deliveryDetails.pickup_miles" : 1,
							"deliveryDetails.delivery_miles" : 1,
							"deliveryDetails.estimated_delivery_time" : 1,
							"deliveryDetails.pkg_dimention" : 1,
							"deliveryDetails.pkg_weight" : 1,
							"deliveryDetails.receiver_last_name" : 1,
							"deliveryDetails.estimated_proceeds" : 1,
							"deliveryDetails.additional_instruction" : 1,
							"deliveryDetails.pickup_status" : 1,
							"deliveryDetails.delivery_status" : 1,
							"deliveryDetails.online_status" : 1,
							"deliveryDetails.availability" : 1,		
							"deliveryDetails.first_name":1,	
							"deliveryDetails.last_name":1,
							"deliveryDetails.addedon":1,
							"deliveryDetails.signature_image":1	,
							"deliveryDetails.return_details":1,
							   "actualStatus": {"$cond": { 
									"if": { $eq : ["$status", 'accepted'] }, 
									"then": "Return Initiated",
									"else": {
										"$cond": {
											"if": { $eq : ["$status", 'readyToPick'] }, 
											"then": "Package is Ready for Pick Up", 
											"else": {
												"$cond": {
													"if": { $eq : ["$status", 'pickedUp']}, 
													"then": "Package Picked Up", 
													"else": {
														"$cond": {
															"if": { $eq : ["$status", 'onTheWay']}, 
															"then": "Return is OnItsWay", 
																"else": {
																	"$cond": {
																		"if": { $eq : ["$status", 'attemped']}, 
																		"then": "Delivery was Attempted", 
																			"else": {
																				"$cond": {
																					"if": { $eq : ["$status", 'completed']}, 
																					"then": "Return is Completed", 
																					"else": "New"
																					}
																			}
																		}
																	}
																}
															}
														}
													}
													   
												}
											}
								} }	
						} 
					},
				 { $sort : { deliveryId : -1} },	
				],function(err, result) {
				if (err) deferred.reject(err.name + ': ' + err.message);
				if (result) {
					deferred.resolve(_.omit(result, 'hash'));// return delivery (without hashed password)
					//console.log(result);
				} else {
					deferred.resolve();
				}
			});
	}
    return deferred.promise;
}


function getById(deliveryId,objectId) {
	//console.log(deliveryId);
	var deferred = Q.defer();
    db.tbl_delivery_request_status.aggregate([	
			
			{ $lookup:{
				  from: "tbl_order_delivery",
				  localField: "deliveryId",
				  foreignField: "deliveryId",
				  as: "deliveryDetails"
				}
		   },
		   { $unwind: "$deliveryDetails" },
		   
		   { $lookup:{
				  from: "tbl_drivers",
				  localField: "driverId",
				  foreignField: "driverId",
				  as: "driverDetails"
				}
		   },
		   { $unwind: "$driverDetails" },
		   
		   { $match: { deliveryId: parseInt(deliveryId), _id: mongo.helper.toObjectID(objectId) } },
		   
		   { $project : { 
					"deliveryDetails._id" : 1,
					"deliveryDetails.tracking_code" : 1,
					"driverId" : 1,
					"deliveryId":1,
					"deliveryDetails.driverCompanyId" : 1,
					"deliveryDetails.retailerId" : 1,
					"deliveryDetails.storeId" : 1,
					"deliveryDetails.quote" : 1,
					"deliveryDetails.delivery_type" : 1,
					"deliveryDetails.pickup_address" : 1,
					"deliveryDetails.delivery_address" : 1,
					"deliveryDetails.pickup_miles" : 1,
					"deliveryDetails.delivery_miles" : 1,
					"deliveryDetails.estimated_delivery_time" : 1,
					"deliveryDetails.pkg_dimention" : 1,
					"deliveryDetails.pkg_weight" : 1,
					"deliveryDetails.receiver_last_name" : 1,
					"deliveryDetails.estimated_proceeds" : 1,
					"deliveryDetails.additional_instruction" : 1,
					"deliveryDetails.pickup_status" : 1,
					"deliveryDetails.delivery_status" : 1,
					"deliveryDetails.online_status" : 1,
					"deliveryDetails.availability" : 1,		
					"deliveryDetails.delivery_latlong" :1,
					"deliveryDetails.signature_image":1,
					"deliveryDetails.return_details":1,
					
					"driverDetails.first_name":1,	
					"driverDetails.last_name":1,
					"deliveryDetails.addedon":1		
				} 
			},
		 { $limit : 1 },	
		],function(err, result) {
		 if (err) deferred.reject(err.name + ': ' + err.message);

			if (result) {
				//console.log({"result details":result});
				deferred.resolve(_.omit(result, 'hash'));
			} else {
				// result not found
				deferred.resolve();
			}
	});

    return deferred.promise;
}

function getAllDeliveryStatus(deliveryId) {
   var deferred = Q.defer();
	 /**/db.tbl_delivery_status.find({ deliveryId: parseInt(deliveryId) }).sort( { delivery_status: 1 }).toArray(function(err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		//console.log({"result":result});
		if (result) { // data found
			deferred.resolve(_.omit(result, 'hash')); 
        } else { // data not found
            deferred.resolve();
        }
	});
	return deferred.promise;
}

function getAllDeliveryStatusReturn(deliveryId) {
   var deferred = Q.defer();
	 /**/db.tbl_delivery_return.find({ deliveryId: parseInt(deliveryId) }).sort( { delivery_status: 1 }).toArray(function(err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);
		//console.log({"result":result});
		if (result) { // data found
			deferred.resolve(_.omit(result, 'hash')); 
        } else { // data not found
            deferred.resolve();
        }
	});
	return deferred.promise;
}

function getAllDeliveryStatusCount(status,filterData) {
	
    var deferred = Q.defer();
	var cond;
	
	if(status==1){ 
		var status = ["new" , "accepted","readyToPick", "pickedUp", "onTheWay", "attemped"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==2){  
		var status = ["ignore","cancel"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==3){  
		var status = ["completed"];
		var return_status = 0;
		var type = "deliver";
	}else if(status==4){ 
		var status = ["new","accepted","onTheWay", "completed"];
		var return_status = 1;
		var type = "return";
	}
	
		if( filterData.range_date == undefined && filterData.driverCompany == undefined){ 
				db.tbl_delivery_request_status.find({
						 "status": { $in: status },
				 }).count({}, function(err, user) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					if (user) {
						deferred.resolve(user);
					} else {
						deferred.resolve();
					}
				});
			
		}else{	
		
			var date = new Date();
			if(filterData.range_date=='range'){
				var from_date = new Date(filterData.from_date+" 00:00:00.000"); 
				var to_date = new Date(filterData.to_date+" 23:59:59.999"); 
			}else if(filterData.range_date=='today'){
				var from_date = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
				var to_date = new Date(from_date.getTime()+86399000);  
			}else if(filterData.range_date=='week'){
				var from_date = new Date(date.setDate(date.getDate() - date.getDay()));
				var to_date = new Date(date.setDate(date.getDate() - date.getDay()+6));
			}else if(filterData.range_date=='month'){
				var from_date = new Date(date.getFullYear(), date.getMonth(), 1);
				var to_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
			}	
			
			if(filterData.range_date=='range'){
				var cond =  {"$and":[{"addedon":{"$gte":from_date}},{"addedon":{"$lte":to_date}}]}; 	  
			}
			//console.log(from_date,to_date);
			if(filterData.driverId && (filterData.driverCompany=="" || filterData.driverCompany=='individual') ){
				//console.log("hi1");
				db.tbl_delivery_request_status.find({
					 "driverId": parseInt(filterData.driverId),	
					 "status": { $in: status },
					  cond			
				 }).count({}, function(err, user) {
					if (err) deferred.reject(err.name + ': ' + err.message);
					//console.log(user);
					if (user) {
						deferred.resolve(user);
					} else {
						deferred.resolve();
					}
				});

			}else if(filterData.driverCompany && filterData.driverCompany!='individual'){
				//console.log("hi2");
				db.tbl_drivers.find({ driverCompanyId:parseInt(filterData.driverCompany) }, {"_id":0,"driverId":1}).toArray(function (err, driver) {
				var driverArr = driver.map(function(result) {return result.driverId;});	//console.log(driverArr);
						db.tbl_delivery_request_status.find({
							 "driverId": { $in: driverArr },	
							 "status": { $in: status },
							  cond			
						 }).count({}, function(err, user) {
							if (err) deferred.reject(err.name + ': ' + err.message);
							//console.log(user);
							if (user) {
								deferred.resolve(user);
							} else {
								deferred.resolve();
							}
						});
				});
			}
			
		}	
	return deferred.promise;
}

function getDeliveryAverageTime(filterData){
	
	var deferred = Q.defer();
	var cond;
			if( filterData.range_date == undefined  && filterData.driverCompany == undefined){	

					db.tbl_delivery_request_status.find({ 
						$and: [ {status:"completed"} ] }, {"_id":0,"deliveryId":1
						}).toArray(function (err, delivery) {
						var deliveryArr = delivery.map(function(result) {return result.deliveryId;});
						//console.log(deliveryArr);
							db.tbl_delivery_status.find({ 
									"deliveryId": { $in: deliveryArr },
									"delivery_status": { $in: [1,6] }
								}).toArray(function(err, result) {
									if (err) deferred.reject(err.name + ': ' + err.message);
									if (result) {
										deferred.resolve(result);
									} else {
										deferred.resolve();
									}
								});	
					});	
					
			}else{		
			
				var date = new Date();
				if(filterData.range_date=='range'){
					var from_date = new Date(filterData.from_date+" 00:00:00.000"); 
					var to_date = new Date(filterData.to_date+" 23:59:59.999"); 
				}else if(filterData.range_date=='today'){
					var from_date = new Date(date.getFullYear(), date.getMonth(), date.getDate()); 
					var to_date = new Date(from_date.getTime()+86399000);  
				}else if(filterData.range_date=='week'){
					var from_date = new Date(date.setDate(date.getDate() - date.getDay()));
					var to_date = new Date(date.setDate(date.getDate() - date.getDay()+6));
				}else if(filterData.range_date=='month'){
					var from_date = new Date(date.getFullYear(), date.getMonth(), 1);
					var to_date = new Date(date.getFullYear(), date.getMonth() + 1, 0);
				}
				
				if(filterData.range_date!=null){
					//var cond =  {"$and":[{"addedon":{"$gte":from_date}},{"addedon":{"$lte":to_date}}]}; 	
					var cond =  {"createdDate":{"$gte":from_date,"$lt": to_date}};
				}	
					if(filterData.driverId && (filterData.driverCompany=="" || filterData.driverCompany=='individual')){
						//console.log("individual driver");
						db.tbl_delivery_request_status.find({ 
								"driverId": parseInt(filterData.driverId),
								$and: [ {status:"completed"} ] }, {"_id":0,"deliveryId":1
								}).toArray(function (err, delivery) {
								var deliveryArr = delivery.map(function(result) {return result.deliveryId;});
								//console.log(deliveryArr);
								db.tbl_delivery_status.aggregate(
								[ 		
									{
										$match: {
											"deliveryId": {$in:deliveryArr},
											"delivery_status" : {$in:[1,6]},
											cond
										}
									}			
								],function(err, result) {
										if (err) deferred.reject(err.name + ': ' + err.message);
										if (result) {
											deferred.resolve(result);
										} else {
											deferred.resolve();
										}
								});
										
						});	
						
					}else if(filterData.driverCompany && filterData.driverCompany!='individual'){
						//console.log(filterData.driverCompany);
						db.tbl_drivers.find({ driverCompanyId: parseInt(filterData.driverCompany) }, {"_id":0,"driverId":1})
						.toArray(function (err, driver) {
							var driverArr = driver.map(function(result) {return result.driverId;});
						
							db.tbl_delivery_request_status.find({ 
								"driverId": { $in: driverArr },
								$and: [ {status:"completed"} ] }, {"_id":0,"deliveryId":1
								}).toArray(function (err, delivery) {
								var deliveryArr = delivery.map(function(result) {return result.deliveryId;});
								
									db.tbl_delivery_status.aggregate(
									[ 		
										{
											$match: {
												"deliveryId": {$in:deliveryArr},
												"delivery_status" : {$in:[1,6]},
												cond
											}
										}			
									],function(err, result) {
											if (err) deferred.reject(err.name + ': ' + err.message);
											if (result) {
												deferred.resolve(result);
											} else {
												deferred.resolve();
											}
									});
										
							});	
						
						});	
					}
					
			}
	
    return deferred.promise;			
}

function getAllAccepted(driverCompanyId,status,driverId) {
	
    var deferred = Q.defer();
	var status = ["new","accepted","readyToPick", "pickedUp", "onTheWay", "attemped"];
			
					db.tbl_delivery_request_status.aggregate([	
							{ $lookup:{
								  from: "tbl_order_delivery",
								  localField: "deliveryId",
								  foreignField: "deliveryId",
								  as: "deliveryDetails"
								}
						   },
						   {$match: {
								"driverId": driverId,
								"status": {$in:status},
							}
						   },
						   
						   { $unwind: "$deliveryDetails" },
						   { $lookup:{
								  from: "tbl_drivers",
								  localField: "driverId",
								  foreignField: "driverId",
								  as: "driverDetails"
								}
						   },
						   { $unwind: "$driverDetails" },
						   { $project : { 
									"deliveryDetails._id" : 1,
									"deliveryDetails.tracking_code" : 1,
									"driverId" : 1,
									"deliveryId":1,
									"deliveryDetails.driverCompanyId" : 1,
									"deliveryDetails.retailerId" : 1,
									"deliveryDetails.storeId" : 1,
									"deliveryDetails.quote" : 1,
									"deliveryDetails.delivery_type" : 1,
									"deliveryDetails.pickup_address" : 1,
									"deliveryDetails.delivery_address" : 1,
									"deliveryDetails.pickup_miles" : 1,
									"deliveryDetails.delivery_miles" : 1,
									"deliveryDetails.estimated_delivery_time" : 1,
									"deliveryDetails.pkg_dimention" : 1,
									"deliveryDetails.pkg_weight" : 1,
									"deliveryDetails.receiver_last_name" : 1,
									"deliveryDetails.estimated_proceeds" : 1,
									"deliveryDetails.additional_instruction" : 1,
									"deliveryDetails.pickup_status" : 1,
									"deliveryDetails.delivery_status" : 1,
									"deliveryDetails.online_status" : 1,
									"deliveryDetails.availability" : 1,		
									"deliveryDetails.first_name":1,	
									"deliveryDetails.last_name":1,
									"deliveryDetails.signature_image":1	
								} 
							},
						 { $sort : { deliveryId : -1} },	
						],function(err, result) {
						if (err) deferred.reject(err.name + ': ' + err.message);
						if (result) {
							deferred.resolve(_.omit(result, 'hash'));// return delivery (without hashed password)
							//console.log(result);
						} else {
							deferred.resolve();
						}
					});
			return deferred.promise;
}

function getReviewRating(deliveryId){
	var deferred = Q.defer();
    
	db.tbl_review.findOne({"deliveryId": parseInt(deliveryId)},function (err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);

		if (result) {			
			deferred.resolve(result);
		} else {			
			deferred.resolve();
		}
	});

	return deferred.promise;
}			

function getDeliveryById(deliveryId) {
    var deferred = Q.defer();
    

	db.tbl_order_delivery.findOne({deliveryId: parseInt(deliveryId)}, function (err, result) {
		if (err) deferred.reject(err.name + ': ' + err.message);

		if (result) {			
			deferred.resolve(result);
		} else {
			// user not found
			deferred.resolve();
		}
	});
	return deferred.promise;
}

function getDeliveryByCustomer(customerId) {
	var deferred = Q.defer();
	
	var status = ["new","accepted","readyToPick", "pickedUp", "onTheWay", "attemped", "completed"];
	
	var cond = [{"deliveryStaus.status":{"$in":status}},{ "deliveryStaus":{"$eq":null}}];
	
	var matchCond = {"customerId": parseInt(customerId) };
	
	db.tbl_order_delivery.aggregate([
		{$match: matchCond},
		{ $lookup:{
			  from: "tbl_delivery_request_status",
			  localField: "deliveryId",
			  foreignField: "deliveryId",
			  as: "deliveryStaus"
			}
		},
		{$unwind:{ path: "$deliveryStaus", preserveNullAndEmptyArrays: true }},
		{$match: { 
			"$or": cond
		}},	
		{ $project : { 			
			"deliveryId":1,			
			"tracking_code":1,			
			"customerId":1,			
			"retailerId":1,			
			"pickup_address":1,			
			"delivery_address":1,			
			"delivery_type":1,			
			"receiver_last_name":1,			
			"addedon":1,
			"deliveryStaus.status":1,
			"deliveryStaus.addedon":1,
			"actualStatus": {"$cond": { 
				"if": { $eq : ["$deliveryStaus.status", 'accepted'] }, 
				"then": "Delivery Confirmed",
				"else": {
					"$cond": {
						"if": { $eq : ["$deliveryStaus.status", 'readyToPick'] }, 
						"then": "Package is Ready for Pick Up", 
						"else": {
							"$cond": {
								"if": { $eq : ["$deliveryStaus.status", 'pickedUp']}, 
								"then": "Package Picked Up", 
								"else": {
									"$cond": {
										"if": { $eq : ["$deliveryStaus.status", 'onTheWay']}, 
										"then": "Package is OnItsWay", 
											"else": {
												"$cond": {
													"if": { $eq : ["$deliveryStaus.status", 'attemped']}, 
													"then": "Delivery was Attempted", 
														"else": {
															"$cond": {
																"if": { $eq : ["$deliveryStaus.status", 'completed']}, 
																"then": "Package Delivered", 
																"else": "New"
																}
														}
													}
												}
											}
										}
									}
								}
								   
							}
						}
			} 	}
		}},
		{ $sort : { deliveryId : -1} },
		{$group:{_id:"$deliveryId", 
            data:{$addToSet:"$$ROOT"}
            }
		}
	], function(err, result){
		if (err) deferred.reject(err.name + ': ' + err.message);
		if (result) {
			deferred.resolve(result); 				
		} else {
			deferred.resolve();
		}
	});
	
	return deferred.promise;
}



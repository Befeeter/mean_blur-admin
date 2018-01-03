var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('city');

var service = {};

service.create = create;
service.getAll = getAll;
service.getById = getById;
service.update = update;

module.exports = service;



function create(userParam) {
  var deferred = Q.defer();
  // var user = _.omit(userParam, 'password');
  //
  // // add hashed password to user object
  // user.hash = bcrypt.hashSync(userParam.password, 10);

  db.city.insert(
    userParam,
    function (err, doc) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      deferred.resolve();
    });


    return deferred.promise;
  }

function update(_id,userParam) {
  var deferred = Q.defer();
  // Fields to Be Updated
  var set = {};

    if (userParam.vehicle_name) {
        set.vehicle_name = userParam.vehicle_name;
    } else {
        set.vehicle_name = null;
    }

    if (userParam.seat_no) {
        set.seat_no = userParam.seat_no;
    } else {
        set.seat_no = null;
    }

    if (userParam.description) {
        set.description = userParam.description;
    } else {
        set.description = null;
    }

    if (userParam.type) {
        set.type = userParam.type;
    } else {
        set.type = null;
    }

    if (userParam.min_fare) {
        set.min_fare = userParam.min_fare;
    } else {
        set.min_fare = null;
    }

    if (userParam.base_fare) {
        set.base_fare = userParam.base_fare;
    } else {
        set.base_fare = null;
    }

    if (userParam.price_per_minute) {
        set.price_per_minute = userParam.price_per_minute;
    } else {
        set.price_per_minute = null;
    }

    if (userParam.price_per_distance) {
        set.price_per_distance = userParam.price_per_distance;
    } else {
        set.price_per_distance = null;
    }


    db.bus.update({_id: mongo.helper.toObjectID(_id)}, {$set: set}, function (err, doc) {
        if (err)
            deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(doc);
    });

    return deferred.promise;
  }

  function getAll(userParam){
    var deferred = Q.defer();
    db.city.find().toArray(function(err, user) {
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

  function getById(_id){
    var deferred = Q.defer();
      db.bus.findById(_id, function (err, user) {
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

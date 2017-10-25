var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('bus');

var service = {};

service.create = create;
service.getAll = getAll;

module.exports = service;



function create(userParam) {
  var deferred = Q.defer();
  // var user = _.omit(userParam, 'password');
  //
  // // add hashed password to user object
  // user.hash = bcrypt.hashSync(userParam.password, 10);

  db.bus.insert(
    userParam,
    function (err, doc) {
      if (err) deferred.reject(err.name + ': ' + err.message);

      deferred.resolve();
    });


    return deferred.promise;
  }

  function getAll(userParam){
    var deferred = Q.defer();
    db.bus.find().toArray(function(err, user) {
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

var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('tbl_admin');
db.bind('tbl_setting');

var service = {};

service.authenticate = authenticate;
service.getById = getById;
service.getSetting = getSetting;
service.create = create;
service.update = update;
service.delete = _delete;
service.updateSetting = updateSetting;

service.forgotpassword = forgotpassword;
service.setPassword = setPassword;
service.updatepassword = updatepassword;

module.exports = service;

function authenticate(username, password) {

    var deferred = Q.defer();

    db.tbl_admin.findOne({$or: [{'email': username}, {'mobile': username}]}, function (err, user) {
        if (err){
            deferred.reject(err.name + ': ' + err.message);
        }

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

function getById(_id) {
    console.log("Inside user service");
    var deferred = Q.defer();

    db.tbl_admin.findById(_id, function (err, user) {
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

function getSetting() {
    var deferred = Q.defer();

    db.tbl_setting.findOne({}, function (err, user) {
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

function create(userParam) {
    var deferred = Q.defer();

    // validation
    db.tbl_admin.findOne(
        { username: userParam.username },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                // username already exists
                deferred.reject('Username "' + userParam.username + '" is already taken');
            } else {
                createUser();
            }
        });

    function createUser() {
        // set user object to userParam without the cleartext password
        var user = _.omit(userParam, 'password');

        // add hashed password to user object
        user.hash = bcrypt.hashSync(userParam.password, 10);

        db.tbl_admin.insert(
            user,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function update(_id, userParam, file) {
    var deferred = Q.defer();

    // validation
    db.tbl_admin.findById(_id, function (err, user) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (user.username !== userParam.username) {
            // username has changed so check if the new username is already taken
            db.tbl_admin.findOne(
                { username: userParam.username },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Username "' + userParam.username + '" is already taken')
                    } else {
                        updateUser();
                    }
                });
        }
        else if (user.email !== userParam.email) {
            // username has changed so check if the new username is already taken
            db.tbl_admin.findOne(
                { email: userParam.email },
                function (err, user) {
                    if (err) deferred.reject(err.name + ': ' + err.message);

                    if (user) {
                        // username already exists
                        deferred.reject('Email "' + userParam.email + '" is already taken')
                    } else {
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
        var set = {
            first_name: userParam.first_name,
            last_name: userParam.last_name,
            username: userParam.username,
            email: userParam.email,
            mobile: userParam.mobile,
        };

        // update password if it was entered
        if (userParam.password) {
            set.hash = bcrypt.hashSync(userParam.password, 10);
        }

        if(typeof file !='undefined' || file != null){
        	if(typeof file != 'undefined') {
              if(file.filename){
                 set.profile_image = file.filename;
             }
             else{
                 set.profile_image = null;
             }
         }
         else{
            set.profile_image = null;
        }
    }
    else{
     set.profile_image = null;
 }

 db.tbl_admin.update(
    { _id: mongo.helper.toObjectID(_id) },
    { $set: set },
    function (err, doc) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve();
    });
}

return deferred.promise;
}

function updateSetting(adminId, userParam) {
  var deferred = Q.defer();
		// fields to update
        var set = {
            delivery_fare: parseFloat(userParam.delivery_fare),
            min_distance: parseFloat(userParam.min_distance),
            min_distance_cost: parseFloat(userParam.min_distance_cost)
        };
        db.tbl_setting.update(
            { adminId: parseInt(adminId) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);
                deferred.resolve();
            }
            );
        return deferred.promise;
    }


    function _delete(_id) {
        var deferred = Q.defer();

        db.tbl_admin.remove(
            { _id: mongo.helper.toObjectID(_id) },
            function (err) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });

        return deferred.promise;
    }


//......................................................
function setPassword(_id, userParam) {
    var deferred = Q.defer();

    // validation
    db.tbl_admin.findById(_id, function (err, user) {
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

        db.tbl_admin.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}

function forgotpassword(email) {
    var deferred = Q.defer();
	//console.log(email);
    db.tbl_admin.findOne({ email: email.toLowerCase() }, function (err, user) {
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

/*... Forgot password */
function updatepassword(_id, password) {
    var deferred = Q.defer();
    var set = {};
    if (password) {
      set.hash = bcrypt.hashSync(password, 10);
  }

  db.tbl_admin.update(
      { _id: mongo.helper.toObjectID(_id) },
      { $set: set },
      function (err, doc) {
       if (err) deferred.reject(err.name + ': ' + err.message);

       deferred.resolve();
   });

  return deferred.promise;
}

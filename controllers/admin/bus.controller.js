var config = require('config.json');
var express = require('express');
var router = express.Router();
var busService = require('services/bus.service');

// routes
router.post('/', saveData);

module.exports = router;

// function isUserAuthenticated(req,res,next){
//   console.log("Session Details: "+ req.session);
//   // delete req.session;
//   //
//   console.log("Inside authenticated");
//   // return false;
//   //you can check anything heref like req.url ,session ect.
//
//   //so let's check if user session exists
//   // if(req.session){
//   //   //user logged in
//   //   return next();
//   // }
//   //user not authenticated redirect them to login page or anywhere you want
//
//   console.log("Before Redirect");
//   // res.redirect("/admin/logout");
// // res.render(req.app.get("admin_path")+"auth", { error: 'An error occurred !' });
//   res.render(req.app.get("admin_path")+"auth");
// }


function saveData(req, res, next){
  busService.create(req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

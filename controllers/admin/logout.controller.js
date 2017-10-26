require('rootpath')();
var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config.json');

router.get('/', function (req, res) {
  // log user out
  if(req.session.token){
    delete req.session.token;
    delete req.session.userId;
  }

  res.redirect("/admin/");


});

module.exports = router;

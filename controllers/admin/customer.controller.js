var config = require('config.json');
var express = require('express');
var router = express.Router();
var customerService = require('services/customer.service');

// routes
router.post('/', saveData);
router.post('/update', updateData);
router.get('/getAll', getAll);
router.post('/getById', getById);
router.get('/getActiveCustomer', getActiveCustomer);
router.get('/getInActiveCustomer', getInActiveCustomer);

module.exports = router;

function saveData(req, res, next){
  customerService.create(req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}


function updateData(req, res, next){
  customerService.updateStatus(req.body._id,req.body.status)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getAll(req, res, next){
  customerService.getAll()
  .then(function (user) {
    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getActiveCustomer(req, res, next){
  customerService.getCustomerByStatus(1)
  .then(function (user) {
    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getInActiveCustomer(req, res, next){
  customerService.getCustomerByStatus(2)
  .then(function (user) {
    if (user) {
      res.send(user);
    } else {
      res.sendStatus(404);
    }
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getById(req, res, next){

   customerService.getById(req.body.bus_id)
   .then(function (user) {
     if (user) {
       res.send(user);
     } else {
       res.sendStatus(404);
     }
   })
   .catch(function (err) {
     res.status(400).send(err);
   });
}

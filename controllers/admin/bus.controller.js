var config = require('config.json');
var express = require('express');
var router = express.Router();
var busService = require('services/bus.service');

// routes
router.post('/', saveData);
router.post('/update', updateData);
router.get('/', getAll);
router.post('/getById', getById);

module.exports = router;

function saveData(req, res, next){
  busService.create(req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}


function updateData(req, res, next){

  busService.update(req.body._id,req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getAll(req, res, next){
  busService.getAll()
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

   busService.getById(req.body.bus_id)
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

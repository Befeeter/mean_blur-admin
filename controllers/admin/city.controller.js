var config = require('config.json');
var express = require('express');
var router = express.Router();
var cityService = require('services/city.service');

// routes
router.post('/', saveData);
router.post('/update', updateData);
router.get('/getAll', getAll);
router.post('/getById', getById);

module.exports = router;

function saveData(req, res, next){
  cityService.create(req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}


function updateData(req, res, next){

  cityService.update(req.body._id,req.body)
  .then(function () {
    res.sendStatus(200);
  })
  .catch(function (err) {
    res.status(400).send(err);
  });
}

function getAll(req, res, next){
  cityService.getAll()
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

   cityService.getById(req.body.bus_id)
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

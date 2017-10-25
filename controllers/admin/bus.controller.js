var config = require('config.json');
var express = require('express');
var router = express.Router();
var busService = require('services/bus.service');

// routes
router.post('/', saveData);
router.get('/getAll', getAll);

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

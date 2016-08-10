var express = require('express');
var router = express.Router();
var formidable=require('formidable');
var path=require('path');
var util=require('util');

/* GET users listing. */
router.get('/abc', function(req, res) {
  res.send('respond with a resource');
});

module.exports = router;

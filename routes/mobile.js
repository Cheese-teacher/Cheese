var express = require('express');
var router = express.Router();
var formidable=require('formidable');
var path=require('path');
var util=require('util');

/* GET users listing. */
router.get('/mobile', function(req, res) {
	console.log("mobile HI");
 	res.render('mobile');
});

module.exports = router;

var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
var mysql = require('mysql');
var config = require("../lib/config.js");


var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true }));

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'hackmd'
});

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('./views/cheese_index', {
        url: config.url,
        facebook: config.facebook,
        twitter: config.twitter,
        github: config.github,
        gitlab: config.gitlab,
        dropbox: config.dropbox,
        google: config.google
    });
});

module.exports = router;

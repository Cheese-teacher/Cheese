var express = require('express');
var router = express.Router();
var path=require('path');
var config = require("../lib/config.js");

router.get('/', function(req, res, next){
    res.render('../public/views/gameweb',{ url:config.url });
                               
});
router.get('/game', function(req, res, next){
    res.render('../public/views/game',{ url:config.url });
    
                               
});

module.exports = router;
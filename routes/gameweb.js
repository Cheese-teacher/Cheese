var express = require('express');
var router = express.Router();
var path=require('path');


router.get('/', function(req, res, next){
    res.render('../public/views/gameweb');
                               
});
router.get('/game', function(req, res, next){
    res.render('../public/views/game');
    
                               
});

module.exports = router;
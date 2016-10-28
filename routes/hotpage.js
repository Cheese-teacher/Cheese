var express = require('express');
var router = express.Router();

/* GET 熱門筆記 page. */
router.get('/hotpage', function(req, res, next) {
  res.render('./views/note', {title:'HOT Note'});
});

module.exports = router;

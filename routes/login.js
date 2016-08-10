var express = require('express');
var router = express.Router();
var formidable=require('formidable');
var path=require('path');
var util=require('util');

/* GET users listing. */
router.get('/login', function(req, res) {
  res.render('login');
});

//載入MySQL模組
var mysql = require('mysql');
//建立連線
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database: 'hackmd'
});

//開始連接
connection.connect();

//接著就可以開始進行查詢
/* SQL 例子
connection.query('SELECT * from user;',function(error, rows, fields){
    //檢查是否有錯誤
    if(error){
        throw error;
    }
    console.log(rows); //2
});
SQL例子*/
module.exports = router;

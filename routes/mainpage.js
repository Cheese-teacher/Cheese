var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
var mysql = require('mysql');

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
var num=0;


//new

router.get('/', function(req, res, next) {
	
    res.render('./views/mainpage', { title: '主頁' });
});

router.post('/findpostid', upload.array(),function(req, res , next){
	var departmentid=req.body.departmentid;
	connection.query('SELECT * from posting where departmentId =" ' + departmentid+'"'  ,function(error, rows, fields){
		//檢查是否有錯誤
				if(error){
			
					throw error;
				}	
				var course=' postId = "'+rows[0].Id+'"';
				for(var i=1;i<rows.length;i++){
		
					course+=' OR postId = "'+rows[i].Id+'"';
				}
				
				connection.query('SELECT  postId, COUNT(*) AS hm from comment where '+course+ ' GROUP BY postId ORDER BY COUNT(*) DESC LIMIT 5 ' ,function(error, rowss, fields){
				//檢查是否有錯誤
					if(error){
			
						throw error;
					}
					var truerows=new Object();
					var count=0;
					for(var i=0;i<rowss.length;i++){
						for(var j=0;j<rows.length;j++){
							if(rows[j].Id==rowss[i].postId){
								
								truerows[count]=rows[j];
								
								count++;
								break;
							}
						}
					}
					
					
					res.send(truerows);
				});
				
				
	});
	
	
});

router.post('/showpost', upload.array(),function(req, res , next){
	
	
	
	var yourcourse=req.body.yourcourse;
	
	
	
	
	var course=' postId = "'+yourcourse[0].Id+'"';
	
	for(var i=1;i<yourcourse.length;i++){
		
		course+=' OR postId = "'+yourcourse[i].Id+'"';
	}
	
	connection.query('SELECT  postId, COUNT(*) AS hm from comment where '+course+ ' GROUP BY postId ORDER BY COUNT(*) DESC LIMIT 5 ' ,function(error, rows, fields){
		//檢查是否有錯誤
			if(error){
			
				throw error;
			}	
			
			res.send(rows);
		});
		
		
	//res.end();
	
	
	
});


router.post('/yourcourse', upload.array(),function(req, res , next){
	
	console.log(req.session);

	
	connection.query(' SELECT Yourcourse from users where id = "'+req.session.passport.user+'" '  ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		res.send(rows);
	});
	
});

router.post('/yourcourseinfo', upload.array(),function(req, res , next){
	var yourcourse=req.body.yourcourse;
	var coursearray=new Array();
	coursearray=yourcourse.split("|");
	
	var course=' Class = "'+coursearray[0]+'"';
	
	for(var i=1;i<coursearray.length-1;i++){
		
		course+=' OR Class = "'+coursearray[i]+'"';
	}
	
	
	
	connection.query(' SELECT * from class where '+course+' '  ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		
		res.send(rows);
		
	});
	
	//res.end();
	
});

module.exports = router;

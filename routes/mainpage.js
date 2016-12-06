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
var num=0;


//new

router.get('/', function(req, res, next) {
    res.render('./views/mainpage', { title: '主頁' ,url:config.url});
});

router.post('/findpostid', upload.array(),function(req, res , next){
	var departmentid=req.body.departmentid;
	if(departmentid==undefined){
		res.end();
	}
	else{
		var sql="";
	/* 
		(select * from hackmd.posting where departmentId="1" order by viewcount desc,date desc limit 5)
		union 
		(select * from hackmd.posting where departmentId="13" order by viewcount desc,date desc limit 5)
	*/
	var abc="";
	for (var a =0;a<departmentid.length;a++){
		if(a==0)
			sql+="(select class.Classname,posting.*  from posting,class \
					where class.Class=posting.courseId and departmentId='"+departmentid[0]+"' \
					order by viewcount desc,date desc limit 5)";
		else{
			sql+=" union all (select class.Classname,posting.*  from posting,class \
					where class.Class=posting.courseId and departmentId='"+departmentid[a]+"' \
					order by viewcount desc,date desc limit 5)";
		}

	}

	connection.query(sql,function(error,rows,fields){
		if(error){
			throw error;
		}
		res.send(rows).end();
	});
/*
	connection.query('SELECT * from posting where departmentId =" ' + departmentid+'"'  ,function(error, rows, fields){
		//檢查是否有錯誤
			if(error){
				throw error;
			}	
			if(rows.length==0){
				res.send(rows);
			}
			else{
				var course=' postId = "'+rows[0].Id+'"';
				for(var i=1;i<rows.length;i++){
		
					course+=' OR postId = "'+rows[i].Id+'"';
				}

				var sql ='SELECT  postId, COUNT(*) AS hm from comment where '+course+ ' GROUP BY postId ORDER BY COUNT(*) DESC LIMIT 5 ';
								console.log("-----");
				console.log("-----");
				console.log("-----");
				console.log(sql);
				connection.query(sql ,function(error, rowss, fields){
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
								console.log(truerows[count]);
								count++;
								break;
							}
						}
					}
					
					
					res.send(truerows);
				});
			}
	});
*/
	}
	
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

router.post('/insertdepartment', upload.array(),function(req, res , next){
	var departmentid=req.body.departmentid;
	console.log(departmentid);

	connection.query(' UPDATE users SET hotselected = "'+departmentid+'" where id = "'+req.session.passport.user+'"  '  ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		res.send(rows);
	});
});


router.post('/setsession', upload.array(),function(req, res , next){
	
	var classid=req.body.classid;
	var departmentid=req.body.departmentid;
	req.session.courseid=classid;
	req.session.departmentid=departmentid;
	
	
	res.end();
});


router.post('/yourcourse', upload.array(),function(req, res , next){
	
	connection.query(' SELECT * from users where id = "'+req.session.passport.user+'" '  ,function(error, rows, fields){
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
	
	var sql=' SELECT * from class where '+course+' '  ;
	connection.query(sql,function(error, rows, fields){

		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		
		req.session.courseinfo=rows;
		try{
			console.log("OK1");
			res.send(rows).end();
			console.log("OK2");
		}
		catch(err){
			console.log("00000000000000000000try error");
			console.log(err);
		}
		
		
	});
	
	//res.end();
	
});
router.post('/bannerinsert',function(req,res){
	var data=new Object();
	data.content=req.body.val;
	var sql="INSERT INTO banner SET ?";
	connection.query("INSERT INTO banner SET ?",data ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		
		res.end();
		});
		
});
router.post('/bannerinit',function(req,res){
	var sql="SELECT * FROM banner";
	connection.query(sql,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}	
		
		res.send(rows).end();
		});
		
});
module.exports = router;

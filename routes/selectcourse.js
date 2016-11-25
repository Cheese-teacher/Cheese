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
	console.log(req.session);
    res.render('./views/course', { title: '選課' ,url:config.url});
});

//所選擇查詢的系所 年級 or課
router.post('/selectcourse', upload.array(),function(req, res , next){
	var department=req.body.department;
	var grade=req.body.grade;
	var course=req.body.course;

	if(course==""){

		if(department=="all"&&grade=="all"){
			connection.query('SELECT * from class ' ,function(error, rows, fields){
		//檢查是否有錯誤
				if(error){

					throw error;
				}

				res.send(rows);
			});
		}
		else if(department=="all"){
			connection.query('SELECT * from class where Grade LIKE "'+grade+'%" ' ,function(error, rows, fields){
		//檢查是否有錯誤
				if(error){

					throw error;
				}

				res.send(rows);
			});
		}
		else if(grade=="all"){


			if(department=="資管系"||department=="經濟系"||department=="國企系"||department=="財金系"||department=="觀光餐旅系餐旅"||department=="觀光餐旅系觀光"){


				connection.query('SELECT * from class where Department LIKE "%'+department+'" OR Department LIKE "%管院" '  ,function(error, rows, fields){
				//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});

			}
			else {
				connection.query('SELECT * from class where Department LIKE "%'+department+'" ' ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){

						throw error;
					}

					res.send(rows);
				});
			}
		}

		else{

			if(department=="資管系"||department=="經濟系"||department=="國企系"||department=="財金系"||department=="觀光餐旅系餐旅"||department=="觀光餐旅系觀光"){


				connection.query('SELECT * from class where (Department LIKE "%'+department+'" OR Department LIKE "%管院" ) AND Grade LIKE "%'+grade+'%" '  ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});

			}
			else {
				connection.query('SELECT * from class where Department LIKE "%'+department+'" AND Grade LIKE "%'+grade+'%" '  ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});
			}
		}
	}



	else{

		if(department=="all"&&grade=="all"){
			connection.query('SELECT * from class where Classname LIKE "%'+course+'%" ' ,function(error, rows, fields){
		//檢查是否有錯誤
				if(error){

					throw error;
				}

				res.send(rows);
			});
		}
		else if(department=="all"){
			connection.query('SELECT * from class where Grade LIKE "'+grade+'%" AND  Classname LIKE "%'+course+'%" ' ,function(error, rows, fields){
		//檢查是否有錯誤
				if(error){

					throw error;
				}

				res.send(rows);
			});
		}
		else if(grade=="all"){


			if(department=="資管系"||department=="經濟系"||department=="國企系"||department=="財金系"||department=="觀光餐旅系餐旅"||department=="觀光餐旅系觀光"){


				connection.query('SELECT * from class where Department LIKE "%'+department+'" OR Department LIKE "%管院" AND  Classname LIKE "%'+course+'%" '  ,function(error, rows, fields){
				//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});

			}
			else {
				connection.query('SELECT * from class where Department LIKE "%'+department+'" AND  Classname LIKE "%'+course+'%" ' ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){

						throw error;
					}

					res.send(rows);
				});
			}
		}

		else{

			if(department=="資管系"||department=="經濟系"||department=="國企系"||department=="財金系"||department=="觀光餐旅系餐旅"||department=="觀光餐旅系觀光"){


				connection.query('SELECT * from class where (Department LIKE "%'+department+'" OR Department LIKE "%管院" ) AND Grade LIKE "%'+grade+'%" AND  Classname LIKE "%'+course+'%" '  ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});

			}
			else {
				connection.query('SELECT * from class where Department LIKE "%'+department+'" AND Grade LIKE "%'+grade+'%" AND  Classname LIKE "%'+course+'%" '  ,function(error, rows, fields){
					//檢查是否有錯誤
					if(error){
						throw error;
					}
					res.send(rows);
				});
			}
		}
	}


});

//把選擇的課存入資料庫
router.post('/insertcourse', upload.array(),function(req, res , next){
	var yourcourse=req.body.yourcourse;


	var a='oooo';
	connection.query(' UPDATE users SET Yourcourse = "'+yourcourse+'" where id = "'+req.session.passport.user+'"  '  ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}
		res.send(rows);
	});


});


//撈出你選擇的課有哪些
router.post('/yourcourse', upload.array(),function(req, res , next){



	connection.query(' SELECT Yourcourse,hotselected from users where id = "'+req.session.passport.user+'" '  ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}
		res.send(rows);
	});

});

//撈出你選擇的課的詳細之類

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


module.exports = router;

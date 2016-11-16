//new pretest 資料庫 courseid 欄位由INT改VARCHAR(45)
//new sql 指令SELECT 那邊都加上 ' 
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
var mysql = require('mysql');
var session = require('express-session');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var cookieParser=require('cookie-parser');

router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true }));
router.use(cookieParser());


var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'hackmd'
});

router.get('/',function(req,res){
	console.log(req.session);
    if(!req.session.userid){
    	req.session.userid="aid";
    }
	if(!req.session.username)
	  req.session.username="a";
	if(!req.session.departmentid)
	  req.session.departmentid='13'
	if(!req.session.courseid)
      req.session.courseid='1000';
	res.redirect('http://localhost:3000/pretest/course');

});

router.get('/course/',function(req,res){
	if(!req.session.userid&&!req.session.username&&!req.session.departmentid&&!req.session.courseid){
      res.redirect('http://localhost:3000/pretest');
	}else{
		res.render('./views/pretest',{username:req.session.username,courseid:req.session.courseid});
	}
	
});
//init
router.post('/init',function(req,res){
	console.log(req.session);
	connection.query("SELECT * FROM pretest WHERE courseid='"+req.session.courseid+"' ORDER BY date DESC Limit 50",function(err,rows,fileds){
		if(!err){
			res.send(rows);
			res.end();
		}
		else{
			console.log(err);
		}
	});

});
router.post('/init/filetype',function(req,res){
	connection.query("SELECT filetype FROM pretest WHERE courseid='"+ req.session.courseid+"' group by filetype;",function(err,rows,fileds){
		if(!err){
			res.send(rows);
			res.end();
		}
		else{
			console.log(err);
		}
	});

});
router.post('/changefiletype',function(req,res){
	var sql="SELECT * FROM pretest WHERE courseid='"+ req.session.courseid+"'";
	var tmp="";
	var flag=false;

	for (var a=1;a<req.body.arr.length;a+=2){
		if(req.body.arr[a]=="true"&& flag==false){
			flag=true;
			tmp+=" AND filetype ='"+req.body.arr[a-1]+"' ";
		}
		else if(req.body.arr[a]=="true" && flag==true){
			tmp+=" OR filetype='"+req.body.arr[a-1]+"' ";
		}
		else{}
	}
	if(tmp==""){
		res.send("清空");
	}
	else{
		sql+=tmp;
		connection.query(sql,function(err,rows,fileds){
			if(!err){
				res.send(rows);
				res.end();
			}
			else{
				console.log(err);
			}
		})
	}

});

//上傳考古題檔案 AND 新增資料到資料庫
router.post('/pretestupload',function(req,res){
	var form=new formidable.IncomingForm();
	var filelist = new Array();
	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	var contain= new Object();

	contain.userid=req.session.passport.user;
	contain.depid=req.session.departmentid;
	contain.courseid=req.session.courseid;
	contain.date=now;
	form.on('fileBegin', function(type, file) {
		var f=new Object();
		f.filename=file.name;
		filelist.push(f);
		file.path=path.join(__dirname, '../public/images/'+file.name);
	});
	form.parse(req);
	form.on('end',function(){
		res.send(filelist);
		for(var i =0;i<filelist.length;i++){
			contain.filename=filelist[i].filename;
			contain.filetype=filelist[i].filename.substring(filelist[i].filename.indexOf('.')+1);
			connection.query('INSERT INTO pretest SET ?', contain , function(err,result){
				if (err){
					console.log("SQL 新增考古題資料失敗");
					console.log(err);
				}
			});


		}
		res.end();
	});

});
router.post('/tag/insert',function(req,res){
	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	var tagcontain=new Object();
	tagcontain.courseid=req.session.courseid;
	tagcontain.tag=req.body.tag;
	tagcontain.date=now;
	for(var a =0;a<req.body.imglist.length;a++){
		tagcontain.pretest=req.body.imglist[a];
		connection.query('INSERT INTO tag SET ?', tagcontain , function(err,result){
		if (err){
			console.log("SQL 新增tag失敗");
			console.log(err);
		}
		});
	}
	
});
//下載考古題檔案
router.get('/pretestdownload',function(req,res){
	res.download('./public/images/'+req.query.fn);
});

router.post('/get/tag',function(req,res){
	var sql='SELECT * FROM tag WHERE courseid= "'+req.session.courseid+' "';
	connection.query(sql,function(err,rows,fileds){
		if(!err){
			res.send(rows);
			res.end();
		}
		else{
			console.log("pretest,js /get/tag 失敗 ");
		}

	});
});
module.exports = router;

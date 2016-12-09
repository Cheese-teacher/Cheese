var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
require('socket.io');
var mysql = require('mysql');
var session = require('express-session');
var multer = require('multer'); // v1.0.5
var upload = multer(); // for parsing multipart/form-data
var async= require('async'); //samchange1
var config = require("../lib/config.js");
var cors = require('cors');
router.use(bodyParser.json()); // for parsing application/json
router.use(bodyParser.urlencoded({ extended: true }));

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'admin',
  password : 'admin',
  database : 'hackmd'
});

/* GET home page. */
var onlineCount=0;

var io_Chatroom = {
    io: null,
    startConnection:startConnection
};


router.use(cors());

var room;
//samchange2
function startConnection(socket){

	socket.on('joinroom',function(data){

		socket.join(data.data);
		socket['room']=data.data;//這個變數很重要,是分ROOM的標準(拿課號)，拿來TO/LEAVE的時候備用
		//socket.to(data.data).emit('joined',{roomid:data.data});
		socket.broadcast.to(socket['room']).emit('joined',{roomid:data.data});
	});

	socket.on('uploadpost',function(data){
		socket.broadcast.to(socket['room']).emit('uploadpost',data);

	});




	socket.on('insertcomment',function(data,postid,courseid){


		console.log(postid);
		socket.broadcast.emit('insertcomment',data,postid,courseid);

	});


	socket.on('c_send',function(data){
		socket.emit('s_send',{data:socket['room']});
		socket.broadcast.to(socket['room']).emit('s_send',{data:socket['room']});
	});

	socket.on('disconnect',function(a){
		socket.leave(socket['room']);
	});

	/*join room 例子
	socket.on('joinroom',function(data){
		socket.join(data.data);
		socket['room']=data.data;//這個變數很重要,是分ROOM的標準(拿課號)，拿來TO/LEAVE的時候備用
		//socket.to(data.data).emit('joined',{roomid:data.data});
		socket.broadcast.to(socket['room']).emit('joined',{roomid:data.data});
	});

	socket.on('c_send',function(data){
		socket.emit('s_send',{data:socket['room']});
		socket.broadcast.to(socket['room']).emit('s_send',{data:socket['room']});
	});
	socket.on('disconnect',function(a){
		socket.leave(socket['room']);
	});
	join room 例子*/

/*
  socket.emit('someone_login',{'number':onlineCount});
  console.log('有人加入了聊天室');
  console.log('目前在線人數: '+onlineCount);

  //When user disconnect
  socket.on('disconnect', function() {
    onlineCount--;
    socket.broadcast.emit('someone_logout',{'number':onlineCount});
    console.log('有人退出了聊天室');
    console.log('目前在線人數: ' + onlineCount);
      */
};


/*
  //test if socket still exist connection
  socket.on('but', function(msg) {
    console.log(msg);
  });

  socket.on('clientsend',function(data){
      socket.broadcast.emit('serversend',data)
  });
  socket.on('client_send_img',function(data){
      socket.broadcast.emit('server_send_img',data)
  });
  socket.on('client_sent_pre',function(data){
    socket.broadcast.emit('server_send_pre',data)
  });
  */



router.get('/', function(req, res, next) {

    res.redirect('http://localhost:3000/routes/course/');
});

router.post('/getNote',function(req, res){
	var classid = req.body.classid;
    var sql = 'select shortid from Notes where class = "' + classid + '" ';
    connection.query(sql ,function(err,result){
		if(err){
			console.log(err);
            console.log(sql);
		}else{
            if(result.length == 0) {
                var url = 'http://localhost:3000/';
            }else {
                var url = 'http://localhost:3000/'+ result[0].shortid;
            }
            res.send(url);
		}
	});
    //res.render('/routes/course/index2',{ courseid: req.session.courseid });
});

router.post('/setsession', upload.array(),function(req, res , next){
	var classid=req.body.classid;
	req.session.courseid=classid;
	var departmentid=req.body.departmentid;
	req.session.departmentid=departmentid;
	res.end();
});

router.get('/course/', function(req, res, next) {
	if(!req.session.courseid&&!req.session.departmentid)
	{
		res.redirect('http://localhost:3000/routes');
	}
	else{
		req.session.reload(function(err) {})

		res.render('./views/index2', {courseid:req.session.courseid});
	}

});



router.post('/deletecomment', upload.array(),function(req, res , next){
	var commentid=req.body.data;
	connection.query('delete from comment where Id= ' +commentid+ '' ,function(err,result){
		if(err){
			console.log(err);
		}else{
			res.end();
		}
	});


});

router.post('/showcomment', upload.array(),function(req, res , next){
	var postid=req.body.data;
	connection.query('SELECT * from comment where postId = "' +postid+ '" ORDER BY Id DESC Limit 10' ,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			throw error;
		}
		res.send(rows);
	});

});

router.post('/insertcomment', upload.array(),function(req, res , next){
	var comment=req.body.data;

	var courseid=req.session.courseid;
	var postid=req.body.postid;
	var anonymous=req.body.anonymous;

	var imglist=req.body.imglist;
	var code=req.body.code;

	var commentcontain=new Object();
	commentcontain.postId=postid;
	commentcontain.content=comment;
	commentcontain.anonymous=anonymous;
	commentcontain.clike=0;
	commentcontain.owner=req.session.passport.user;
	commentcontain.imglistc=imglist;
	commentcontain.code=code;
	var Classname;
	var posttitle;
	var commentonwer=new Array();
	var postowner;

	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	commentcontain.cdate=now;

	async.series([
		function hehe(callback){
			var sql='SELECT Owner FROM posting where Id="'+postid+'"';
			connection.query(sql, function(err, rows, fields){
				if(!err){
					if(req.session.passport.user==rows[0].owner){
						postowner=undefined;
						callback();
					}
					else{
						postowner=rows[0].Owner;
						callback();
					}
				}
				else{

				}
			});
		},

		function hehe(callback){
			var sql='SELECT owner FROM comment where postid = "'+postid+'"';
			connection.query(sql, function(err, rows, fields){
				if(!err){
					if(rows.length==0)
						callback();
					else{
						var repeat=false;
						var c=0;
						for(i in rows){
							 repeat=false;
							 if(req.session.passport.user==rows[i].owner||postowner==rows[i].owner){
								 c++;
								 continue;
							 }
							 if(commentonwer.length==0){
								 console.log('nooooooooooo');

								 commentonwer.push(rows[c].owner);
							 }
							for(j in commentonwer){
								if(commentonwer[j]==rows[i].owner||postowner==rows[i].owner){
									repeat=true;
									break;
								}
							}
							if(repeat==false){
								commentonwer.push(rows[i].owner);

							}
						}

						console.log('我問你是誰！！！！！！！');

						callback();
					}
				}
				else{
					callback();

				}

			});

		},


		function hehe(callback){
			console.log(commentonwer);
			//var sql='DELETE from notice WHERE postid="'+postid+'"';
			connection.query('DELETE from notice WHERE postid="'+postid+'"', function(err, result) {
				if(!err){
					callback();
				}
				else{
					callback();
				}

			});

		},

		function hehe(callback){
			var sql='SELECT posting.title,class.Classname from posting , class WHERE posting.Id="'+postid+'" AND class.Class="'+courseid+'"';
				connection.query(sql, function(err, rows, fields){
					if(!err){
						posttitle=rows[0].title;
						Classname=rows[0].Classname;

						callback();
					}
					else{
						console.log(err);
						callback();
					}

				});
		},

		function hehe(callback){
			console.log('BELLO!!!!!!!!!!!');
			if(postowner==undefined){
				callback();
			}
			else{
				var msg='你在 ['+Classname+'] 發的文章 '+posttitle+' 有人留言咯~';
				var notice=new Object();
				notice.msg=msg;
				notice.postid=postid;
				notice.user=postowner;
				connection.query('INSERT INTO notice SET ?', notice, function(err, result) {
					if(!err){
						callback()
					}
					else{
						callback();
					}

				});
			}
		},

		function hehe(callback){
			if(commentonwer.length==0)
			{
				callback();
			}
			else{
				for(i in commentonwer){
					var msg='你在 ['+Classname+'] 發的留言 '+posttitle+' 有人回复咯~';
					var notice=new Object();
					notice.msg=msg;
					notice.postid=postid;
					notice.user=commentonwer[i];
					connection.query('INSERT INTO notice SET ?', notice, function(err, result) {
						if(!err){
							callback()
						}
						else{
							callback();
						}

					});
				}
			}
		}

	],
	function(err) {
		connection.query('INSERT INTO comment SET ?', commentcontain, function(err, result) {
			if(!err){


				commentcontain.Id=result.insertId;
				if(req.session.commentid==undefined){
					var pi=new Array();
				}
				else
					var pi=req.session.commentid;
				pi.push(postid);
				req.session.commentid=pi;
				console.log(req.session);
				res.send(commentcontain);
				res.end();

			}
			else{
				console.log(err);
				console.log(' 新增comment失敗');
			}

		});


	});




});
//new




router.get('/init/',function(req,res){//初始化，讀取courseid=? 的文章

	console.log("正在讀取 courseId:",req.session.courseid,"文章");
	//var sql='SELECT  * from posting  WHERE courseId= "'+req.session.courseid+'" ORDER BY date DESC Limit 10';
	var sql="SELECT count(comment.postId) as coun,posting.* FROM posting left join comment\
	on posting.Id = comment.postId where courseid='"+req.session.courseid+"'\
	group by posting.Id\
	order by date desc limit 10;";
	connection.query(sql, function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();

		}
		else
			console.log(err);

	});



});

router.post('/getpost/',function(req,res){//讀取文章資料

	var sql='SELECT  * from posting  WHERE Id="'+req.body.postid+'"';


	connection.query(sql, function(err, rows, fields){
		if(!err){

			res.send(rows);
			res.end();
		}
		else{
			console.log(sql);
			console.log(err);
			console.log("getpost error");
		}

	});
});

router.get('/getpostId/',function(req,res){//目前最新文章的ID
	connection.query('SELECT  * from posting  ORDER BY date DESC Limit 1', function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();

		}
		else
			console.log(err);
	});
});
//下面FUNCTION 很久之前寫下來的，不太會用到，但是又不算是沒用
router.post('/uploadvideo',function(req,res){
	var form=new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		//res.writeHead(20,{'content-type':'text/plain','charset':'utf-8'});
		//res.write("上傳"+files.name+"成功");
		//res.end(util.inspect({fields: fields, files: files}))
		//console.log(fields); -->{}
		//file 內容console.log(files);
	});
	form.on('fileBegin', function(type, file) {
		file.name=num+"."+type;
		file.path=path.join(__dirname, '../public/video/'+file.name);
		num++;

		console.log(file);
	});
	res.end(num.toString());

});

router.post('/upload',function(req,res){
	var form=new formidable.IncomingForm();
	form.on('fileBegin', function(type, file) {
		//file.name=num+"."+type;
		file.path=path.join(__dirname, '../public/images/'+file.name);
	});
	form.parse(req,function(err,fields,files){
		//res.writeHead(20,{'content-type':'text/plain','charset':'utf-8'});
		//res.write("上傳"+files.name+"成功");
		//res.end(util.inspect({fields: fields, files: files}))
		//console.log(fields); -->{}
		//file 內容console.log(files);
	});
	res.end();

});

router.post('/uploadc',function(req,res){ //和/upload基本一樣 改了圖片存的folder而已
	var form=new formidable.IncomingForm();
	form.on('fileBegin', function(type, file) {
		//file.name=num+"."+type;
		file.path=path.join(__dirname, '../public/commentimages/'+file.name);
	});
	form.parse(req,function(err,fields,files){
		//res.writeHead(20,{'content-type':'text/plain','charset':'utf-8'});
		//res.write("上傳"+files.name+"成功");
		//res.end(util.inspect({fields: fields, files: files}))
		//console.log(fields); -->{}
		//file 內容console.log(files);
	});
	res.end();

});

//tag option 動作-------------
router.post('/createoption',function(req,res){
	//connection.query('SELECT  * from tag  WHERE courseid= '+req.session.courseid+' AND DAY(date) = DAY(now())', function(err, rows, fields){
	connection.query('SELECT  * from tag  WHERE courseid= "'+req.session.courseid+'" AND DAY(date) = DAY(now())', function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else
			console.log(err);
	});
});
router.post('/tag/insert',function(req,res){
	var sqldata=new Object();
	sqldata.tag=req.body.tag;
	sqldata.courseid=req.session.courseid;
	sqldata.date=req.body.date;
	connection.query('INSERT INTO tag SET ?',sqldata, function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else
			console.log(err);
	});
});
//option 動作-------------
// 考古題備用程式碼-->------
router.post('/pretestupload',function(req,res){
	var form=new formidable.IncomingForm();
	var filelist="";
	var fnum=0;
	filelist+="[";
	form.on('fileBegin', function(type, file) {
		if(fnum>0){
			filelist+=",";
		}
		filelist+="\""+file.name+"\"";
		fnum++;
		console.log(file.name);
		file.path=path.join(__dirname, '../public/images/'+file.name);
	});

	form.parse(req,function(err,fields,files){
		//console.log("fields:",fields.file);
		filelist+="]";
		res.json(filelist);
	});

});
router.get('/pretestdownload',function(req,res){
	res.download('./public/images/'+req.query.fn);
});
// 考古題備用程式碼-->------

router.post('/uploadpost',upload.array(),function(req,res){//發表新文章
	/*資料範例
	var po= new Object();
	po.courseId=200;
	po.departmentId=11;
	po.Owner='DDD';
	po.type='問題';
	po.content='<H1>123</H1>';
	po.like=0;
	po.date='2016-01-01 12:12:21';
	po.code="<script></script>";
	*/
	//發文DATA

	var postcontain=new Object();
	postcontain.tag=req.body.tag; //samchange1
	var w=req.body.w;
	postcontain.courseId=req.session.courseid;
	postcontain.departmentId=req.session.departmentid;
	postcontain.Owner=req.session.passport.user;
	postcontain.type=req.body.type;
	if(req.body.content!=null)
		postcontain.content=req.body.content;
	postcontain.viewcount=0;
	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	postcontain.date=now;
	if(req.body.title!="")
		postcontain.title=req.body.title;
	else
		postcontain.title="";
	if(req.body.imglist!=undefined)
		postcontain.imglist=req.body.imglist;
	if(req.body.youtubeLink!=undefined)
		postcontain.youtubeLink=req.body.youtubeLink;
	if(req.body.code!=undefined)
		postcontain.code=req.body.code;
	postcontain.anonymous=req.body.anonymous;
	postcontain.ownerico=req.body.ownerico;
	console.log(postcontain);
	//INSERT 發文資料
	async.series([
	function hehe(callback){
		connection.query('INSERT INTO posting SET ?', postcontain, function(err, result) {
			if(!err){
				console.log("使用者",postcontain.Owner, "發了一篇文章，在",postcontain.date);
				console.log(req.session);
				var pi=req.session.postid;
				pi.push(req.body.nextid);
				req.session.postid=pi;
				console.log(req.session);
				callback();
			}
			else{
				callback();
				console.log(err);
			}

		});

	}
	],
	function(err) {

		console.log(w);
		if(w!=''){
			var insert=w.split(',');
			var tagcontain=new Object();


			tagcontain.courseid=req.session.courseid;
			var d=new Date();
			var mon=d.getMonth()+1;
			var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
			tagcontain.date=now;
			tagcontain.parentTag=null;

			for(var i=0;i<insert.length-1;i++){
				tagcontain.tag=insert[i];
				console.log(tagcontain);
				connection.query('INSERT INTO tag SET ?', tagcontain, function(err, result) {
					if(!err){

					}
					else{

						console.log(err);

					}
				});
			}
			res.end();
		}
		else{
			res.end();
		}
	});
});
router.post("/more/",function(req,res){//按下最新/熱門button  and  按下更多BUTTON  動作
	console.log("收到MORE 功能的要求");
	//connection.query('SELECT  * from posting  WHERE courseId="'+req.session.courseid+'" AND Id<'+req.body.postid+' ORDER BY date DESC Limit 10', function(err, rows, fields){
	var type=req.body.type;
	var postid=req.body.postid;
	if(type=="newest"){

	var sql = "SELECT count(comment.postId) as coun,posting.* FROM posting left join comment\
	on posting.Id = comment.postId where courseid='"+req.session.courseid+"'\
	and posting.Id< '"+req.body.postid+"' \
	group by posting.Id\
	order by date desc limit 10;";

	}else if(type="hotest"){

		var sql="SELECT count(comment.postId) as coun,posting.* FROM posting left join comment\
	on posting.Id = comment.postId where courseid='"+req.session.courseid+" '\
	and posting.Id<"+postid+"\
	group by posting.Id\
	HAVING count(comment.postId) > 5\
	order by date desc limit 10;";

	}

	connection.query(sql,function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else{
			console.log(sql);
			console.log(err);
		}

	});
});
router.post("/find/tag",function(req,res){
	connection.query('SELECT  * from posting  WHERE courseId="'+req.session.courseid+'" AND type="'+req.body.val+'" ORDER BY date DESC Limit 10', function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else
			console.log(err);

	});

});

router.post("/live/insert",function(req,res){

	var container=new Object();
	container.youtubeurl=req.body.youtubeurl;
	container.course=req.session.courseid;
	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	container.date=now;
	connection.query('INSERT INTO live SET ?',container,function(err,result){
	if(!err){
			res.status("200").end();
		}
		else
			console.log(err);
	});
	console.log(container);
});

router.get("/live/init",function(req,res){

	connection.query('SELECT  * from live  WHERE course="'+req.session.courseid+'"  ORDER BY date DESC limit 6', function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else
			console.log(err);

	});

});
router.get("/pretest/init",function(req,res){
	connection.query('SELECT  * from pretest  WHERE courseid="'+req.session.courseid+'"  ORDER BY date DESC limit 10', function(err, rows, fields){
		if(!err){
			res.send(rows);
			res.end();
		}
		else
			console.log(err);

	});

});





//>new
router.post("/addviewcount",function(req,res){
	var sql="UPDATE posting SET viewcount = viewcount + 1 WHERE Id='"+req.body.postid+"'";
	connection.query(sql,function(err,result){
	if(!err){
			res.end();
		}
		else
			console.log(err);
	});
});
router.post("/commentcount",function(req,res){
  var sql="SELECT postId ,count(postId) FROM commentcount where postId="+req.body.postid+" ;";
  connection.query(sql,function(err,result){
  	if(!err){
		if(result[0].postId!=null){
			res.send(result);
			res.end();
		}
		}
		else
		console.log(err);
	});
});

router.post('/score/commconfirm',function (req,res){
	var sqluser=req.session.passport.user;
	var sqltargetid=req.body.targetid;
	var sqlvalue=req.body.value;
	var sqltype;
	var nb,$nb;
	var db;
	if(req.body.type=="c"){
		sqltype="c";
		db="comment";
	}else if(req.body.type=="p"){
		sqltype="p";
		db="posting";
	}
	if(req.body.value=="nice"){
		nb="nice";
		$nb="bad";
	}else if(req.body.value=="bad"){
		nb="bad";
		$nb="nice";
	}

	var sql="SELECT * FROM score WHERE user='"+sqluser+"' AND type='"+sqltype+"' AND targetid='"+sqltargetid+"'";
	connection.query(sql,function(err,result){//先去SQL 看USER 之前有沒有按過NICE/BAD
		if(!err){
			if(result.length==0){//IF USER 之前沒按過的話
				var sql="INSERT score SET type='"+sqltype+"',targetid='"+sqltargetid+"' ,user='"+sqluser+"' ,value='"+sqlvalue+"'";
				console.log("frist INSERT to score------");
				console.log(sql);
				connection.query(sql,function(err,result){//就新增SCORE一筆資料 , 記錄他由沒按過(POST/COMMENT),變為已按過(POST/COMMENT)
					if(err){
						console.log(err);
					}
				});
				var sql2="UPDATE "+db+" SET "+nb+" = "+nb+" +1 WHERE Id= '"+sqltargetid+"' ";
				console.log("frist UPDATE to comment------");
				console.log(sql2);
				connection.query(sql2,function(err,result){//再來把(POSTING/COMMENT) 的NICE/BAD +1
					if(err){
						console.log(err);
					}
				});
				res.send(req.body.type).end();
			}
			else{//USER 之前已按過(SQL 有他按過的記錄)
				if(result[0].value==sqlvalue){//他按的NICE/BAD 跟資料庫裡值一樣時
					res.send("clicked").end();
				}else{
					var sql="UPDATE score SET value='"+sqlvalue+"' WHERE type='"+sqltype+"' AND user='"+sqluser+"' AND targetid='"+sqltargetid+"'";
					console.log(sql);
					connection.query(sql,function(err,result){//更改他之前
					if(err){
						console.log(sql);
						console.log(err);
					}else{
						console.log("score 更新成功");
					}
					});
					var sql2="UPDATE "+db+" SET "+nb+" = "+nb+"+1,"+$nb+"="+$nb+"-1 WHERE Id='"+sqltargetid+"'";
					console.log(sql2);
					connection.query(sql2,function(err,result){
						if(err){
							console.log(sql2);
							console.log(err);
						}else{
							console.log("DB 更新成功");
						}
					});
					res.send(req.body.type).end();
				}
			}
		}else{
			console.log("ERR");
			console.log(err);
		}


	});
});
router.post("/getcommentbyid",function(req,res){
	var commentid=req.body.data;
	var sql='SELECT * from comment where Id = "' +commentid+ '"' ;
	connection.query(sql,function(error, rows, fields){
		//檢查是否有錯誤
		if(error){
			console.log(sql);
			throw error;
		}
		res.send(rows);
	});
});
router.post("/postchange",function(req,res){
	var type=req.body.type;
	var courseid=req.session.courseid;
	if(type=="newest"){

		var sql="SELECT count(comment.postId) as coun,posting.* FROM posting left join comment\
	on posting.Id = comment.postId where courseid='"+req.session.courseid+"'\
	group by posting.Id\
	order by date desc limit 10;";

	}else if(type=="hotest"){

		var sql="SELECT count(comment.postId) as coun,posting.* FROM posting left join comment\
	on posting.Id = comment.postId where courseid='"+req.session.courseid+" '\
	group by posting.Id\
	HAVING count(comment.postId) > 5\
	order by date desc limit 10;";

	}

	connection.query(sql, function(err, rows, fields){
		if(!err){
			res.send(rows).end();
		}
		else{
			console.log(sql);
			console.log(err);
		}

	});

});
router.post("/record",function(req,res){
	var type=req.body.type;
	if(type=="p"){
		var sql="select Id FROM posting WHERE Owner='"+req.session.passport.user+"' AND courseId='"+req.session.courseid+"'";

	}else if(type=="c"){
		var sql="SELECT posting.courseId,comment.Id,comment.owner FROM comment,posting WHERE comment.postId=posting.Id \
		AND comment.owner='"+req.session.passport.user+"' AND posting.courseId='"+req.session.courseid+"'";
	}
	connection.query(sql,function(err,result){
			if(err){
				console.log(sql);
				console.log(err);
			}else
			res.send(result).end();
		});

})
router.post('/delete/post',function(req,res){
	var id=req.body.id;

	id=id.replace('p','');
	var sql='delete from posting where Id="'+id+'"' ;
	connection.query(sql,function(err,result){
		if(err){
			console.log(sql);
			console.log(err);
		}else{
			res.end();
		}
	});
});
//<new

//samchange1
router.post("/updatetag",function(req,res){
	var resettag=req.body.resettag;
	console.log(resettag);

	async.series([

	function hehe(callback){
		connection.query('DELETE  from tag  WHERE courseid="'+req.session.courseid+'"', function(err, rows, fields){
			if(!err){
				callback();
			}
			else{
				console.log(err);
			}
		});
	},

	function hehe(callback){
		for(var i in resettag){
			var tagcontain=new Object();
			tagcontain.id=resettag[i].id;
			tagcontain.tag=resettag[i].tag;
			tagcontain.courseid=req.session.courseid;
			var d=new Date();
			var mon=d.getMonth()+1;
			var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
			tagcontain.date=now;
			tagcontain.parentTag=resettag[i].parentid;
			if(tagcontain.parentTag=='')
				tagcontain.parentTag=null;

			connection.query('INSERT INTO tag SET ?', tagcontain, function(err, result) {
			if(!err){

			}
			else{
				console.log(err);
			}
			});
		}



		callback();
	}

	],
	function(err) {
			console.log('success');
			res.end();

	});

});


router.post("/deletetag",function(req,res){
	var tag=req.body.tag;
	console.log("tag:"+tag);
	var selectresult=true;
	var splittag=new Array();

	async.series([
		function hehe(callback){
			connection.query('SELECT  * from posting  WHERE courseId="'+req.session.courseid+'"AND tag LIKE "%'+tag+'%"', function(err, rows, fields){
				if(!err){
							for(i in rows){
								splittag=rows[i].tag.split(',');
								for(j in splittag){
									if(splittag[j]==tag){
										selectresult=false;
									}
								}
							}

							callback();
						}
						else{
							console.log(err);
							res.end();
						}
			});
		}

	],
	function(err) {
		if(selectresult==true){
			connection.query('DELETE  from tag  WHERE courseid="'+req.session.courseid+'" AND tag="'+tag+'"', function(err, rows, fields){
				if(!err){
					res.send('success');
				}
				else{
					console.log(err);
					res.end();
				}
			});
		}
		else{
			res.send('這個tag有文章在使用 不能刪除');
		}
	});


});

router.post("/valuetagsearch",function(req,res){

	var textarray=req.body.textarray;
	var searcharray=req.body.searcharray;
	console.log(searcharray);
	console.log(textarray);
	var parentid=new Array();
	var countparent=0;
	var sqlselect="";
	var posttag=new Array();
	var finalrows=new Object();
	var finalpretest=new Object();
	async.series([
		function hehe(callback){

			for(i in textarray){
				if(textarray[i].parentid=='')
					textarray[i].parentid=null;
			}
			for(var i = 0 ; i<searcharray.length;i++){
				if(searcharray[i]!=""){
					if(i==0){
						sqlselect='tag LIKE "%'+searcharray[0]+'%"';
						posttag.push(searcharray[0]);
					}
					else{
						sqlselect+=' OR tag LIKE "%'+searcharray[i]+'%"';
						posttag.push(searcharray[i]);
					}
					for(j in textarray){
						if(searcharray[i]==textarray[j].tag){

							parentid[countparent]=textarray[j].id;
							countparent++;
						}

					}

				}

			}
			for(var i = 0 ;i<countparent;i++){
				for(j in textarray){
					if(parentid[i]==textarray[j].parentid){
						sqlselect+=' OR tag LIKE "%'+textarray[j].tag+'%"';
						posttag.push(textarray[j].tag);
						parentid[countparent]=textarray[j].id;
						countparent++;
					}
				}
			}



			callback();
		},
		function hehe(callback){

			connection.query('SELECT  * from pretest  WHERE courseId="'+req.session.courseid+'" AND ('+sqlselect+')', function(err, rows, fields){
						if(!err){
							console.log(rows);
							var jump=true;
							count=1;
							for(i in rows){
								var splittag=rows[i].tag.split(',');
									for(k in posttag){
										for(j in splittag){
											if(splittag[j]==posttag[k]){
												console.log(rows[i].Id);
												finalpretest[count]=rows[i];
												count++;
												jump=false;
												break;

											}

										}
										if(jump==false){
												jump=true;
												break;

										}
									}

							}

							req.session.pretestresult=finalpretest;
							console.log(req.session);
							callback();
						}
						else{
							console.log(err);
							callback();
						}
					});


		}
	],
	function(err) {
			console.log(sqlselect);
			console.log(posttag);
			console.log('success');
			console.log("this is result");
			connection.query('SELECT  * from posting  WHERE courseId="'+req.session.courseid+'" AND ('+sqlselect+')', function(err, rows, fields){
						if(!err){
							console.log(rows);
							var jump=true;
							count=0;
							for(i in rows){
								var splittag=rows[i].tag.split(',');
								/*
								var countp=0;
								for(j in splittag){
									for(k in posttag){
										if(splittag[j]==posttag[k]){
											countp++;
										}
									}
									if(countp>=posttag.length){
										finalrows[count]=rows[i];
										count++;
									}

								}
								*/
									for(k in posttag){
										for(j in splittag){
											if(splittag[j]==posttag[k]){
												console.log(rows[i].Id);
												finalrows[count]=rows[i];
												count++;
												jump=false;
												break;

											}

										}
										if(jump==false){
												jump=true;
												break;

										}
									}

							}

							req.session.postresult=finalrows;
							console.log(req.session);
							res.end();
						}
						else{
							console.log(err);
							res.end();
						}
					});



	});
});

router.post("/addtag",function(req,res){
	var tagcontain=new Object();
	var tag=req.body.tag;
	console.log(tag);
	tagcontain.courseid=req.session.courseid;
	var d=new Date();
	var mon=d.getMonth()+1;
	var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	tagcontain.date=now;
	tagcontain.parentTag=null;

	async.series([
		function hehe(callback){
			var insert=tag.split(',');
			for(var i=0;i<insert.length-1;i++){
				tagcontain.tag=insert[i];
				connection.query('INSERT INTO tag SET ?', tagcontain, function(err, result) {
					if(!err){

					}
					else{

						console.log(err);

					}
				});
			}
			callback();
		}
	],
	function(err) {
			console.log('success');
			res.end();

	});

	res.end();


});


router.post('/updatepost',upload.array(),function(req,res){//編輯文章
	/*資料範例
	var po= new Object();
	po.courseId=200;
	po.departmentId=11;
	po.Owner='DDD';
	po.type='問題';
	po.content='<H1>123</H1>';
	po.like=0;
	po.date='2016-01-01 12:12:21';
	po.code="<script></script>";
	*/
	//發文DATA
	var postcontain=new Object();

	var r;

	postcontain.type=req.body.type;
	postcontain.tag=req.body.tag; //samchange1
	//console.log('tagggg'+req.body.w);
	var w=req.body.w;
	console.log('tagggg'+w);
	if(req.body.content!=null)
		postcontain.content=req.body.content;

	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	postcontain.date=now;
	if(req.body.title!="")
		postcontain.title=req.body.title;
	else
		postcontain.title="";

	if(req.body.youtubeLink!=undefined)
		postcontain.youtubeLink=req.body.youtubeLink;
	if(req.body.code!=undefined)
		postcontain.code=req.body.code;

	//console.log(postcontain);
	//INSERT 發文資料
	async.series([
	function hehe(callback){
		connection.query('UPDATE posting SET ? where id = "'+req.body.Id+'" ', postcontain,function(err, result) {
		//connection.query('UPDATE posting SET type = "'+postcontain.type+'" , tag = "'+postcontain.tag+'" , content = "'+postcontain.content+'" , title = "'+postcontain.title+'" , youtubeLink = "'+postcontain.youtubeLink+'" , code = "'+postcontain.code+'" where id = "'+postcontain.Id+'" ', function(err, result) {
			if(!err){
				//console.log("使用者",postcontain.Owner, "發了一篇文章，在",postcontain.date);
				callback();
			}
			else{
				console.log(err);
				console.log("使用者ffffffffffffffffffffffffffffff");
				callback();

			}

		});

	},
	function hehe(callback){
		connection.query('SELECT  * from posting where id = "'+req.body.Id+'"',function(err, rows, fields) {
		//connection.query('UPDATE posting SET type = "'+postcontain.type+'" , tag = "'+postcontain.tag+'" , content = "'+postcontain.content+'" , title = "'+postcontain.title+'" , youtubeLink = "'+postcontain.youtubeLink+'" , code = "'+postcontain.code+'" where id = "'+postcontain.Id+'" ', function(err, result) {
			if(!err){
				//console.log("使用者",postcontain.Owner, "發了一篇文章，在",postcontain.date);
				r=rows;
				console.log('cv'+r);
				callback();
			}
			else{
				console.log(err);
				console.log("使用者ffffffffffffffffffffffffffffff");
				callback();

			}

		});
	}


	],
	function(err) {
		console.log(w);
		if(w!=''){
			var insert=w.split(',');
			var tagcontain=new Object();


			tagcontain.courseid=req.session.courseid;
			var d=new Date();
			var mon=d.getMonth()+1;
			var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
			tagcontain.date=now;
			tagcontain.parentTag=null;

			for(var i=0;i<insert.length-1;i++){
				tagcontain.tag=insert[i];
				connection.query('INSERT INTO tag SET ?', tagcontain, function(err, result) {
					if(!err){

					}
					else{

						console.log(err);

					}
				});
			}
			res.send(r);
		}
		else{
			res.send(r);
		}
	});
});





router.post('/reportpost',upload.array(),function(req,res){//編輯文章

	var postcontain=new Object();



	postcontain.postid=req.body.Id;
	postcontain.Owner=req.body.Owner;

	postcontain.tag=req.body.tag; //samchange1
	//console.log('tagggg'+req.body.w);

	postcontain.reporter=req.session.passport.user;
	if(req.body.content!=null)
		postcontain.content=req.body.content;

	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	postcontain.date=now;
	if(req.body.title!="")
		postcontain.title=req.body.title;
	else
		postcontain.title="";

	if(req.body.youtubeLink!=undefined)
		postcontain.youtube=req.body.youtubeLink;
	if(req.body.code!=undefined)
		postcontain.code=req.body.code;
	postcontain.courseid=req.body.courseId;
	postcontain.img=req.body.imglist;
	console.log(postcontain);
	res.end();
	//INSERT 發文資料


		connection.query('INSERT postreport SET ? ', postcontain,function(err, result) {

			if(!err){
				res.end();
			}
			else{
				console.log(err);
				res.end()
			}

		});



});

//samchanege2
router.post('/getyourpostid/',function(req,res){//讀取文章資料
	console.log(req.session);
	var sql='SELECT Id from posting  WHERE Owner="'+req.session.passport.user+'"';

	var postid=new Array();
	connection.query(sql, function(err, rows, fields){
		if(!err){

			if(rows.length>0){

				for(i in rows){
					postid.push(rows[i].Id)
				}

				req.session.postid=postid;

			}
			else{
				var a=new Array();
				a.push('sss');
				req.session.postid=a;
			}

			res.end();
		}
		else{
			console.log(sql);
			console.log(err);
			console.log("getpost error");
		}

	});
});


router.post('/getyourcommentid/',function(req,res){//讀取文章資料

	var sql='SELECT postId from comment  WHERE owner="'+req.session.passport.user+'"';
	var commentid=new Array();
	var repeat=false;
	connection.query(sql, function(err, rows, fields){
		if(!err){



			if(rows.length>0){
				commentid.push(rows[0].postId);
				for(i in rows){
					repeat=false;
					for(j=0;j<rows.length;j++){
						if(commentid[j]==rows[i].postId){
							repeat=true;
							break;
						}
					}
					if(repeat==false)
						commentid.push(rows[i].postId);

				}
				req.session.commentid=commentid;
			}
			else{
				var a=new Array();
				a.push('sss');

				req.session.commentid=a;
			}


			res.end();
		}
		else{
			console.log(sql);
			console.log(err);
			console.log("getpost error");
		}

	});


});



router.post('/retursessioncommentid/',function(req,res){//讀取文章資料

	res.send(req.session.commentid);
});




router.post('/retursessionpostid/',function(req,res){//讀取文章資料

	res.send(req.session.postid);
});

/*
router.post('/getposttitle/',function(req,res){//讀取文章資料
	var type=req.body.type;
	var postid=req.body.postid;
	var courseid=req.body.courseid;
	var msg;
	var back=new Object();
	var checkid=new Array();
	var check=true;
	async.series([
		function hehe(callback){
			var sql='SELECT postid FROM notice WHERE user="'+req.session.passport.user+'"';
			connection.query(sql, function(err, rows, fields){
				if(!err){
					for(i in rows){
						checkid.push(rows[i].postid);
					}
					callback();
				}
				else{

					callback();
				}

			});
		},
		function hehe(callback){

			for(i in checkid){
				if(postid==checkid[i]){
					check=false;
					break;
				}
			}


				var sql='SELECT posting.title,class.Classname from posting , class WHERE posting.Id="'+postid+'" AND class.Class="'+courseid+'"';
				connection.query(sql, function(err, rows, fields){
					if(!err){
						console.log("I AM HERE BITCH!!!!!!!!!!!!!!!!!!!!!!!!");
						console.log(rows);
						if(type=='p'){
							msg='你在 ['+rows[0].Classname+'] 發的文章 '+rows[0].title+' 有人留言咯~';
						}
						else if(type=='c'){
							msg='你在 ['+rows[0].Classname+'] 發的留言 '+rows[0].title+' 有人回复咯~';
						}
						callback();
					}
					else{
						console.log(err);
						callback();
					}

				});

		}
		,
		function hehe(callback){
			var notice=new Object();
			notice.user=req.session.passport.user;
			notice.msg=msg;
			notice.postid=postid;
			if(check==false){
				connection.query('DELETE from notice WHERE postid="'+postid+'"', function(err, result) {
					if(!err){

					}
					else{

					}

				});
			}

			connection.query('INSERT INTO notice SET ?', notice, function(err, result) {
				if(!err){
					callback()
				}
				else{
					callback();
				}

			});
		}

	],
	function(err) {
		back.postid=postid;
		back.msg=msg;
			console.log(back);
			res.send(back);

	});


})
*/
router.post('/shownotice/',function(req,res){//讀取文章資料
	var sql='SELECT * FROM notice where user="'+req.session.passport.user+'"';
			connection.query(sql, function(err, rows, fields){
				if(!err){
					res.send(rows)
				}
				else{

					console.log(err);
					res.end();

				}

			});

});


router.post('/deletenotice/',function(req,res){//讀取文章資料
	connection.query('DELETE from notice WHERE postid="'+req.body.postid+'"', function(err, result) {
		if(!err){
			res.end();
		}
		else{
			res.end();
		}
	});

});
module.exports = [router, io_Chatroom];

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
var config = require("../lib/config.js");
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

var room;
function startConnection(socket){
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

router.post('/setsession', upload.array(),function(req, res , next){
	var classid=req.body.classid;
	req.session.courseid=classid;
	var departmentid=req.body.departmentid;
	req.session.departmentid=departmentid;
	console.log(req.session);
	res.end();
});

router.get('/course/', function(req, res, next) {
	if(!req.session.username&&!req.session.courseid&&!req.session.departmentid)
	{	console.log("沒有SESSION",req.session);
		res.redirect('http://localhost:3000/routes');}
	else{
		req.session.reload(function(err) {})
  // session updated
		console.log("有SESSION",req.session);
		res.render('./views/index2', {courseid:req.session.courseid,user:req.session.username,url:config.url});
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
	var d=new Date();
    var mon=d.getMonth()+1;
    var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
	commentcontain.cdate=now;
	connection.query('INSERT INTO comment SET ?', commentcontain, function(err, result) {
		if(!err){
			commentcontain.Id=result.insertId;
			res.send(commentcontain);
			res.end();

		}
		else{
			console.log(err);
			console.log(' 新增comment失敗');
		}

	});
	console.log("posid",postid,"有一個新回覆:");
	console.log(commentcontain);

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

	var sql='SELECT  * from posting  WHERE courseId="'+req.session.courseid+'" AND Id="'+req.body.postid+'"';


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
	console.log(postcontain);
	//INSERT 發文資料
	connection.query('INSERT INTO posting SET ?', postcontain, function(err, result) {
		if(!err){
			console.log("使用者",postcontain.Owner, "發了一篇文章，在",postcontain.date);
			res.status("200").end();
		}
		else
			console.log(err);

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




	router.post("/valuetagsearch",function(req,res){



		var tag=req.body.tag;

		console.log("88888"+tag);
		res.end();
		/*
			connection.query('SELECT  * from tag  WHERE courseid="'+req.session.courseid+'" AND id = "'+tag+'"', function(err, rows, fields){
				try{
					truetag[counttag]=tag;
					if(rows[0].child==null){
						cc(tag);
					}
				}
				catch(err){
					console.log(err);
					res.end();
				}
				finally {
					console.log("aaaaaaaaaaabbbbbbbbbbbbbccccccccccccccc");
					res.send(rows);
				}
			});

		*/

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
});/*
router.post('/score/confirm',function(req,res){
	var sql="SELECT scorepost from users where id='"+req.session.passport.user+"'";
	connection.query(sql,function(err,result){
		if(!err){
			res.send(result).end();
		}
		else{
			console.log(err);
		}
	});
});
router.post('/score/insert',function(req,res){
	var exist=req.body.exist;
	var postid=req.body.postid;
	var postid2=req.body.postid+"|"
	var type=req.body.type;
	var value;
	var value2;
	if(type=="nice"){
		value="1";
		value2="1|";
	}
	else if(type=="bad"){
		value="0";
		value2="0|";
	}
	if (exist=="-1"){
		var sql1="UPDATE users SET scorepost =CONCAT(scorepost,'"+postid2+"'), scorevalue=CONCAT(scorevalue,'"+value2+"') \
		WHERE id='"+req.session.passport.user+"'";
		var sql2="UPDATE posting SET nice = nice +1 WHERE Id='"+postid+"'";

		connection.query(sql1,function(err,result){
		if(!err){console.log(result)}else{console.log(err);}
		});


		connection.query(sql2,function(err,result){
		if(!err){console.log(result)}else{console.log(err);}
		});

	}else{
		var sql1="SELECT scorepost,scorevalue FROM users WHERE id='"+req.session.passport.user+"'";
		connection.query(sql1,function(err,result){
			if(!err){
				var sqlpost=result[0].scorepost.split('|');
				var sqlvalue=result[0].scorevalue.split('|');
				var index=sqlpost.indexOf(postid);
				var ifvalue=sqlvalue[index];

				if(ifvalue!=value){
					sqlvalue[index]=value;
					var rewritesqlvalue=sqlvalue.join("|");
					console.log("SQLVALUE",rewritesqlvalue);
					var sql="UPDATE users SET scorevalue='"+rewritesqlvalue+"' WHERE id='"+req.session.passport.user+"'";
					connection.query(sql,function(err,result){
						if(err){
							throw err;
						}
					});
					if(value=="1")
						sql="UPDATE posting SET nice = nice+1,bad = bad-1 WHERE id='"+postid+"'";
					else if(value=="0")
						sql="UPDATE posting SET nice = nice-1,bad = bad+1 WHERE id='"+postid+"'";
						connection.query(sql,function(err,result){
						console.log(sql);
						if(err){
							throw err;
						}else{
							console.log("成功+1-1");
							res.end();
						}
					});
				}

			}
			else{console.log(err);}

		});
	}


});
*/

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
	var sql='delete from posting where Id=" ' +id+ '"' ;
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
module.exports = [router, io_Chatroom];

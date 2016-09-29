var express = require('express');
var router = express.Router();
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
require('socket.io');
/* GET home page. */
var onlineCount=0;

var io_Chatroom = {
    io: null,
    startConnection:startConnection
};


function startConnection(socket){
  onlineCount++;
  socket.emit('someone_login',{'number':onlineCount});
  console.log('有人加入了聊天室');
  console.log('目前在線人數: '+onlineCount);

  //When user disconnect
  socket.on('disconnect', function() {
    onlineCount--;
    socket.broadcast.emit('someone_logout',{'number':onlineCount});
    console.log('有人退出了聊天室');
    console.log('目前在線人數: ' + onlineCount);
  });

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

}

router.get('/', function(req, res, next) {
    res.render('./views/index2', { title: '聊天室' });
    console.log("SESSION");
   	var a = req.session;
   	for(te in a ){
   	console.log(te);
   	}

});


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

		console.log(file);
		file.name=num+"."+type;
		file.path=path.join(__dirname, '../public/video/'+file.name);
		num++;

		console.log(file);
	});
	res.end(num.toString());

});

router.post('/upload2',function(req,res){
	var form=new formidable.IncomingForm();
	form.on('fileBegin', function(type, file) {
		file.name=num+"."+type;
		file.path=path.join(__dirname, '../public/images/'+file.name);
		num++;
	});
	form.parse(req,function(err,fields,files){
		//res.writeHead(20,{'content-type':'text/plain','charset':'utf-8'});
		//res.write("上傳"+files.name+"成功");
		//res.end(util.inspect({fields: fields, files: files}))
		//console.log(fields); -->{}
		//file 內容console.log(files);
	});

	res.end(num.toString());

});
//////////////////
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
		file.path=path.join(__dirname, '../public/pretest/'+file.name);
	});

	form.parse(req,function(err,fields,files){
		//console.log("fields:",fields.file);
		filelist+="]";
		res.json(filelist);
		console.log(filelist);


	});

});
router.get('/pretestdownload',function(req,res){
	res.download('./public/pretest/'+req.query.fn);
});
module.exports = [router, io_Chatroom];

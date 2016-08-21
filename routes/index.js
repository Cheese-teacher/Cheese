var express = require('express');
var router = express.Router();
var formidable=require('formidable');
var path=require('path');
var util=require('util');
var url = require('url');
/* GET home page. */
var num=0;

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
module.exports = router;

var express = require('express');
var router2 = express.Router();
var models = require("../../lib/models");
var mysql = require('mysql');
var LZString = require('lz-string');
var S = require('string');
var config = require("../../lib/config.js");
var db_option = {
    host: 'localhost',
    user: 'admin',
    password: 'admin',
    database:'hackmd',
    port: 3306
};

var path=require('path');
router2.get('/', function(req, res, next) {
    var connection = mysql.createConnection(db_option);
    var query ='SELECT notes.id,notes.content,users.profile FROM hackmd.users,hackmd.notes where users.id=notes.ownerId';
    connection.query(query, function(err, rows ,fields){
        if(!err){
			console.log(rows);
		}
        var data = rows;
        var notestring=new Array();
        var profile=new Array();
        var content=new Array();
        for(var i=0;i<data.length;i++){
            notestring[i] = LZString.compressToBase64(data[i].id);
            profile[i] = models.User.parseProfile(data[i].profile);
            content[i] = LZString.decompressFromBase64(data[i].content);
        }
        var url = config.urlpath;
        res.render('./views/hotnote', { title: '筆記區',
                                     notestring:notestring,
                                     data:data,
                                     content:content,
                                     profile: profile ,
                                     url:url
        });
    });
});

//viewCount sort
router2.post('/viewCount', function(req, res) {
    //res.send("QQ");

    var connection = mysql.createConnection(db_option);
    var query ='SELECT notes.id,notes.content,users.profile,notes.viewcount FROM hackmd.users,hackmd.notes where users.id=notes.ownerId order by viewcount desc';
    connection.query(query, function(err, rows ,fields){
        if(!err){
			console.log(rows);
		}
        var data = rows;
        var notestring = new Array();
        var profile = new Array();
        var content = new Array();
        for(var i = 0; i < data.length; i++){
            notestring[i] = LZString.compressToBase64(data[i].id);
            profile[i] = models.User.parseProfile(data[i].profile);
            content[i] = LZString.decompressFromBase64(data[i].content);
        }
        var obj = {
            notestring:notestring,
            data:data,
            content:content,
            profile:profile
        };
        res.send(obj);
    });

});
module.exports = router2;

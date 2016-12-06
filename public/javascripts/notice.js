var yourpost=new Array();
var yourcomment;
var socket = io('/Chatroom');
var courseid;
$(function (){
	
	
	socket.on('insertcomment',function(data,postid,courseids){
		courseid=courseids;
		console.log(courseids);
		createcomment(data,"special");
		console.log("hihihihihi");
		checknotice(data,postid,courseids);
		
	});
});
function leaveroom(){
		alert('leave');
		socket.emit('disconnect');
	
}

function yourpostandcomment(){
	
	 $.ajax({
		url:'/routes/getyourpostid',
		type:"post",
		async:false,
		success :function(data){
			
		},
		error:function(data){
			console.log("F");
            console.log(data);
			d="資料讀取錯誤，請重新操作";
		}
	  });
	  
	  $.ajax({
		url:'/routes/getyourcommentid',
		type:"post",
		async:false,
		success :function(data){
			
		},
		error:function(data){
			console.log("F");
			d="資料讀取錯誤，請重新操作";
		}
	  });
	
}

function retursessionpostid(){
	
	$.ajax({
		url:'/routes/retursessionpostid',
		type:"post",
		async:false,
		success :function(data){
			console.log(yourpost);
		},
		error:function(data){
			console.log("F");
			d="資料讀取錯誤，請重新操作";
		}
	  });
	  
}


function retursessioncommentid(){
	
	  $.ajax({
		url:'/routes/retursessioncommentid',
		type:"post",
		async:false,
		success :function(data){
			yourcomment=data;
			console.log(yourcomment);
		},
		error:function(data){
			console.log("F");
			d="資料讀取錯誤，請重新操作";
		}
	  });
	  
};

function checknotice(d,postid,courseid){
	
	
	var type="no";
	for(i in yourcomment){
		if(postid==yourcomment[i]){
			type='c';
		}
	}
	
	for(i in yourpost){
		if(postid==yourpost[i]){
			type='p';
		}
	}
	
	if(type!="no")
		shownotice();
	/*
	console.log(postid);
	console.log(yourpost);
	console.log(type);
	if(type!="no"){
		$.ajax({
			url:'/routes/getposttitle',
			data:{postid:postid,courseid:courseid,type:type},
			type:"post",
			async:false,
			success :function(data){
				console.log(d);
				$('#so'+postid).remove();
				var p='<p id="so'+postid+'" onclick="opennotice(\''+postid+'\')">'+data.msg+'<p>'
				$('#notice').prepend(p);
			},
			error:function(data){
				console.log("F");
				
			}
		  });
	}
	*/
}



function shownotice(){
	$('#notice').empty();
	$.ajax({
		url:'/routes/shownotice',
		type:"post",
		async:false,
		success :function(data){
			
			
			for(i in data){
				
				var p=$('<p id="so'+data[i].postid+'" onclick="opennotice(\''+data[i].postid+'\')">'+data[i].msg+'<p>');
				$('#notice').prepend(p);
			}
		},
		error:function(data){
			console.log("F");
				
		}
	 });
}

function opennotice(postid){
	console.log(postid);
	$('#posting-two-button-showdiv').modal("show");
	 var post=getpost(postid);//根據POSTID 取得POST 的內容
     var comment=getcomment(postid);//根據POST ID 取得COMMENT
     createfullpost(post,comment);//顯示POST 內容 和 COMMENT 內容 和增加VIEWCOUNT 數字
	 deletenotice(postid);
	// createcomment(d,"special");
	
}

function deletenotice(postid){
	$('#so'+postid).remove();
	$.ajax({
		url:'/routes/deletenotice',
		data:{postid:postid},
		type:"post",
		async:false,
		success :function(data){
			
		},
		error:function(data){
			console.log("F");
		}
	 });
	
}

function insertcomment(courseid,postid){        //新增留言
    document.getElementById('comm_previewimg_div').innerHTML=""; //先清空預覽圖片div
    var filelist=document.getElementById('comm_upload_img').files;//取得INPUT FILE 內容物

    if(!$('#comm_anonymous').val()){
      alert("暱稱不能為空白");
      return;
    }
    var anonymous=$('#comm_anonymous').val();
    var imglist="",code="";
    if($("#comm_code").val()){
        code=$("#comm_code").val();
        code=code.replace(/</g," &lt;");
        code=code.replace(/>/g," &gt;");
        code=code;
    }

    var comment = $("#comm_content").val();
     comment = comment.replace(/\n/g, "<br>");
    comment = comment.replace(/ /g, "&nbsp;");
	
	comment = comment.replace(/>/g," &gt;");
	comment = comment.replace(/</g," &lt;");
	
    if(filelist.length!=0){
        $.uploadcommentfile(filelist)
        for (var i =0;i<=filelist.length-1;i++){
                imglist+=filelist[i].name+",";
            }
    }
    if(comment){
        $.ajax({
        url: '/routes/insertcomment',
        data:   { data: comment, courseid:courseid, postid:postid, imglist:imglist, code:code,anonymous:anonymous},
        type : 'POST',
        async: false,
        success: function (result) {
            $("#comm_code").val("");
            $("#comm_content").val("");
            $("#comm_upload_img").val("");
            console.log("POSTID :",postid,"新增留言 :",result);
			yourcomment.push(postid);
			
            var d={
                Id:result.Id,
                anonymous:anonymous,
                content:comment,
                imglistc:imglist,
                code:code
              };
              var a=[];
              a.push(d);
              createcomment(a,"special");
			  socket.emit('insertcomment',a,postid,courseid);
			  
            }    
        });
    }
    

    return '';
}


function createcomment(comment,direct){
	
        for (var a =0;a<comment.length;a++){
        typesetting="<div class='comm b' id='c"+comment[a].Id+"' style='width:100%;' data-commid='"+comment[a].Id+"' >";
        //留言左邊

         typesetting+="<div class='comm_one '  style='display:inline-block'>";
         typesetting+="<div class='comm_one_pic '>";
         typesetting+='<div><i class="fa fa-caret-square-o-down" aria-hidden="true" style="font-size:18px;color:#64A7FE;position:relative;left:43px;top:35px" data-type="comm"></i></div>';
         typesetting+="</div>";
         //>new
        var percent1=(comment[a].nice/(comment[a].bad+comment[a].nice)).toFixed(2)*100;
        var percent2=(comment[a].bad/(comment[a].bad+comment[a].nice)).toFixed(2)*100;
        var nbvalue=comment[a].nice-comment[a].bad;
         typesetting+="<div class='comm_one_bar '>";
        if(isNaN(percent1)&&isNaN(percent2)){
         typesetting+="<div class='comm_one_green ' style='display:inline-block;width:50%;height:100%;background-color:#E1E1E1'></div>";
         typesetting+="<div class='comm_one_red ' style='display:inline-block;width:50%;height:100%;background-color:#E1E1E1'></div>";
        }else{
         typesetting+="<div class='comm_one_green ' style='display:inline-block;width:"+percent1+"%;height:100%;background-color:#3BFE5C'></div>";
         typesetting+="<div class='comm_one_red ' style='display:inline-block;width:"+percent2+"%;height:100%;background-color:#FE3B3B'></div>";
         }
         typesetting+="</div >";
         if(nbvalue>0)
           typesetting+="<div class='comm_score' style='color:#49AAFE'>+"+nbvalue+"</div>";
         else if(nbvalue<0)
           typesetting+="<div class='comm_score' style='color:#FE4949'>"+nbvalue+"</div>";
         else
              typesetting+="<div class='comm_score' >0</div>";
         typesetting+="<div class='comm_one_button'>";
         typesetting+='<i class="fa fa-smile-o" aria-hidden="true" style="height:20px;width:20px;margin-right:2px;font-size:14px" onclick="score('+comment[a].Id+',\'c\',\'nice\')"></i>';
         typesetting+='<i class="fa fa-frown-o" aria-hidden="true"  style="height:20px;width:20px;font-size:14px" onclick="score('+comment[a].Id+',\'c\',\'bad\')"></i>';


         typesetting+="</div></div>";
         //留言內容
         typesetting+="<div class='comm_two ' style='display:inline-block'>";
             typesetting+="<div  class='comm_two_anonymous ' style=''><span >"+comment[a].anonymous+" 說：</span></div>";
             typesetting+="<div  class='comm_two_content ' style=''><span >"+comment[a].content+"</span>";

             typesetting+="</div>";
             //留言圖片
             
         typesetting+="</div>";
         typesetting+="<div class='comm_three'>"
         
             if(comment[a].imglistc){
                var imglist=comment[a].imglistc.split(",");
                typesetting+="<div class='comm_three_pic'>";
                for(var b=0;b<imglist.length-1;b++){
                    typesetting+='<a class="single" href="/commentimages/'+imglist[b]+'">'
                    typesetting+="<img src='/commentimages/"+imglist[b]+"' style='width:100px ;height:100px ; '></a>";
                }
                typesetting+="</div>";
             }
             if(comment[a].code){
                
                typesetting+="<div class='comm_three_code'>";
                typesetting+="<pre  class='prettyprint linenums'>";
                typesetting+=comment[a].code;
                typesetting+="</pre>";
                typesetting+="</div>";
             }
         typesetting+="</div>";
        typesetting+="</div>";
        typesetting+="<hr/>";
        if(direct=="special")
          $("#comm_show_div").prepend(typesetting);
        else
          $("#comm_show_div").append(typesetting);
    }
};

function createfullpost(post,comment){
    $(".posting-showbox-one").html("");
    $(".posting-showbox-two").html("");
    console.log("createfullpost-post data",post);
    console.log("createfullpost-comment data",comment);
    var postid=post.Id;
    var $post=new Array();
    $post.push(post);
    createposting($post,"showbox");//把POSTINT 排版
    typesetting="<div>";
    typesetting+="<input type='text' placeholder='「暱稱」' id='comm_anonymous'>"
    typesetting+="<textarea id='comm_content' row='5' placeholder='回覆' onkeyup='autogrow(this);'></textarea>";
    typesetting+='<div role="tabpanel">';
  typesetting+='<ul class="nav nav-pills" role="tablist">';
    typesetting+='<li role="presentation" ><a href="#home" aria-controls="home" role="tab" data-toggle="pill" for="comm_upload_img"><img src="/images/img-ico.png" style="width:20px;height:20px;">圖片</a></li>';
    typesetting+='<li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="pill"><img src="/images/code-ico.png" style="width:20px; height:20px;">Code</a></li>';
    typesetting+='<li role="presentation"><a href="#messages" aria-controls="messages" role="tab" data-toggle="pill"><img src="/images/youtube-ico.png" style="width:20px;height:20px;">Youtube</a></li>';

  typesetting+='</ul>';


  typesetting+='<div class="tab-content">';
    typesetting+='<div role="tabpanel" class="tab-pane fade active" id="home">';
    typesetting+='<input type="file" id="comm_upload_img"  name="uploadfile" multiple="multiple"></div>';
    typesetting+='<div role="tabpanel" class="tab-pane fade" id="profile">';
    typesetting+='<textarea id="comm_code" cols="50"  placeholder="code留言" ></textarea></div>';
    typesetting+='<div role="tabpanel" class="tab-pane fade" id="messages">3</div>';

  typesetting+='</div>';

typesetting+='</div>';
    typesetting+="<div id='comm_previewimg_div'></div>";
    typesetting+='<input type="button"  value="send" onclick="insertcomment(\''+courseid+'\',\''+postid+'\')">';
    typesetting+="<hr/><div id='comm_show_div'></div>";

    $('.posting-showbox-two').append(typesetting);
    //COMMENT 排版
    createcomment(comment,"");

    //增加VIEWCOUNT
    addviewcount(postid);
    
};

function createposting (data,direct){
    console.log("POSTINT init data",data);
    var img;
    for (a in data){
        var date=new Date(data[a].date);
        var mon=date.getMonth()+1;
        var postdate=date.getFullYear()+"-"+mon+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        //>new
        var percent1=(data[a].nice/(data[a].bad+data[a].nice)).toFixed(2)*100;
        var percent2=(data[a].bad/(data[a].bad+data[a].nice)).toFixed(2)*100;

        if(isNaN(percent1)&&isNaN(percent2)){
            
        }else{
            x=percent1;
            y=percent2;
        }
        //<new
        var random=parseInt(360*Math.random());

        var tagarray=data[a].tag.split(",");
        if(direct=="showbox")
            var typesetting='<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel"></h4>';
        else
            var typesetting='<div class="grid-item  grid-width " id="p'+data[a].Id+'" data-postid="'+data[a].Id+'">';
             typesetting+='<div class="posting-one " style="width:100%" data-postid="'+data[a].Id+'">';
               typesetting+='<div class="posting-one-imgcontent ">';
                 
                if(data[a].ownerico!=undefined)
                  typesetting+='<div class="posting-one-img" style="background-image:url(\'/images/owner-ico'+data[a].ownerico+'.png\')">';
                else
                  typesetting+='<div class="posting-one-img ">';
               typesetting+='</div>';
               typesetting+='</div>';
               typesetting+='<div class="posting-one-type " >';
                 typesetting+='<div>';
                 typesetting+='<span style="font-family:Microsoft JhengHei;">'+data[a].anonymous+' 說:</span>';
                 typesetting+='</div>';
                 typesetting+='<div >';
                   typesetting+='<span class="posting-one-t">['+data[a].type+'] '+data[a].title+'</span>';

                 //藍色下拉選單 new2
                 typesetting+='<div style="display:inline-block;margin-left:10px;"><i class="fa fa-caret-square-o-down" aria-hidden="true" style="font-size:18px;color:#64A7FE" data-type="post"></i>';
                 typesetting+='<div class="posting-one-menu" ></div>';
                 typesetting+='</div>';
                 typesetting+='</div>';
                 typesetting+='<div>';
                   typesetting+='<span class="posting-one-date">'+postdate+'</span>';

                 typesetting+='</div>';
               typesetting+='</div>';
             typesetting+='</div>';
             typesetting+='<div class="posting-bar " style="width:100%">';
             typesetting+='<div class="posting-bar-bar" style="">';
             if(isNaN(percent1)&&isNaN(percent2)){
              typesetting+='<div class="posting-green" style="display:inline-block;background-color:#E1E1E1;height:5px;width:50%;"></div>';
              typesetting+='<div class="posting-red" style="display:inline-block;background-color:#E1E1E1;height:5px;width:50%;"></div>';
             }              
             else{
              typesetting+='<div class="posting-green" style="display:inline-block;background-color:#3BFE5C;height:5px;width:'+x+'%;"></div>';
              typesetting+='<div class="posting-red" style="display:inline-block;background-color:#FE3B3B;height:5px;width:'+y+'%;"></div>';
              }
             typesetting+='</div>';
             typesetting+='<div class="posting-bar-scroe" style="">';
             typesetting+='<i class="fa fa-smile-o" aria-hidden="true" style="height:30px;width:30px;font-size:20px" onclick="score('+data[a].Id+',\'p\',\'nice\')"></i>';
            typesetting+='<i class="fa fa-frown-o" aria-hidden="true" style="height:30px;width:30px;font-size:20px"onclick="score('+data[a].Id+',\'p\',\'bad\')"></i>';
             typesetting+='</div></div>';
             typesetting+='<div class="posting-two" data-postid="'+data[a].Id+'">';
             typesetting+='<div class="posting-two-tag">';
             for(var i=0;i<tagarray.length;i++){
              if(tagarray[i]==""){
                continue
              }else{
                typesetting+='<span>'+tagarray[i]+'</span>';
              }
             }
             typesetting+='</div>'
             if(direct=="showbox")
               typesetting+='<div class="posting-two-content" style="border-color:hsla('+random+',93%,75%,1);">'+data[a].content;
            else
               typesetting+='<div class="posting-two-content" style="border-color:hsla('+random+',93%,75%,1);">'+lesstext(data[a].content);
               typesetting+='</div>';
               typesetting+='<div class="posting-two-button">';
            if(direct=="showbox")
                 typesetting+='<input class="posting-two-showbutton" data-toggle="modal" data-target="#posting-two-button-showdiv" type="button" value="瀏覽完整內容" style="visibility: hidden;">';
            else{
              if(data[a]['coun']==undefined)
                typesetting+='<span class="posting-two-showbutton"  data-toggle="modal" data-target="#posting-two-button-showdiv">完整內容</span><span id="s'+data[a].Id+'" style="color:#A4A4A4;"> 0 則回覆</span>';
              else
                typesetting+='<span class="posting-two-showbutton"  data-toggle="modal" data-target="#posting-two-button-showdiv">完整內容</span><span id="s'+data[a].Id+'" style="color:#A4A4A4;"> '+data[a]['coun']+'則回覆</span>';
            }
                 
        if(data[a].imglist!==""){
          if(direct=="showbox")
            typesetting+="<img src='/images/img-ico.png' style='height:35px;width:35px;float:right' onclick='picshow($(this),1)' data-imglist='"+data[a].imglist+"' data-postid='"+data[a].Id+"'></img>";
          else
                 typesetting+="<img src='/images/img-ico.png' style='height:35px;width:35px;float:right' onclick='picshow($(this),0)' data-imglist='"+data[a].imglist+"' data-postid='"+data[a].Id+"'></img>";
        }
        if(data[a].code){
                 typesetting+="<img src='/images/code-ico.png' style='height:35px;width:35px;float:right' onclick='codeshow($(this))'></img>";
        }
        if(data[a].youtubeLink){
                 typesetting+="<img src='/images/youtube-ico.png' style='height:35px;width:35px;float:right' onclick='youtubeshow($(this))'></img>";
        }
               typesetting+='</div>';
             typesetting+='</div>';
              typesetting+='<div class="posting-three">';
                typesetting+='<div class="posting-three-pic" >';
                typesetting+='</div>';
                typesetting+='<div class="posting-three-code" style="display:none;width:100%" >';
        if(data[a].code){
                  typesetting+="<div style='margin:1% 0px 0px 0px;' >";
                    typesetting+="<pre  class='prettyprint linenums'>";
                    typesetting+=data[a].code;
                    typesetting+="</pre>";
                  typesetting+="</div>";
               }
                typesetting+='</div>';
              if(direct=="showbox")
                typesetting+='<div class="posting-three-youtube ">';
              else
                typesetting+='<div class="posting-three-youtube " hidden>';
              if (data[a].youtubeLink){
                 var link = data[a].youtubeLink.replace("watch?v=", "embed/");
                if(direct=="showbox")
                  typesetting+="<iframe height='100%' width='100%' src='" + link + "' frameborder='0' allowfullscreen ></iframe>";
                else
                 typesetting+="<iframe height='100%' width='100%' src='" + link + "' frameborder='0' allowfullscreen ></iframe>";
              }
              
                typesetting+='</div>';
             typesetting+='</div>';
        if(direct=="showbox")
             typesetting+='';
        else
           typesetting+='</div>';
        var $typesetting=$(typesetting);
        if(direct=="append"){
            //$('#divshow').append(typesetting);
            $grid.append($typesetting).masonry( 'appended', $typesetting );

        }
        else if(direct=="showbox"){
            $('.posting-showbox-one').append($typesetting);
        }
        else{
                    //$('#divshow').prepend(typesetting);
            $grid.append($typesetting).masonry( 'prepended', $typesetting );
        }

    }


};


function addviewcount(postid){
    $.ajax({
        url:"/routes/addviewcount",
        type:"post",
        data:{postid:postid},
        error:function(){
            console.log("addviewcount失敗");
        }
    });
}

function getpost(postid){//SELECT * from posting WHERE courseid=courseid AND Id=postid
  var d;
  $.ajax({
    url:'/routes/getpost',
    data:{postid:postid},
    type:"post",
    async:false,
    success :function(data){
        d=data[0];
    },
    error:function(data){
        console.log("F");
        d="資料讀取錯誤，請重新操作";
    }
  });
  return d;
};

function getcomment(postid){  //returncomment()
    var result;
    $.ajax({
    url: '/routes/showcomment',
    data:   { data: postid },
    type : 'POST',
    async: false,
    success: function (response) {
            result = response;
        }
    });
    return result;
    
}

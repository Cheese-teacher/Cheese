//初始化FUNCTION : init > createposting > lesstext
//新增POSTING FUNCTION: getpostId > uploadpost > $.uploadfile > youtubelink > codeshow
//查看POSTING FUNCTION: getpost> getcomment > createfullpost
//新增Comment FUNCTION: autogrow > insertcomment > createcomment
//posting上面的下拉選單:contextmenu>
//初始化-->-------------------------------
//11/29 新增logout按鈕
$('#Logout').on('click', function (){
    $.ajax({
    url: '/logout',
    type: 'GET',
    data: {
    },
    error: function(xhr) {
      alert('Ajax request 發生錯誤');
    },
    success: function(response) {
      window.location.href('/');
    }
  });
});
var init=function(courseid){//一進入討論區時的動作
    console.log('initing...');
    //先發ajax 取得登入壯態
    $.ajax({
        url: '/me',
        type: 'GET',
        error: function(xhr) {
          alert('Ajax request 發生錯誤');
        },
        success: function(response) {
            console.log(response);
            if (response.status == 'ok')
            {
                if (response.photo) $('.ui-avatar').prop('src', response.photo).show();
                else $('.ui-avatar').prop('src', '').hide();
                $('.ui-name').html(response.name);
            } else {
                //do nothing
            }
        }
    });
    initposting();
    live_init();
    pretest_init();
    userrecord("p");
    userrecord("c");


    createtime();
    createoption(courseid);
    createtag(gettag());
};
var courseid;
var numm = "";
var user_postrecord={};
var user_commrecord={};

function userrecord(type){
  $.ajax({
    url:'/routes/record',
    type:'post',
    data:{type:type},
    async:false,
    success:function(data){
      if(type=="p"){
        for(var a =0;a<data.length;a++){
          var tmp=data[a].Id.toString()
          user_postrecord[tmp]=[]
          user_postrecord[tmp].push(tmp) ;
        }
        console.log(user_postrecord);
      }else if(type=="c"){
        for(var a =0;a<data.length;a++){
          var tmp=data[a].Id.toString();
          user_commrecord[tmp]=tmp;
        }
      }
    },
    error:function(data){console.log("record error")}
  });
};
function changecourse(coursename,courseid,departmentid){
	alert(departmentid);

	document.cookie="selected="+coursename+";path=/";

	$.ajax({
		url: '/routes/setsession',
		data:   { classid : courseid,departmentid:departmentid},
		type : 'POST',
		async: false,
		success: function () {
			 window.location.reload();
		}

	});
}


function getcoursename(){

	var x = document.cookie;
	var splitcookie=x.split(";");

	for(var i in splitcookie){
		var isclassname=splitcookie[i].substring(1,10);
		var departmentid= splitcookie[i].substring(1,16);
		var selectedclass=splitcookie[i].substring(1,9);
		if(isclassname=="classname"){
			var classname=splitcookie[i].substring(11);
		}
		if(isclassname=="classnaid"){
			var classid=splitcookie[i].substring(11);
		}
		if(selectedclass=="selected"){
			var selected=splitcookie[i].substring(10);
		}
		if(departmentid=="classdepartment")
		{
			var department=splitcookie[i].substring(17);

		}
	}

	var splitclass=classname.split("|");
	var splitclassid=classid.split("|");
	var splitdepartment=department.split("|");
	var drop="";
	for(var i in splitclass){
		if(selected!=splitclass[i])
			drop+='<li><a onclick=changecourse(\'' + splitclass[i]+ '\',\'' + splitclassid[i]+ '\',\'' + splitdepartment[i]+ '\')>'+splitclass[i]+'</a></li>';
	}
	$('.dropdown-toggle').prepend(selected);
	$('.dropdown-menu').append(drop);



}

var $grid=$('.grid').masonry({
      itemSelector: '.grid-item'
    });
function abc(dom){
    dom.parents('.posting-two').siblings('.posting-three').find('.posting-three-code').show();
        $grid.masonry('layout');

}
function autogrow(textarea){             //自動調整textbox大小
    var adjustedHeight=textarea.clientHeight;
    adjustedHeight=Math.max(textarea.scrollHeight,adjustedHeight);
    if (adjustedHeight>textarea.clientHeight){
        textarea.style.height=adjustedHeight+'px';
    }
};
function gridlayout(){
    $grid.masonry('layout');
};

function deletecomment(id){
    $.ajax({
        url: '/routes/deletecomment',
        data:   { data: id},
        type : 'POST',
        async: false,
        success: function (result) {
            $('#commentpost'+id).remove();
        }
    });
}
function insertcomment(courseid,postid){        //新增留言
    document.getElementById('comm_previewimg_div').innerHTML=""; //先清空預覽圖片div
    var filelist=document.getElementById('comm_upload_img').files;//取得INPUT FILE 內容物
    var imglist="",code="";
    if($("#comm_code").val()){
        code=$("#comm_code").val();
        code=code.replace(/</g," &lt;");
        code=code.replace(/>/g," &gt;");
        code=code;
    }
    var comment = $("#comm_content").val();
    if(filelist.length!=0){
        $.uploadcommentfile(filelist)
        for (var i =0;i<=filelist.length-1;i++){
                imglist+=filelist[i].name+",";
            }
    }
    if(comment){
        $.ajax({
        url: '/routes/insertcomment',
        data:   { data: comment, courseid:courseid, postid:postid, imglist:imglist, code:code},
        type : 'POST',
        async: false,
        success: function (result) {
            $("#comm_code").val("");
            $("#comm_content").val("");
            $("#comm_upload_img").val("");
            console.log("POSTID :",postid,"新增留言 :",result);
            var d={
                Id:result.Id,
                content:comment,
                imglistc:imglist,
                code:code
              };
              var a=[];
              a.push(d);
              createcomment(a,"special");
            }
        });
    }


    return '';
}




//有時候$("#button").click(function) 沒反應
//可能是因為button 不是在載入網頁時就出現，而是經過後面一些程式碼才出現
//這種情況下用$(document.body).on('click'or'change', '#ID or.class', function (event){balalala}); 就可以了(**要放在$(function(){ 裡面)。


//img 排版----------------------------------------
function imglist(imglist){
    var typesetting="";
    typesetting+="<div style='background:#000684;margin:1% 0px 0px 0px;' >" ;
    var img;
    img=imglist.split(",");
    for (var b =0 ;b<img.length-1;b++){
        var type=img[b].substring(img[b].indexOf('.')+1);
        if(type=="pptx"){
            typesetting+="<a class='single' href='/images/" + img[b] + "'><img style='width:100px;height:90px;border:2px solid grey;margin:2px;' src='/images/powerpoint-ico.jpg' / ></a>";
        }
        else if(type=="docx"){
            typesetting+="<a class='single' href='/images/" + img[b] + "'><img style='width:100px;height:90px;border:2px solid grey;margin:2px;' src='/images/word-ico.png' / ></a>";
        }
        else{
            typesetting+="<a class='single' href='/images/" + img[b] + "'><img style='width:100px;height:90px;border:2px solid grey;margin:2px;' src='/images/" + img[b] + "' / ></a>";
        }

    }
    typesetting+="</div>";//end img
    return typesetting;
};
function picshow(dom){
    var div=dom.parents('.posting-two').siblings('.posting-three').find('.posting-three-pic');
    var postid=dom.data('postid');
    dom.prop("onclick","");
    var imglist=dom.data("imglist").split(",");
    var length=imglist.length;
    var html='<div id="carousel-example-generic'+postid+'" class="carousel slide" data-ride="carousel"><ol class="carousel-indicators">';
    for(var a =0;a<length-1;a++){
        if(a==0)
            html+='<li data-target="#carousel-example-generic" data-slide-to="'+a+'" class="active"></li>';
        else
            html+='<li data-target="#carousel-example-generic" data-slide-to="'+a+'" ></li>';
    }
  html+='</ol><div class="carousel-inner" role="listbox">';
  for(var a=0;a<length-1;a++){
    if(a==0)
        html+='<div class="item active">';
    else
        html+='<div class="item">';
    html+='<a class="single" href="/images/'+imglist[a]+'">';
      html+='<img src="/images/'+imglist[a]+'" >';
      html+='</a>';
      html+='<div class="carousel-caption">';
      html+='</div>';
    html+='</div>';
  }
  html+='</div>';
  if(length>2){
      html+='<a class="left carousel-control" href="#carousel-example-generic'+postid+'" role="button" data-slide="prev" >';

    html+='<span class="glyphicon glyphicon-chevron-left" aria-hidden="true"></span>';
    html+='<span class="sr-only">Previous</span>';
  html+='</a>';
  html+='<a class="right carousel-control" href="#carousel-example-generic'+postid+'" role="button" data-slide="next" >';
    html+='<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>';
    html+='<span class="sr-only">Next</span>';
  html+='</a>';
  }
html+='</div>';
html+='</div>';
    $(div).append(html);
setTimeout(function(){

    gridlayout();
},100);


};
//img 排版----------------------------------------
//code 排版-->------------------------------
function codeshow(dom){//CODE 的排版
    dom.parents('.posting-two').siblings('.posting-three').find('.posting-three-code').show();
    $grid.masonry('layout');

};
//code 排版<------------------------------------
//youtueb link 排版-->-------------------
var youtubeshow=function (dom) {
    dom.parents('.posting-two').siblings('.posting-three').find('.posting-three-youtube').show();
    $grid.masonry('layout');
};
//youtueb link<---------------------



function initposting(){
    $.ajax({
        url:"/routes/init/",
        type:"GET",
        success :function(data){

                createposting(data,"append");
        },
        error:function(data){
            console.log("fail",data);
        }
    });
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
        if(direct=="showbox")
            var typesetting='<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title" id="myModalLabel"></h4>';
        else
            var typesetting='<div class="grid-item a grid-width " id="p'+data[a].Id+'" data-postid="'+data[a].Id+'">';
             typesetting+='<div class="posting-one " style="width:100%" data-postid="'+data[a].Id+'">';
               typesetting+='<div class="posting-one-imgcontent ">';
                 typesetting+='<div class="posting-one-img "></div>';
               typesetting+='</div>';
               typesetting+='<div class="posting-one-type " >';
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
             //>new
             typesetting+='<div class="posting-bar " style="width:100%">';
             typesetting+='<div class="" style="width:86%; display:inline-block;">';
             //new2
             if(isNaN(percent1)&&isNaN(percent2)){
              typesetting+='<div class="posting-green" style="display:inline-block;background-color:#E1E1E1;height:5px;width:50%;"></div>';
              typesetting+='<div class="posting-red" style="display:inline-block;background-color:#E1E1E1;height:5px;width:50%;"></div>';
             }
             else{
              typesetting+='<div class="posting-green" style="display:inline-block;background-color:#3BFE5C;height:5px;width:'+x+'%;"></div>';
              typesetting+='<div class="posting-red" style="display:inline-block;background-color:#FE3B3B;height:5px;width:'+y+'%;"></div>';
              }
             typesetting+='</div>';
             typesetting+='<div class="" style="display:inline-block;width:14%">'
             typesetting+='<i class="fa fa-smile-o" aria-hidden="true" style="height:30px;width:30px;font-size:20px" onclick="score('+data[a].Id+',\'p\',\'nice\')"></i>';
            typesetting+='<i class="fa fa-frown-o" aria-hidden="true" style="height:30px;width:30px;font-size:20px"onclick="score('+data[a].Id+',\'p\',\'bad\')"></i>';
             typesetting+='</div></div>';
             //<new
             typesetting+='<div class="posting-two" data-postid="'+data[a].Id+'">';
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
                 typesetting+="<img src='/images/img-ico.png' style='height:35px;width:35px;float:right' onclick='picshow($(this))' data-imglist='"+data[a].imglist+"' data-postid='"+data[a].Id+"'></img>";
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

         //<new
         typesetting+="</div></div>";
         //留言內容
         typesetting+="<div class='comm_two ' style='display:inline-block'>";

             typesetting+="<div  class='comm_two_content ' style=''><span >"+comment[a].content+"</span>";

             typesetting+="</div>";
             //留言圖片

         typesetting+="</div>";
         typesetting+="<div class='comm_three'>"

             if(comment[a].imglistc){
                var imglist=comment[a].imglistc.split(",");
                typesetting+="<div class='comm_three_pic'>";
                for(var b=0;b<imglist.length-1;b++){
                    typesetting+='<a class="single" href="/commentimages/'+imglist[a]+'">'
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
function createtime (){
    var a=new Date();
    var h=a.getHours();
    var eh=h+3;
    $("#starttime").html(h);
    $("#endtime").html(eh);
    setInterval(pushplus,3000);
};
function pushplus(){
    if(parseInt($("#timebutton").css("left"))<510){
        var a=parseInt($("#timebutton").css("left"))+5;
        $("#timebutton").css("left",a);
    }

};

//以下都是(初始頁面的POSTING被按)時所用到的FUNCTION
//都是根據POST ID 然後讀取出 POST 內容/POST 回覆
//然後排版
//詳細POSTING的內容-->---------
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
//最得POSTING內容<------------------
//最得POSTING回覆-->----------------
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
//最得POSTING回覆<------------------

//顯示POSTING詳細 和 POSTING留言 的排版--->------------------
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
    typesetting+="<textarea id='comm_content' row='5' placeholder='回覆' onkeyup='autogrow(this);'></textarea>";
    typesetting+='<div role="tabpanel">';
  typesetting+='<ul class="nav nav-pills" role="tablist">';
    typesetting+='<li role="presentation" ><a href="#home" aria-controls="home" role="tab" data-toggle="pill" for="comm_upload_img"><img src="/images/img-ico.png" style="width:20px;height:20px;">圖片</a></li>';
    typesetting+='<li role="presentation"><a href="#profile" aria-controls="profile" role="tab" data-toggle="pill"><img src="/images/code-ico.png" style="width:20px; height:20px;">Code</a></li>';
    typesetting+='<li role="presentation"><a href="#messages" aria-controls="messages" role="tab" data-toggle="pill"><img src="/images/youtube-ico.png" style="width:20px;height:20px;">Youtube</a></li>';
    typesetting+='<li role="presentation"><a href="#settings" aria-controls="settings" role="tab" data-toggle="pill">Settings</a></li>';
  typesetting+='</ul>';


  typesetting+='<div class="tab-content">';
    typesetting+='<div role="tabpanel" class="tab-pane fade active" id="home">';
    typesetting+='<input type="file" id="comm_upload_img"  name="uploadfile" multiple="multiple"></div>';
    typesetting+='<div role="tabpanel" class="tab-pane fade" id="profile">';
    typesetting+='<textarea id="comm_code" cols="50"  placeholder="code留言" ></textarea></div>';
    typesetting+='<div role="tabpanel" class="tab-pane fade" id="messages">3</div>';
    typesetting+='<div role="tabpanel" class="tab-pane" id="settings">4</div>';
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


//發文時取得最新ID -->------------------------------
function getpostId(){
    var val;
    $.ajax({
        url:"/routes/getpostId/",
        type:"GET",
        async:false ,//設定為同步，這樣等SUCCESS做完，VAL=data[0].Id 才會有值，最後RETURN VAL回去
        success :function(data){
            val=data[0].Id;
        },
        error:function(data){
            console.log("[main.js] function getpostId 失敗");
        }
    });
    return val;
};
//發文時取得最新ID <------------------------------
//更多文章功能-->-------------------------
function moreposting(type,postid){
//new2>
    $.ajax({
        url:"/routes/more/",
        type:"POST",
        data:{type:type,postid:postid},
        success :function(data){
          if(data.length!=0){
            console.log("成功從伺服器取得morePOSTINT資料",data);
            createposting(data,"append");}
          else{
            $("#post_more").prop({"value":"已經全部顯示","disabled":"true"})
            }

        },
        error:function(data){
            console.log("fail",data);
        }
    });
//<new
}
//更多文章功能<---------------------------
//把發文資料insert 到sql 裡------------
function uploadpost(d){
    $.ajax({
        url:'/routes/uploadpost',
        data:d,
        type:'POST',
        success:function(data){
        },
        error:function(data){
            console.log("[main.js]function uploadpost 失敗");
        }
    });
};
//把發文資料insert 到sql 裡------------
//文章內容縮小-----------------------------
function lesstext (text){
    var lesstext,typesetting;
    if(text.length>249){
      lesstext=text.substring(0,249)+"...";
      typesetting="<span>"+lesstext+"</span><input type='button' class='lesstext_show' value='更多' style='color:black' > ";
      typesetting+="<span class='lesstext_hidden' hidden='hidden'>"+text+"</span>"
      return typesetting;
    }
    else{
      typesetting="<span>"+text+"</span>";
      return typesetting;
    }
}
//文章內容縮小-----------------------------
//上傳圖片之後 會在whichdiv 産生出一個小預覽圖--------------
function previewimg(eventfile,whichdiv){
    var filelist=eventfile;
    var div="#"+whichdiv;
    $(div).html("");
    for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i]
            var reader = new FileReader();
            reader.onload = function (event) {
                $(div).append('<img style="width:100px ;height:100px ; " src="' + event.target.result + '"/>');
            }
            reader.readAsDataURL(file);
        }
    return filelist;
};
//上傳圖片之後 會在whichdiv 産生出一個小預覽圖--------------
//取得當週增的TAG ---------
function createoption(courseid){
    $.ajax({
        url:'/routes/createoption',
        data:{courseid:courseid},
        type:'POST',
        success:function(data){
            addoption(data);//取得當週的TAG 加進去發文OPTION 裡面
        },
        error:function(data){
            console.log("[main.js]function addpotion 失敗");
        }
    });
}
//取得當週增的TAG ---------
//把當週的TAG 加進去發文OPTION 裡面------------------
function addoption(data){
    console.log("TAG.init",data);
    for(var a in data){
        var date=new Date(data[a].date);
        var mon=date.getMonth()+1;
        var d=date.getFullYear()+"-"+mon+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
        $("#tagshow").append("<p style='color:white'>"+d+" - "+data[a].tag+"</p>");
        $("#posttype").append($("<option></option>").attr("value",data[a].tag).text(data[a].tag));
    }
    //
}

function tagsearch(tag,child){
	alert(child);


	//if(child!=null){
		$.ajax({
			url:'/routes/valuetagsearch',
			data:   { tag : child},
			type:'POST',
			async:false,
			success:function(data){
				alert(data[0].id);
				//alert(data[0].childTag);
				//tagsearch(data[0].id,data[0].childTag);

			},
			error:function(data){console.log("main.js gettag function 出錯誤");}
		});
	//}
	/*
	else{

	}
*/
}

//把當週的TAG 加進去發文OPTION 裡面------------------
//取得該課程的所有TAG----------------
function gettag(){
    var a;
    $.ajax({
        url:'/pretest/get/tag',
        type:'POST',
        async:false,
        success:function(data){
            a=data;
        },
        error:function(data){console.log("main.js gettag function 出錯誤");}
    });
    return a;
};
//取得該課程的所有TAG----------------
//.tag 的排版----------------
function createtag(tag){
    var typesetting="";
    for (a in tag){
            typesetting+="<a class='tag_a' onclick='tagsearch(\"" + tag[a].id+ "\",\"" + tag[a].parentTag+ "\")'>"+tag[a].tag+"</a ><span style='color:white'> | </span>";
        }
    $('#tag').append(typesetting);
};
//.tag 的排版----------------
function tag_find(val){
    $.ajax({
        url:'/routes/find/tag',
        type:'post',
        data:{val:val},
        success:function(data){
            $("#divshow").html("");
            createposting (data,"append");//DIVSHOW 清空以後 把sql 抓出來的data重新印上divshow
        },
        error:function(data){console.log("tag_find 失敗");}
    });
}
function live_init(){
    $.ajax({
        url:'/routes/live/init',
        type:'get',
        success:function(data){
            console.log("live.init data",data);
            live_create(data);
        },
        error:function(data){
            console.log("live.init 失敗",data);
        }
    });

}
function live_insert(){
    var url=$('#live_input').val();
    var index=url.indexOf('/',9);
    var videoid=url.substring(index+1,url.length);
    $.ajax({
        url:'/routes/live/insert',
        type:'post',
        data:{'youtubeurl':videoid},
        success:function(data){
            location.reload();
        }
    });
}

function live_create(data){
    for(var a in data){
        var url="<iframe width='150' height='130' src='https://www.youtube.com/embed/"+data[a].youtubeurl+"' frameborder='0' allowfullscreen style='margin:0px 5px 0px 0px'></iframe>";
        $("#live_div").append(url);
    }

};
function pretest_init(){
    $.ajax({
        url:"/routes/pretest/init",
        type:"get",
        success:function(data){
            console.log("pretest.init",data);
            pretest_create(data);
        },
        error:function(data){
            console.log("pretest.init fail",data);
        }
    });
};
function pretest_create(data){
    var typesetting="";
    for(var a in data){
        var fn=data[a].filename;
        var ft=data[a].filetype;
        var pic="";

      typesetting+="<div class='pretest_abc' style=''>";//把一個考古題包起來的DIV

        if(ft!="jpg"&&ft!="JPG"&&ft!="JEPG"&&ft!="jpeg"&&ft!="png"&&ft!="PNG"&&ft!="gif"&&ft!="GIF"){
        typesetting+='<span class="pretest_a" style="">'+fn+'</span>'; //顯示檔名, 圖片不顯示檔名
        }


        if(ft=="docx"||ft=="DOCX"||ft=="doc"||ft=="DOC"){
            typesetting+="<a href='/pretest/pretestdownload?fn="+fn+"'>";
            typesetting+="<div class='pretest_b pretest_img1 pretest_hov'>";
            typesetting+="</div>";
                        typesetting+="</a>";

        }
        else if(ft=="pptx"||ft=="PPTX"){
            typesetting+="<a href='/pretest/pretestdownload?fn="+fn+"'>";
            typesetting+="<div class='pretest_b pretest_img2 pretest_hov'>";
            typesetting+="</div>";
            typesetting+="</a>";

        }
        else if(ft=="zip"||ft=="ZIP"){
            typesetting+="<a href='/pretest/pretestdownload?fn="+fn+"'>";
            typesetting+="<div class='pretest_b pretest_img3 pretest_hov'>";
            typesetting+="</div>";
            typesetting+="</a>";

        }
        else if(ft=="jpg"||ft=="JPG"||ft=="JEPG"||ft=="jpeg"||ft=="png"||ft=="PNG"||ft=="gif"||ft=="GIF"){
            pic=fn;
            typesetting+="<div class='pretest_b2 pretest_imgfunction' data-id="+data[a].id+">";
            typesetting+='<a class="single" href="/images/'+fn+'">';
            typesetting+="<img  class='' src='/images/"+pic+"' style='height:100%;width:100%' data-id="+data[a].id+"></a>";
            typesetting+='</div>';
            typesetting+='<div id="prehid_'+data[a].id+'" class="pretest_a pretest_hiddenfn pretest_imgfunction"><span>'+fn+'</span></div>';

        }
        else{
          pic='';
          typesetting+="<a href='/pretest/pretestdownload?fn="+fn+"'>";
          typesetting+="<div class='pretest_b pretest_img4 pretest_hov'>";
          typesetting+='</div>';
          typesetting+="</a>";


        }

        if(inthreeday(data[a].date)){
          typesetting+="<div class='pretest_c'>";
          typesetting+="<span style='color:#ffffff;'>&nbsp; NEW</span></div>";
        }

        typesetting+="</div>";

    }
    $("#pretest_div").append(typesetting);

};
function inthreeday(date){
  var now=new Date();
  var dd=new Date(date);
  var between=Math.floor((now-dd)/(1000*60*60*24));
  if(between<=2)
    return true;
  else
    return false;

}
//> new

function score(targetid,type,button){

  $.ajax({
    url:'/routes/score/commconfirm',
    type:'post',
    data:{targetid:targetid,type:type,value:button},
    success:function(data){
      if(data!="clicked"){
        if(data=="p"){
            var postd=getpost(targetid);
            //$(this).parents('posting-bar').css("background-color","#EA1414");
            var bar=$('#s'+targetid).parents(".grid-item").find(".posting-bar");
            var green=bar.find('.posting-green');
            var red=bar.find('.posting-red');
            var nice=postd.nice/(postd.nice+postd.bad).toFixed(2)*100;
            var bad=postd.bad/(postd.nice+postd.bad).toFixed(2)*100;
            var a,b;

            green.css({"background-color":"#3BFE5C","width":nice+"%"});
            red.css({"background-color":"#FE3B3B","width":bad+"%"});

        }else if(data=="c"){
            $.ajax({
              url: '/routes/getcommentbyid',
              data:   { data: targetid },
              type : 'POST',
              success: function (comment) {
                var green=$('#c'+targetid).find('.comm_one_green');
                var red=$('#c'+targetid).find('.comm_one_red');
                var nice =comment[0].nice/(comment[0].nice+comment[0].bad).toFixed(2)*100;
                var bad=comment[0].bad/(comment[0].nice+comment[0].bad).toFixed(2)*100;

                var mark=comment[0].nice-comment[0].bad;

                if(isNaN(mark))
                  mark=0;

                if(mark>0){
                  $('.comm_score').text("+"+mark).css("color","#49AAFE");
                  green.css({"background-color":"#3BFE5C","width":nice+"%"});
                  red.css({"background-color":"#FE3B3B","width":bad+"%"});
                }else if(mark<0){
                  $('.comm_score').text(mark).css("color","#FE4949");
                  green.css({"background-color":"#3BFE5C","width":nice+"%"});
                  red.css({"background-color":"#FE3B3B","width":bad+"%"});
                }else{
                  $('.comm_score').text("0").css("color","#E1E1E1");
                  green.css({"background-color":"#E1E1E1","width":"50%"});
                  red.css({"background-color":"#E1E1E1","width":"50%"});
                }


              }
            });
        }
      }
    },
    error:function(data){console.log(data);}
  });
}
function pt_change(dom){
  var dom2;
  var domelem=$(this);
  if(dom=="hotest"){
    dom2="newest";
    $("#"+dom+"-btn").prop("disabled","true");
    $("#"+dom2+"-btn").prop("disabled","");
    $("#post_more").data("type","hotest").prop({"value":"更多文章","disabled":""});
    $(".grid").html("");
    postingchange(dom);
  }else if(dom=="newest"){
    dom2="hotest";
    $("#"+dom+"-btn").prop("disabled","true");
    $("#"+dom2+"-btn").prop("disabled","");
    $("#post_more").data("type","newest").prop({"value":"更多文章","disabled":""});
    $(".grid").html("");
    postingchange(dom);
  }

}
function postingchange(type){
  $.ajax({
    url:"/routes/postchange",
    type:"post",
    data:{type:type},
    success:function(data){
      console.log(data);
      if(data.length!=0){
        createposting(data,"append");
        gridlayout();
      }
      else{
        var $typesetting="<div class='a' style='width:90%;height:10%'><p style='position:inherit;margin:15% 40%'>目前沒有熱門的文章哦</p></div>";
        $grid.append($typesetting).masonry( 'appended', $typesetting );
                gridlayout();
      }
    },
    error:function(data){console.log(data);}
  });
}
//< new

//jquerystart
$(function (){
    var socket = io('/Chatroom');
    courseid=$('#hidden_data').data("courseid");
//socketpart

/*join room 例子
    socket.emit('joinroom',{'data':courseid});//使用者進入網頁時 把SOCKET加進ROOM裡面 以課號來區分ROOM

    socket.on('joined',function(data){//當有其他使用者進入相同ROOM,會APPEND以下面的P
      $('.socketdiv').append("<p>使用者進入了ROOM:"+data.roomid+"</p>");
    });

    $('.socketbutton').click(function(){ //使用者發文時,告知SERVER 有發文
      socket.emit('c_send');
    });

    socket.on('s_send',function(data){  //SER 發出有其他使用者發文，作出相應動作顯示
      $('.socketdiv').append("<p>ROOM:"+data.data+"新文章</p>")
    });
join room 例子 */
    init(courseid);
	 getcoursename();   //samchange
    //當BOOTSTRAP 圖片輪播時 觸發MASONY 重新排版
    $(document.body).on('slid.bs.carousel', '#carousel-example-generic404',function () {
        gridlayout();
    })
    //在手機瀏覽時 文章以100%寛呈現
    if($(window).width()<720){
        $('#gridcss')[0].href="/stylesheets/grid2.css";
    }
    //在電腦瀏覽時 文章以40%寛呈現
    $(window).resize(function(){
        if($(window).width()<720){
          $('#gridcss')[0].href="/stylesheets/grid2.css";
        }
        else{$('#gridcss')[0].href="/stylesheets/grid1.css"}
    });
    //youtube API 載入

     $.contextMenu({

        selector: ".fa-caret-square-o-down",//被左鍵的對像
        trigger:"left",//觸發鍵:LEFT/RIGHT
        autoHide:"true",//滑鼠移開選單會動隱藏
        //選單內容
        items: {
          a:{
            name:"編輯",icon:"fa-caret-square-o-down",//選單text ico
            visible:function(key,opt){
              var type=$(this).data("type");
              //先判斷是post 的選單還是comm選單
              if(type=="post"){//post選單情況
                //抓出被點到的 posting id出來
                var id;
                if($(this).parents(".grid-item").data("postid")==undefined){
                  id=$(this).parents(".posting-one").data("postid").toString();
                }else{
                  id=$(this).parents(".grid-item").data("postid").toString();
                }
                //判斷 抓出來的id  使用者 == 發文者 ?
                if(typeof(user_postrecord[id])!="undefined")
                  return true;  //顯示 這個按鈕
                else
                  return false; //不顯示 這個按鈕
              }else if(type=="comm"){//comm選單情況
                //抓出被點到的comm id 出來
                var id=$(this).parents(".comm").data("commid").toString();
                //判斷commid  使用者==留言者?
                if(typeof(user_commrecord[id])!= undefined)
                  return true; //顯示 這個按鈕
                else
                  return false;//不顯示 這個按鈕
              }

            },
            callback:function(itemKey,opt){

            }
          },

          b:{
            name:"刪除",icon:"fa-caret-square-o-down",
            visible:function(key,opt){
              var type=$(this).data("type");
              if(type=="post"){
                var id;
                if($(this).parents(".grid-item").data("postid")==undefined){
                  id=$(this).parents(".posting-one").data("postid").toString();
                }else{
                  id=$(this).parents(".grid-item").data("postid").toString();
                }
                if(typeof(user_postrecord[id])!= "undefined")
                  return true;
                else
                  return false;
              }else if(type=="comm"){
                var id=$(this).parents(".comm").data("commid").toString();
                if(typeof(user_commrecord[id])!= undefined)
                  return true;
                else
                  return false;
              }
            },
            callback:function(itemKey,opt){
              var type=$(this).data('type');
              if(type=="post"){
                var id=$(this).parents(".grid-item").prop("id");
                $.ajax({
                  url:'/routes/delete/post',
                  type:"post",
                  data:{id:id},
                  success:function(data){
                     $grid.masonry( 'remove',$('#'+id))
                      .masonry('layout');
                  }
                });
              }else if(type=="comm"){
                var id=$(this).parents(".comm").data("commid");
                var th=$(this);
                $.ajax({
                  url:'/routes/deletecomment',
                  data:{data:id},
                  type:"post",
                  success:function(data){
                    th.parents(".comm").siblings("hr").first().fadeOut();
                    th.parents(".comm").fadeOut();

                  },
                  error:function(data){console.log("fail");}
                });
              }

            }
            },
          c:{
            name:"檢舉",icon:"fa-caret-square-o-down",
            visible:function(key,opt){
              return true;
              },
            callback:function(itemKey,opt){alert("a");}
          },

            }
        // there's more, have a look at the demos and docs...
    });



    //發文按鈕-->-----------------------------------------
    $("#sendtext").click(function (data) {
        //使用者輸入完的內容/上傳圖片/影片打包
        //資料用JSON 格式存起來 透過UPLOADPOST FUNCTION 用AJAX 傳給伺服器
        //限制條件: 沒內文不能上傳--OK
        //$("#new_post_div").css('opacity', 1).slideUp('slow').animate({ opacity: 0 },{ queue: false, duration: 'slow' });
        if(!$('#text').val())
        {
        return ;
        }
        //document.getElementById('divsend').innerHTML=""; //先清空div
        var message = $('#text').val();
        var type=$('#posttype').val();
        var links="";
        var title=$("#post-title").val();
        var filelist=document.getElementById('new_post_img').files;
        //日期整理
        var d=new Date();
        var mon=d.getMonth()+1;
        var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();

        message = message.replace(/\n/g, "<br>");
        message = message.replace(/  /g, "&nbsp;&nbsp;");

        var data={
            "departmentId":13,
            "courseId":courseid,
            "Owner":"",
            "type":type,
            "content":message,
            "date":now,
            "viewcount":0,
            "title":"",
            "anonymous":""
        };

        if(title){
            data.title=title;
        }
        if(filelist!=""){
            var imglist="";
            for (var i =0;i<=filelist.length-1;i++){
                imglist+=filelist[i].name+",";
            }

            data.imglist=imglist;
        }

        if($('#new_post_youtube_text').val()!=""){
            links=$('#new_post_youtube_text').val();
            data.youtubeLink=links;
        }
        if($('#code').val()!=""){
            //CODE 整理
            var code=$("#new_post_code").val();
            code=code.replace(/</g," &lt;");
            code=code.replace(/>/g," &gt;");
            data.code=code;
        }
        if($("#ano").prop('checked'))
            data.anonymous=$("#name2").val();

        uploadpost(data);//將發文全部資料傳給伺服器，讓資料.圖片.影片.CODE存入SQL

        if(filelist!=""){
            $.uploadfile(filelist);
        }
        var newestId=getpostId();//取得當前最新POSTID +1
        data.Id=newestId;
        var tmp=new Array();
        tmp.push(data);
        console.log("新增一筆發文")
        $('#divshow').prepend(createposting(tmp,"prepend"));

        $('#new_post_youtube_text').val("");
        $('#new_post_img').val("");
        $("#new_post_code").val("");

        window.scrollTo(0,0);

    });
    //發文按鈕<-------------------------------------------

    $("#timebutton").click(function(){
        var a=new Date();
        var h=a.getHours();
        var m=a.getMinutes();
        var d=new Date();
        var mon=d.getMonth()+1;
        var now=d.getFullYear()+"-"+mon+"-"+d.getDate()+" "+d.getHours()+":"+d.getMinutes()+":"+d.getSeconds();
        bootbox.dialog({
              message: "輸入TAG <br/> <input id='timetag' type='text'>",
              backdrop: false,
              buttons: {
                success: {
                  label: "Comfirm",
                  className: "btn-success",
                  callback: function() {
                    var time=h+":"+m;
                    var val=$("#timetag").val();
                    $("#tagshow").append("<p style='color:white'>"+time+" - "+val+"</p>");
                    $("#posttype").append($("<option></option>").attr("value",val).text(val));
                    $.ajax({
                        "url":"/routes/tag/insert",
                        "data":{tag:val,date:now},
                        "type":"post",
                        success:function(){
                        },
                        error:function(){
                            console.log("新增TAG失敗 mail.js $('#timebutton')");
                        }

                    });
                  }
                }
            }});
    });

    $('.tag_a').click(function(){
        var val=$(this).html();
        tag_find(val);
    });


/*
    socket.on('serversend', function (data) {
        $('#divshow').append('<p>' + data.name + ' : ' + data.message + '</p>');
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
    });
    socket.on('server_send_img', function (data) {
        $('#divshow').append('<div><p>' + data.name + ':</p><img src=./images/' + data.num + '.' + data.type + ' style=\'width=300px;height:100px;\'></img></div>');
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
    });
    socket.on('someone_login', function (data) {
        $("#onlinepeople").html("現在人數" + data.number);

    });
    socket.on('someone_logout', function (data) {
        $("#onlinepeople").html("現在人數" + data.number);
    });
        */
    //發文按鈕動作<------------------------------------------

    //上傳圖片預覽-->---------------------------------------------------------------------
    $("#new_post_img").change(function (event) {
        document.getElementById('new_post_preimg').innerHTML=""; //先清空div
        $("#new_post_preimg").css("display","block");
        //Filelist Object
        filelist = event.target.files;

        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i]
            var reader = new FileReader();
            reader.onload = function (event) {
                $('#new_post_preimg').append('<img class="new_post_pi" style="width:100px ;height:100px ; " src="' + event.target.result + '"/>');
            }
            reader.readAsDataURL(file);
        }
    });


    //上傳圖片預覽<-----------------------------------------------------
    //圖片按下後反應-->-----------------------------------------------------------
    $(".single").fancybox({
        helpers: {
            title: {
                type: 'float',
            }
        },
        padding: [5, 5, 5, 5],
    });
    //圖片按下後反應<-------------------------------------------------------------


    $.uploadfile = function (filelist) {
        var typesetting="";
        typesetting+='<div style="border:3px solid yellow;">';

        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i];
            var formData = new window.FormData();
            var fname=filelist[i]['name'];
            var ftype = filelist[i]['type'].substr((filelist[i]['type'].indexOf("/") + 1));
            formData.append(ftype, file);
            //將檔案加進FormData

            if (filelist[i]['type'] == 'image/jpeg' || filelist[i]['type'] == 'image/png' || filelist[i]['type'] == 'image/gif') {

                $.ajax({
                    url: '/routes/upload',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: false,
                    type: 'POST',
                    success: function (data) {

                        var name = $('#name').val();
                        socket.emit('client_send_img', {
                            'name': name,
                            'num': fname,
                            'type': ftype,
                        });
                        typesetting+='<a class=\'single\' href=\'../images/' + fname + '\'><img style="width:100px;height:90px;border:2px solid grey;margin:2px;" src="../images/' + fname + '" / ></a>';
                        //$('#divshow').append('<div><p>'+name+':</p></div><div   data-imgid='+imgnum+'.'+ftype+' style=\'background-image:url(./images/'+imgnum+'.'+ftype+');width:300px;height:100px\';></div>');

                    }
                });
            }
            else {
                $('#divshow').append('<div><p>這個檔案不是JPEG/PNG/GIF</p></div>');
            }
        }
        typesetting+="</div>";
        return typesetting;
    }



    $.uploadcommentfile = function (filelist) {  //和uploadfile基本一樣 只是改了url的路徑而已
        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i];
            var formData = new window.FormData();
            var fname=filelist[i]['name'];
            var ftype = filelist[i]['type'].substr((filelist[i]['type'].indexOf("/") + 1));
            formData.append(ftype, file);
            //將檔案加進FormData

            if (filelist[i]['type'] == 'image/jpeg' || filelist[i]['type'] == 'image/png' || filelist[i]['type'] == 'image/gif') {

                $.ajax({
                    url: '/routes/uploadc',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: false,
                    type: 'POST',
                    success: function (data) {
                    }
                });

            }
            else {
                $('#divshow').append('<div><p>這個檔案不是JPEG/PNG/GIF</p></div>');
            }
        }
        return "";

    }


    //圖片拖拉功能-------------------------------------------------------------------
    function drag(ev) {
        ev.preventDefault();
    }
    function drop(e) {

        e.preventDefault();//防止瀏覽器執行預設動作,預設是會把圖片打開,像PDF丢到CHROME裡
        filelist = e.originalEvent.dataTransfer.files;

        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i]
            // 建立一個物件，使用 Web APIs 的檔案讀取器(FileReader 物件) 來讀取使用者選取電腦中的檔案
            var reader = new FileReader();
            reader.readAsDataURL(file);
            // 事先定義好，當讀取成功後會觸發的事情
            reader.onload = function (event) {

                $('#divsend').append('<img class="new_post_pi"  style="width:100px ;height:100px ; " src="' + event.target.result + '"/>');
            }
            // 因為上面定義好讀取成功的事情，所以這裡可以放心讀取檔案


        }


    }

    $("#divshow").on('dragover', drag).on('drop', drop);
    $("#divsend").on('dragover', drag).on('drop', drop);
    ///////


    //考古題-->--------------------------------
    $("#pre-test-upload").change(function (event) {
        $("#pre-test-upload-show").html("");//清空DIV裡所有東西
        var n = 0;
        var filelist = event.target.files;//把BUTTON FILE內容讀出來

        $("#pre-test-upload-show").css("display", "block");//把之前隱藏的DIV(pre-test-upload-show)顯示出來
        $("#pre-test-upload-show").append("<p>上傳檔案 : </p>")
        for (var i = 0; i < filelist.length; i++) {
            $("#pre-test-upload-show").append("<div>檔案名稱" + filelist[i].name + ",檔案大小:" + filelist[i].size + "</div>");//在DIV裡插入檔名,檔大小

        }
        $("#pre-test-upload-show").append("<input type='button' value='上傳' id='pre-test-upload-button'>");//DIV裡插入按鈕


    });

    $(document.body).on('click', '#pre-test-upload-button', function (event) { //因為pre-test-button 是後面産生 所以不能直接用$(#id).click,要改用on方法;
        var filelist = document.getElementById('pre-test-upload').files;
        var formData = new window.FormData();
        for (var i = 0; i < filelist.length; i++) {
            formData.append("file", filelist[i]);
        }

        $.ajax({
            url: '/routes/pretestupload',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: false,
            type: 'POST',
            success: function (data) {
                var fn = JSON.parse(data);
                var tmp = "";
                $("#pre-test-upload-show").css("display", "none");
                socket.emit('client_sent_pre', data);
                tmp += "<div style='border:5px solid blue'><p>XXX 上傳了考古題</p>";
                for (var a = 0; a < fn.length; a++) {
                    tmp += "<p style='margin:0px auto;'>" + fn[a] + "</p><a href='/routes/pretestdownload?fn=" + fn[a] + "'>下載</a>";
                }
                tmp += "</div>";
                $('#divshow').append(tmp);

            },
            error: function (data) {
                console.log("F");
            }
        });
    });

    //考古題<-------------------------------------------------------------------
    $(document.body).on("click",".posting-two-showbutton",function(){
        var postid=$(this).parents('.posting-two').data("postid");//取得POSTID
        console.log("點開文章...courseid: "+courseid+" postid "+postid);
        var post=getpost(postid);//根據POSTID 取得POST 的內容
        var comment=getcomment(postid);//根據POST ID 取得COMMENT
        createfullpost(post,comment);//顯示POST 內容 和 COMMENT 內容 和增加VIEWCOUNT 數字


        //console.log("post data",post);
        //console.log("comment data",comment);

    });
    $("#post_open_x").click(function(){
         $("#post_open_div").css('opacity', 1).slideUp('slow').animate({ opacity: 0 },{ queue: false, duration: 'slow' });
    });
    $("#new_post").click(function(){
        $("#new_post_div").css('opacity', 0).slideDown('slow').animate({ opacity: 1 },{ queue: false, duration: 'slow' });
        window.scrollTo(0,0);
    });
    $(".tag_re").click(function(){
        $(".divshow").html("");
        initposting();
    });
    //YOUTUBE 圖片按下反應-->
    $("#lab-links").click(function(){
        $("#new_post_youtube_text").fadeIn();
    });
    //YOUTUBE 圖片按下反應<--
    $("#new_post_code_tmp").click(function(){
        $("#new_post_code").fadeIn();
    });
    $("#new_post_tag_tmp").click(function(){
        $("#new_post_tag").fadeIn();
    });

    //更多文章按鈕-->------------------------------------
    $("#post_more").click(function(){
        var a=$("#divshow").find(".grid-item").last().data("postid");
        var type=$(this).data("type");
        moreposting(type,a);

    });
    //更多文章按鈕<--------------------------------------
    //文章內容更多按鈕-->-------------------------------
    $(document.body).on("click",".lesstext_show",function(){
        $(this).siblings("span").first().hide();
        $(this).next(".lesstext_hidden").show();
        $(this).hide();
        gridlayout();

    });

    //文章內容更多按鈕<---------------------------------
    $(document.body).on('change','#comm_upload_img',function(event){
      var filelist = event.target.files;
      previewimg(filelist,"comm_previewimg_div");

    });
    $(document.body).on('click','#teest',function(event){
      if(filelist.length!=0)
        console.log(filelist);
      else
        console.log("no img");

    });

  $(document.body).on('mouseenter',".pretest_imgfunction",function(event){
    var id=$(this).data().id;

    setTimeout(function(){
    $('#prehid_'+id).fadeIn();

    },1000);
    setTimeout(function(){
    $('#prehid_'+id).fadeOut();

    },4000);
  });



});//end of $(function(){});
    function aa(){
        var a=1;
        return {key:"True" ,value:a};
    }
    $(".test").click(function(){
        var a =getpost('364');
        console.log("A",a);
        var b=new Array();
        b.push(a);
        $('#divshow').prepend(createposting(b,"prepend"));
        $('#divshow').prepend()
    });
function cl(s){
  console.log(s);
};


$(function () {

	 	

	$(document).on("click", "#banner_input", function(e) {
	    bootbox.dialog({
	    title: "",
	    message: "<input type='text' class='banner-hiddentext' placeholder='用一句話來形容CHEESE 老師吧' size='60'>",
	    backdrop: false,
	    buttons: {
	      success: {
	        label: "送出",
	        className: "btn-success",
	        callback: function() {
		        var a=$(".banner-hiddentext").val();
			 	bannerinsert(a);
	      	}
	      }
	    }
	    
	  });
	});
});	 
window.onload=function(){
	init();
	//samchange2
	yourpostandcomment();
	retursessionpostid();
	retursessioncommentid();
	shownotice();
	
}
var departmentid=new Array;
var decount=0;
var cl_count=0;
var banner;
var user_data=new Object();
var orientation=window.orientation;
user_data.depname=[];
user_data.depid=[];


$(window).on("scroll",function(event){
	var a=document.body.scrollTop;
	if(a>300 && orientation==undefined){
		$(".banner2").css("display","block");
		$(".paddrow").css({"padding-top":"110px","position":"relative"});
	}
	else if (a<=300 && orientation==undefined){
		$(".paddrow").css({"padding-top":"0px"});
		$(".banner2").css("display","none");
	}
});


function lesstext (text){
    var lesstext,typesetting;
      typesetting="<span>"+text+"</span>";
      return typesetting;
   // }
}



function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}


function init(){
	yourcourse();
	banner_init();
	setInterval(function(){
		var random=Math.floor(Math.random()*banner.length);
		cl(banner[random].content);
		$(".banner-title-content").text(banner[random].content);
	},8000)
	
};
function yourcourse (){//讀取USER.yourcourse
	var id='oooo';
		 $.ajax({
			url: '/mainpage/yourcourse',
			data:   { id : id },
			type : 'POST',
			async: false,
			success: function (result) {
				//result[0].Yourcourse="課號|課號|課號"
			
				courseinfo(result[0].Yourcourse);
				cl("1",result[0].Yourcourse);
				//result[0].hotselected="資管系,13|經濟系,11|"
				departmentid=result[0].hotselected.split("|");
				var did=new Array();
				var z;
				for(var i=0;i<departmentid.length;i++){
					z=departmentid[i].split(",");
					did[i]=z[1];
					user_data.depname.push(z[0]);
					user_data.depid.push(z[1]);
					
				}
				cl(user_data)
				if(did[0]!="")
					findpost(did);
				
			}
		});
};
function courseinfo(yourcourse){//把USER 的HOTSELECT 加進去.selectclass裡
	
	$.ajax({
		url: '/mainpage/yourcourseinfo',
		data:   { yourcourse : yourcourse},
		type : 'POST',
		async: true,
		success: function (result) {
			console.log("successss");
			var coursearray=new Array();
			coursearray=yourcourse.split("|");
			//alert(coursearray);
			var ahref="";
			var cokk="";
			var cookclass="";
			var cookdeid="";
			var splitdepa=new Array;
			var coursemenu="";
			for(var i=0;i<result.length;i++){
				var random=randomnum();
				ahref+="<div>";
				ahref+="<div class='select-bar' style='background-color:hsla("+random+",99%,57%,1);'></div>\
				<div class='select-bar' style='background-color:hsla("+random+",99%,57%,1);'></div>";
				ahref+='<p class="select-a"><a  id="'+result[i].Class+'" onclick="setsession(this.id,\'' + result[i].Classname+ '\',\'' + result[i].Department+ '\')">'+result[i].Classname+'</a></p>';
				cokk+=result[i].Classname+"|";
				cookclass+=result[i].Class+"|";
				splitdepa=result[i].Department.split(",");
				cookdeid+=splitdepa[0]+"|";
				ahref+="</div>";
				coursemenu+="<li><div class='select-bar' style='background-color:hsla("+random+",99%,57%,1);margin-left:15px'></div>\
				<div class='select-bar' style='background-color:hsla("+random+",99%,57%,1);'></div>";
				coursemenu+='<a  class="lia" id="'+result[i].Class+'" onclick="setsession(this.id,\'' + result[i].Classname+ '\',\'' + result[i].Department+ '\')">'+result[i].Classname+'</a></li>';
				
			}
			
			document.cookie = "classname="+cokk+"";
			document.cookie = "classnaid="+cookclass+"";
			document.cookie = "classdepartment="+cookdeid+"";
			var x = document.cookie;
			ahref+="<a href='./selectcourse'>---新增課程</a>";
			$('.selectedclass').append(ahref);
			$('#coursemenu').append(coursemenu);
			
		},
		error:function(data){
			console.log("errrrror");
			console.log(data);
		}
	});
}
function findpost(departmentid){//用depid 去找出熱門文章

	$.ajax({
				url: '/mainpage/findpostid',
				data:   { departmentid : departmentid},
				type : 'POST',
				success: function (result) {
					if(result==""){
						$('.hotpost').append("<span>你的帳號還沒加喜歡的系哦!!!</span>")
					}
					else{
						typesetting_hotpost(result);
					}
				}
			});
	/*
	for(var i=0;i<departmentid.length;i++){
		$.ajax({
				url: '/mainpage/findpostid',
				data:   { departmentid : departmentid[i]},
				type : 'POST',
				async: false,
				success: function (result) {
					if(result==""){
						
					}
					else{
						cl(result);
						for(var a in result){
							
							//alert(result[finalsort[a]].content);
							var date=new Date(result[a].date);
							var mon=date.getMonth()+1;
							var postdate=date.getFullYear()+"-"+mon+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
							var typesetting="<div class='posting' data-posting='" + result[a].Id + "'>";
							typesetting+="<div class='posting-l' style='border-radius:50px;'>";
							typesetting+="<div style='width:50px;height:50px;'>&nbspIMG</div>";
							typesetting+="</div>";//posting-l
							typesetting+="<div class=posting-r >";
							typesetting+="<div class='posting-r-nd'>";
							typesetting+="<span>"+result[a].Owner+"</span>";//ID
							typesetting+="<span style='float:right'>"+postdate+"</span>";//POSTDATA
							typesetting+="</div>";//posting-r-nd
							typesetting+="<div class='posting-r-title'>";
							typesetting+="<span>[ "+result[a].type+" ]"+result[a].title+"</span>";
							typesetting+="</div>";//posting-r-title
							typesetting+="<div class='posting-r-content'>";
							typesetting+=lesstext(result[a].content);//content
							typesetting+="</div>";//posting-r-content

							if(result[a].imglist!=null){
								typesetting+="<div style='background:#000684;margin:1% 0px 0px 0px;' >" ;
								img=result[a].imglist.split(",");
								for (var b =0 ;b<img.length-1;b++){
									typesetting+="<a class='single' href='/images/" + img[b] + "'><img style='width:100px;height:90px;border:2px solid grey;margin:2px;' src='/images/" + img[b] + "' / ></a>";
								}
								typesetting+="</div>";//end img  
							}

							if(result[a].youtubeLink!=null){
								//typesetting+=youtubelink(result[a].youtubeLink);//youtube div
							}
							if(result[a].code){
								//typesetting+=codeshow(result[a].code);//code div
							}
        
								typesetting+="</div>";//posting-r
								typesetting+="</div>";//posting

								$('#divshow').append(typesetting);
						}		
					}
				}
		});
	}
	*/
}


function setsession(classid,a,departmentid){//課程 被CLICK時
	
	var department=departmentid.split(",");
	
	document.cookie="selected="+a+";path=/";
	
	
	$.ajax({
		url: '/mainpage/setsession',
		data:   { classid : classid, departmentid : department[0]},
		type : 'POST',
		async: false,
		success: function () {
			document.location.href="/routes/course";
		}
	
	});
	
}
function typesetting_hotpost(data){//
	
	var dep="";
	var depname="";
	var deparray=[];
	cl(data);	

	for(var a=0;a<data.length;a++){
		var random=randomnum();
		dep=data[a].departmentId;
		if(deparray.indexOf(dep)==-1){
			for(var b=0;b<user_data.depid.length;b++){
				if(data[a].departmentId==user_data.depid[b]){
						depname=user_data.depname[b];
						deparray.push(dep);
						$(".hotpost").append("<div id=hotpost"+dep+" class='dep-complete'>\
							<h1 class='dep-h1' style='color:hsla("+random+",76%,29%,1);'>"+depname+"</h1></div>"); //資管
						
					}
			}
		}
		var ts="";//typesetting
		dep=data[a].departmentId;
		var date=new Date(data[a].date);
        var mon=date.getMonth()+1;
        var $date=date.getFullYear()+"-"+mon+"-"+date.getDate()+" "+date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
		//課名|TITLE|觀看次數
		ts+='<div class=" dep-content ">';
		ts+='<div class="dep-content-a ">';
		ts+='<a onclick="setsession(\''+data[a].courseId+'\',\''+data[a].Classname+'\',\''+data[a].departmentId+'\')"><span class="">'+data[a].Classname+'</span></a>';
		ts+='</div>';
		ts+='<div class="dep-content-b ">';
		ts+="<span class=' '>"+data[a].title+"</span>";
		ts+='</div>';
		ts+='</div>';
		$("#hotpost"+dep).append(ts);
	}


};

function bannerinsert (val){
	$.ajax({
		url:'/mainpage/bannerinsert',
		type:'post',
		data:{val:val},
		success:function(data){
		}

	});
}
function banner_init(){
		$.ajax({
		url:'/mainpage/bannerinit',
		type:'post',
		async:false,
		success:function(data){
			banner=data;

		}
	});
}
function randomnum(){
	var a =Math.floor(Math.random()*360);
	return a;
}
function cl(input){
	console.log("cl",cl_count,input);
	cl_count++;
}
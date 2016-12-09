function testtest(){
	alert('change');
}
var autotagarray=new Array();
var edit=true;
var resettag=new Object();
var count=0;
var targetdeletetag=new Array();
//samchange1
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
			pushtaginarray(data);
        },
        error:function(data){console.log("main.js gettag function 出錯誤");}
    });
    return a;
};
//取得該課程的所有TAG----------------
//.tag 的排版----------------
//檢查是否需要新建tag
function checktag(tag){
	//alert('a');
	var tagarray=tag.split(",");
	var tagnum='';
	if(tag==''){
		//alert(tagnum);
		return tagnum;
	}
	for(i in autotagarray){
		for(j in tagarray){
			if(tagarray[j]==autotagarray[i]){
				tagarray[j]='';
			}
		}
	}
	for(i in tagarray){
		if(tagarray[i]!=''){
			tagnum+=tagarray[i]+',';
			autotagarray.push(tagarray[i]);
		}
	}

	//alert(tagnum);
	return tagnum;
}
function pushtaginarray(alltag){

	//autotagarray.splice(0, autotagarray.length);
    for(var a=0;a<alltag.length;a++){
        autotagarray.push(alltag[a].tag);
    }
    console.log(autotagarray);
}



function dragStart(event) {
	var id=event.target.id;
	 var mytag= jQuery("#"+id).data('tag');

    event.dataTransfer.setData("Text", mytag);
    $("#texta").css({
    	"-webkit-box-shadow": "inset 0px 1px 26px 0px rrgba(255,194,10,1)",
"-moz-box-shadow": "inset 0px 1px 26px 0px rgba(255,194,10,1)",
"box-shadow": "inset 0px 1px 26px 0px rgba(255,194,10,1)",
    });
            $(".te_trash").css({
            	"box-shadow":"0px 0px 10px  3px rgba(21, 0, 255, 0.5) inset"});
            $(".te_trashico").css({"color":"#FF1E22"});
}
function dragend(){
    $("#texta").css({"box-shadow":"0px 0px 20px  10px rgba(21, 0, 255, 0.0) inset"});
    $(".te_trash").css({"box-shadow":"0px 0px 10px  3px rgba(0, 0, 0, 0.5)"});
    $(".te_trashico").css({"color":"#383838"});
}

function tagsearch(){
	var searcharray=new Array;
	searcharray=document.getElementById("texta").value.split(",");

	resettag=undefined;
	resettag=new Object();
	var tagarray=$('.dd').nestable('serialize');
	count=0;
	settagparent(tagarray,null);

	console.log(resettag);

	$.ajax({
		url:'/routes/valuetagsearch',
		data:   { searcharray:searcharray , textarray:resettag },
		type:'POST',
		async:false,
		success:function(result){
		document.location.href="/searchresult";
		},
			error:function(data){console.log("main.js gettag function 出錯誤");}
	});
}





function allowDrop(event) {
    event.preventDefault();
}

function drop(event,w) {

    event.preventDefault();
	var data = event.dataTransfer.getData("Text");
	if(w==1){
		deletetag(data);
	}
	if(w==2){

		document.getElementById("texta").value +=data+",";
	}

}







function updatetag(){
	$.ajax({
        url:'/routes/updatetag',
        data:{resettag:resettag},
        type:'POST',
		async:false,
        success:function(data){
           alert('success');
        },
        error:function(data){
            console.log("[main.js]function addpotion 失敗");
        }
    });

}

function wantedit(){
	alert('c');
	resettag=undefined;
	resettag=new Object();
	var tagarray=$('.dd').nestable('serialize');
	count=0;
	settagparent(tagarray,null);


	updatetag();
	//samchange2
	/*
	$('#nestable').remove();
	if(edit==true)
		edit=false;
	else
		edit=true;
	createtag(gettag());
	 $('.dd').nestable('collapseAll');
	 */
}

function createtag(tag){

	// typesetting+="<a class='tag_a' onclick='tagsearch(\"" + tag[a].id+ "\",\"" + tag[a].tag+ "\")'>"+tag[a].tag+"</a ><span style='color:white'> | </span>";
    var parentT=new Array();
	var checkT=new Array();
	var parentcount=0;
	var typesetting="";
	var endcount=0;

	typesetting+='<div class="dd" id="nestable">';
	typesetting+='<ol class="dd-list">';
    for (a in tag){

           if(tag[a].parentTag==null){
				typesetting+='<li class="dd-item dd3-item" data-id="'+tag[a].id+'" data-tag="'+tag[a].tag+'" id="'+tag[a].id+'"  draggable="true" ondragstart="dragStart(event)" ondragend="dragend();">';

				typesetting+='  <div class="dd-handle dd3-handle" >Drag</div><div class="dd3-content">'+tag[a].tag+'</div>';

				typesetting+='</li>';
				parentT[parentcount]=tag[a].id;
				parentcount++;
				endcount++;
		   }


	}
	typesetting+='</ol> </div>';


	 $('#tag').append(typesetting);


	// $('#nestable').nestable();
	 var ttt="";
	 var hasadd=0;
	while(endcount<tag.length){

		for(var i in parentT){
			checkT[i]=parentT[i];
		}
		parentT.splice(0, parentT.length);
		parentcount=0;
		for(var i in checkT){
			hasadd=0;
			ttt="";
			ttt+='<ol class="dd-list">';
			for (a in tag){

				if(tag[a].parentTag==checkT[i]){
					ttt+='<li class="dd-item dd3-item"  data-id="'+tag[a].id+'" data-tag="'+tag[a].tag+'" id="'+tag[a].id+'" draggable="true" ondragstart="dragStart(event)">';
					ttt+='<div class="dd-handle dd3-handle" >Drag</div> <div class="dd3-content" >'+tag[a].tag+ '</div>';
					ttt+='</li>';
					parentT[parentcount]=tag[a].id;
					parentcount++;
					endcount++;
					hasadd=1;
				}
			}
			ttt+='</ol>';

			if(hasadd==1){
				$('#'+checkT[i]).append(ttt);
			}
		}
		//ttt='<span class="glyphicon glyphicon-trash" style="font-size:50px" ondragover="allowDrop(event)" ondrop="drop(event,1)"></span>';

		checkT.splice(0, checkT.length);

	}

	 $('#nestable').nestable();


};


function gettagchild(tagarray,tag){
	console.log(tagarray);
	var temptagarray=new Array();
	for(var i in tagarray){
		if(tagarray[i].tag==tag){
			if(tagarray[i].children!=undefined){
				return false;
			}
		}
	}
	return true;
}




function settagparent(tagarray,parentid){

	for(var i in tagarray){
		tagarray[i].parentid=parentid;
		//alert(count);
		resettag[count]=tagarray[i];
		count++;
		if(tagarray[i].children!=undefined){
			//alert('undefined0');
			settagparent(tagarray[i].children,tagarray[i].id);
		}
	}
}

function deletetag(tag){
	var tagarray=$('.dd').nestable('serialize');
	count=0;
	var candelete=gettagchild(tagarray,tag);


	if(candelete==false){
		alert('this tag has children cant delete');
	}
	else{
		$.ajax({
			url:'/routes/deletetag',
			data:   { tag:tag },
			type:'POST',
			async:false,
			success:function(result){
				alert(result);
				if(result=="success"){
					$('#nestable').remove();
					createtag(gettag());
					$('.dd').nestable('collapseAll');
				}

			},
				error:function(data){console.log("main.js gettag function 出錯誤");}
		});
	}
}
//samchange1

	function split( val ) {

      return val.split( /,\s*/ );
    }

    function extractLast( term ) {

      return split( term ).pop();
    }
	// 当选择一个条目时不离开文本域
	//$( "#tag_input" ).bind( "keydown", function( event ) {
	$(document.body).on('keydown','#texta',function(event){
		  //alert(autotagarray);
		$(this).autocomplete({
			minLength: 0,
			source: function( request, response ) {

			  // 回到 autocomplete，但是提取最后的条目
			  response( $.ui.autocomplete.filter(
				autotagarray, extractLast( request.term ) ) );
			},
			focus: function() {
			  // 防止在获得焦点时插入值
			  return false;
			},
			select: function( event, ui ) {
			  var terms = split( this.value );
			  // 移除当前输入
			  terms.pop();
			  // 添加被选项
			  terms.push( ui.item.value );
			  // 添加占位符，在结尾添加逗号+空格
			  terms.push( "" );
			  this.value = terms.join( "," );
			  return false;
			}
		  });
      })

	  $(document.body).on('keydown','#new_post_tag',function(event){

		$(this).autocomplete({
			minLength: 0,
			appendTo:"#tagauto", //NEW
			source: function( request, response ) {

			  // 回到 autocomplete，但是提取最后的条目
			  response( $.ui.autocomplete.filter(
				autotagarray, extractLast( request.term ) ) );
			},
			focus: function() {
			  // 防止在获得焦点时插入值
			  return false;
			},
			select: function( event, ui ) {
			  var terms = split( this.value );
			  // 移除当前输入
			  terms.pop();
			  // 添加被选项
			  terms.push( ui.item.value );
			  // 添加占位符，在结尾添加逗号+空格
			  terms.push( "" );
			  this.value = terms.join( "," );
			  return false;
			}
		  });
      })
	  //samchange1

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
	$('#note').attr('href', splitclassid[0]);


}

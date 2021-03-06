var autotagarray=new Array();
function init(courseid){
    console.log("init檔案部份...");
    $.ajax({
        url:'/pretest/init',
        data:{courseid:courseid},
        type:"POST",
        success:function(data){
            console.log("init檔案部份成功");
            $('#pretest_display').append(createfile(data));
        },
        error:function(data){
            console.log("INIT檔案部份失敗");
        }
    });


    console.log("init檔案類型部份...");
    $.ajax({
        url:'/pretest/init/filetype',
        data:{courseid:courseid},
        type:"POST",
        success:function(data){
            console.log("init檔案類型部份成功");
            $("#filetype").append(createfiletype(data));
        },
        error:function(data){
            console.log("INIT檔案部份失敗");
        }
    });

    gettag();

};

function createfile(file){//DIV[pretest_display]的排版
	//typeof(file)=object;
	var typesetting=""; 
	//var a="FILEABC.JPG";
	//typeof(a)=string
	for (var a = 0; a < file.length; a++) {
		typesetting+="<div style='margin:20px;border:2px solid black;display:inline-block;width:150px'>";
        typesetting += "<p>" + file[a].filename + "</p><a href='/pretest/pretestdownload?fn=" + file[a].filename + "'>下載</a>";
        typesetting+="</div>";
    }
    return typesetting;
};
function createfiletype(data){//載入時産生出TYPE 的CHECKBOX
    var typesetting="";
    for(var a =0 ; a <data.length;a++){
        typesetting+="<input type='checkbox' value='"+data[a].filetype+"' checked onclick='changefiletype()'>"+data[a].filetype;
    }
    return typesetting;
};
function changefiletype(){//TYPE CHECKBOX 發生改變時動作
    var arr=new Array();
    $("input[type='checkbox']").each(function(){
        arr.push($(this).val());
        arr.push($(this).prop('checked'));
    });
    $.ajax({
        url:'/pretest/changefiletype',
        data:{arr:arr},
        type:"POST",
        success:function(data){
            if(data=="清空")
                $("#pretest_display").html("");
            else{
                $("#pretest_display").html("");
                $("#pretest_display").append(createfile(data));
            }
        },
        error:function(data){
            console.log("CHANGE檔案類型部份失敗");
        }
    });
}
function gettag(){
    var a;
    $.ajax({
        url:'/pretest/get/tag',
        type:'POST',
        success:function(data){
            pushtaginarray(data);
        },
        error:function(data){console.log("pretest.js gettag function 出錯誤");}
    });
};
function pushtaginarray(alltag){
    for(var a=0;a<alltag.length-1;a++){
        autotagarray.push(alltag[a].tag);
    }
    console.log(autotagarray);
}







$(function(){
	var clickslider=true;
    var courseid=$("#data").data('courseid');
    init(courseid);
	//samchange1
	getcoursename();
	document.getElementById("texta").value="";
	createtag(gettag());
	 $('.dd').nestable('collapseAll');
	var w = $(".slider_content").width();
     $('.slider_content').css('height', ($(window).height() - 20) + 'px' );
	 $("#man_tab").click(function(){
		 if(clickslider==true){
			if ($("#man_ss").css('left') == '-'+w+'px')
			{
				 $("#man_ss").animate({ left:'0px' }, 600 ,'swing');
			}
			clickslider=false;
		 }
		 else{
			$('#man_tab').css('visibility','visible');
			$(".slider_scroll").animate( { left:'-'+w+'px' }, 600 ,'swing');
			clickslider=true;
		 }
		
    });
	 //samchange1
	//new 
	
	
	
	function split( val ) {
      return val.split( /,\s*/ );
    }
    function extractLast( term ) {
      return split( term ).pop();
    }
	// 当选择一个条目时不离开文本域
	//$( "#tag_input" ).bind( "keydown", function( event ) {
	$(document.body).on('keydown','#tag_input',function(event){
		  
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
			  this.value = terms.join( ", " );
			  return false;
			}
		  });
      })
      
	//new 
	
	
	
	/*
    $(document.body).on('keydown','#tag_input',function(){
        $(this).autocomplete({
          source:autotagarray,
          appendTo:"#tag_input_auto",
        
        });
    });
	*/

    //CLICK考古題上傳-->上傳    >--------------------------------
    $("#pretest_upload_button").change(function (event) {
        $("#pretest_upload_detail").html("").css("display", "block");//顯示AND清空DIV裡所有東西
        var typesetting="";
        var filelist = event.target.files;//把BUTTON FILE內容讀出來
        console.log(filelist);
        for(var i=0;i<filelist.length;i++){
            typesetting+="<p><span style='color:blue'>檔案名稱 </span>" + filelist[i].name +"    <span style='color:rgb(86,151,255)'>檔案大小:</span>" + filelist[i].size +"</p>";
        }
        typesetting+="<input type='text' id='tag_input'  >";
        typesetting+="<div id='tag_input_auto' ></div>";
        typesetting+="<input type='button' id='pretest_upload_confirm' value='上傳'>";
        $("#pretest_upload_detail").append(typesetting);//DIV裡插入確認按鈕

    });

    $(document.body).on('click', '#pretest_upload_confirm', function (event) { //因為pre_test_button 是後面産生 所以不能直接用$(#id).click,要改用on方法;
        var filelist = document.getElementById('pretest_upload_button').files;//取得pretest_upload_button 的FILES 資料
        var formData = new window.FormData();
        var imglist=new Array();
        var tag=$('#tag_input').val();

        for (var i = 0; i < filelist.length; i++) {
            formData.append("file", filelist[i]);
            imglist.push(filelist[i].name);
        }
        var data={
                "imglist":imglist,
                "tag":tag
        };
        console.log("data",data);
        $.ajax({
            url: '/pretest/pretestupload',
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            async: false,
            type: 'POST',
            success: function (data) {
                $("#pretest_upload_detail").css("display", "none");
                tmp=createfile(data);
                $('#pretest_display').prepend(tmp);
            },  
            error: function (data) {
                console.log("檔案上傳失敗");
            }
        });
      $.ajax({
        url:'/pretest/tag/insert',
        type:'post',
        data:data,
        succecc:function(data){
            console.log("OK")
        },
        error:function(data){
            console.log("FAIL");
        }
      });
    });
    //CLICK考古題上傳-->上傳    <--------------------------------
});
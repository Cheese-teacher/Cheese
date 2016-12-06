//沒時間做完整的內容
//拖進去再上傳，原因："確認上傳"會抓"選擇案檔"裡的FILES值，用拖拉到空白位置的時候"選擇案檔"裡是沒有值，所以上傳也只有空值上傳。


var autotagarray=new Array();
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
        alert('登出囉！');
      window.location.href('/');
    }
  });
});
function init(courseid){

    console.log("init檔案部份...");
    gettag();
	$('#prevtest').addClass("active");
    $.ajax({
        url:'/pretest/init',
        data:{courseid:courseid},
        type:"POST",
        success:function(data){
            console.log("init檔案部份成功");
            $('#pretest_display').append(pretest_create(data));
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
        typesetting+="<input type='checkbox' value='"+data[a].filetype+"' checked onclick='changefiletype()'><span style='  font-family:Microsoft JhengHei;margin-right:20px;font-size: 24px;color:#FFFFFF'>&nbsp"+data[a].filetype+"&nbsp</span>";
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
                $("#pretest_display").append(pretest_create(data));
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
function pretest_drag(ev) {
        ev.preventDefault();
}
function pretest_drop(e) {
    e.preventDefault();//防止瀏覽器執行預設動作,預設是會把圖片打開,像PDF丢到CHROME裡
    filelist = e.originalEvent.dataTransfer.files;
    $("#pretest_upload_detail").text("")
    for (var i = 0; i < filelist.length; i++) {
        var file = filelist[i]
        // 建立一個物件，使用 Web APIs 的檔案讀取器(FileReader 物件) 來讀取使用者選取電腦中的檔案
        var reader = new FileReader();
        reader.readAsDataURL(file);
        // 事先定義好，當讀取成功後會觸發的事情
        reader.onload = function (event) {}
        $('#pretest_upload_detail').append('<p style="color:rgb(0,0,0)">'+filelist[i].name +'</p>' );



         // 因為上面定義好讀取成功的事情，所以這裡可以放心讀取檔案
    }
    var typesetting='';
    typesetting+="<input type='text' id='tag_input'  placeholder='為檔案加上TAG吧'>";
    typesetting+="<input type='button' id='pretest_upload_confirm' value='確認上傳'>";
    typesetting+="<div id='tag_input_auto'></div>";

    $("#upload_comfirm").html('').append(typesetting);//DIV裡插入確認按鈕
}
function inthreeday(date){
  var now=new Date();
  var dd=new Date(date);
  var between=Math.floor((now-dd)/(1000*60*60*24));
  if(between<=2)
    return true;
  else
    return false;

}
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
    $("#pretest_display").append(typesetting);
    
};
$(document.body).on('mouseenter',".pretest_imgfunction",function(event){
    var id=$(this).data().id;
    setTimeout(function(){
    $('#prehid_'+id).fadeIn();

    },1000);
    setTimeout(function(){
    $('#prehid_'+id).fadeOut();

    },4000);
  });


$(function(){
$('#prevtest').addClass("active");
	retursessionpostid();
	retursessioncommentid();
	shownotice();
    var clickslider=true;
    var courseid=$("#data").data('courseid');
    init(courseid);
    getcoursename();
    
    createtag(gettag());
     $('.dd').nestable('collapseAll');
    var w = $(".slider_content").width();
     //$('.slider_content').css('height', $(document).height());
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
    var height=$(document).height();
    var width=$(document).width();
    var tmp=20;
    $('#area_upload').css({'height':height-150});
    $('.trash_edit_area').css({'top':tmp,'right':"-5px"});
    $(".dd").css("height",height-200);
    $(document.body).on('keydown','#tag_input',function(){
        $(this).autocomplete({
          source:autotagarray,
          appendTo:"#tag_input_auto",
        
        });
    });

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
//檔案被拖拉進DIV裡
    $("#upload_drop_preview").on('dragover', pretest_drag).on('drop', pretest_drop);
    //CLICK考古題上傳-->上傳    >--------------------------------
    $(document.body).on("change","#pretest_upload_button",function (event) {
        $("#pretest_upload_detail").text("");//顯示AND清空DIV裡所有東西
        var typesetting="";
        var filelist = event.target.files;//把BUTTON FILE內容讀出來

        for(var i=0;i<filelist.length;i++){
            typesetting+="<p style='color:rgb(255,255,255);font-size:14px;padding:10px'>" + filelist[i].name +"</p>";
        }
        $("#pretest_upload_detail").append(typesetting);
        typesetting="";
        typesetting+="<input type='text' id='tag_input'  placeholder='為檔案加上TAG吧'>";
        typesetting+="<input type='button' id='pretest_upload_confirm' value='確認上傳'>";
        typesetting+="<div id='tag_input_auto'></div>";

        $("#upload_comfirm").html('').append(typesetting);//DIV裡插入確認按鈕

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
                $("#pretest_upload_detail").html("");
                tmp=pretest_create(data);
                $('#pretest_display').prepend(tmp);
            },  
            error: function (data) {
                console.log("檔案上傳失敗");
            }
        });
        /*增加TAG部份未完成，先把他拿掉
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
      */
    });
    //CLICK考古題上傳-->上傳    <--------------------------------
        $(".single").fancybox({
        helpers: {
            title: {
                type: 'float',
            }
        },
        padding: [5, 5, 5, 5],
    });
});

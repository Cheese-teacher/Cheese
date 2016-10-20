$(function () {
	
	$('#management').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		var coursecheck='資管系<input type="checkbox" id="check1" value="13" >';
		coursecheck+='經濟系<input type="checkbox" id="check2" value="11" >';
		coursecheck+='國企系<input type="checkbox" id="check3" value="12" >';
		coursecheck+='財金系<input type="checkbox" id="check4" value="14" >';
		coursecheck+='觀光餐旅系觀光<input type="checkbox" id="check5" value="41" >';
		coursecheck+='觀光餐旅系餐旅<input type="checkbox" id="check6" value="42" >';
		coursecheck+='<input type="button" onclick="popularcourse()" value="確定"> ';
		 $('#course').append(coursecheck);
	 });
	 
	 $('#technology').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		var coursecheck='資工系<input type="checkbox" id="check1" value="21" >';
		coursecheck+='土木系<input type="checkbox" id="check2" value="22" >';
		coursecheck+='電機系<input type="checkbox" id="check3" value="23" >';
		coursecheck+='應化系<input type="checkbox" id="check4" value="24" >';
		coursecheck+='應光系<input type="checkbox" id="check5" value="28" >';
		coursecheck+='<input type="button" onclick="popularcourse()" value="確定"> ';
		
		 $('#course').append(coursecheck);
		
	 });
	 
	 $('#humanities').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		
		var coursecheck='中文系<input type="checkbox" id="check1" value="01" >';
		coursecheck+='社工系<input type="checkbox" id="check2" value="03" >';
		coursecheck+='外文系<input type="checkbox" id="check3" value="04" >';
		coursecheck+='歷史系<input type="checkbox" id="check4" value="05" >';
		coursecheck+='公行系<input type="checkbox" id="check5" value="06" >';
		coursecheck+='東南亞系<input type="checkbox" id="check6" value="08" >';
		coursecheck+='原鄉發展學士專班<input type="checkbox" id="check7" value="46" >';
		coursecheck+='<input type="button" onclick="popularcourse()" value="確定"> ';
		 $('#course').append(coursecheck);
	 });
	 
	 $('#education').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		var coursecheck='諮人系<input type="checkbox" id="check1" value="09" >';
		coursecheck+='國比系<input type="checkbox" id="check2" value="02" >';
		coursecheck+='教政系<input type="checkbox" id="check3" value="07" >';
		coursecheck+='<input type="button" onclick="popularcourse()" value="確定"> ';
		 $('#course').append(coursecheck);
	 });
	 
	 $('#tongshi').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		var coursecheck='通識<input type="checkbox" id="check1" value="99" >';
		coursecheck+='<input type="button" onclick="popularcourse()" value="確定"> ';
		
		 $('#course').append(coursecheck);
		
	 });
	 
	 $('#course input[type="checkbox"]').change(function() {
     
         alert('ssssssssss');
     
	});
	 
	 
});	 

var departmentid="";
function popularcourse(){
	
	var j=0;
	var n=$("#course input[type=checkbox]").length;
	for(var i=0;i<n;i++){
		var a=$("#check"+i).prop("checked");
		if(a==true){
			departmentid+=$("#check"+i).val()+"|";
			j++;
		}
	}
	alert(departmentid);
	//findpost(departmentid);
}



function findpost(departmentid){
	
	for(var i=0;i<departmentid.length;i++){
		$.ajax({
					url: '/mainpage/findpostid',
					data:   { departmentid : departmentid[i]},
					type : 'POST',
					async: false,
					success: function (result) {
						
						
						
						
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
								typesetting+=youtubelink(result[a].youtubeLink);//youtube div
							}
							if(result[a].code){
								typesetting+=codeshow(result[a].code);//code div
							}
        
								typesetting+="</div>";//posting-r
								typesetting+="</div>";//posting

								$('#divshow').append(typesetting);
						}		
						
					}
		});
	}
}

function lesstext (text){
    var lesstext,typesetting;
	/*
    if(text.length>249){
      lesstext=text.substring(0,249)+"...";
      typesetting="<span>"+lesstext+"</span><input type='button' class='lesstext_show' value='更多' style='color:black'>";
      typesetting+="<span class='lesstext_hidden' hidden='hidden'>"+text+"</span>"
      return typesetting;
    }
    else{
		*/
      typesetting="<span>"+text+"</span>";
      return typesetting;
   // }
}



function myFunction() {
    document.getElementById("myDropdown").classList.toggle("show");
}

window.onload=function(){
	//alert("start");
	
	var id='oooo';
	 $.ajax({
		url: '/mainpage/yourcourse',
		data:   { id : id },
		type : 'POST',
		async: false,
		success: function (result) {
		
			courseinfo(result[0].Yourcourse);
			
		}
	});
}

function courseinfo(yourcourse){
	//alert(yourcourse);
	$.ajax({
		url: '/mainpage/yourcourseinfo',
		data:   { yourcourse : yourcourse},
		type : 'POST',
		async: false,
		success: function (result) {
			var coursearray=new Array();
			coursearray=yourcourse.split("|");
			//alert(coursearray);
			var ahref="";
			for(var i=0;i<result.length;i++){
				ahref+=' <a href="/routes/course/">'+result[i].Classname+'</a>'
			}
			
			$('#myDropdown').append(ahref);
			
		}
	});
}






$(function () {
	$('#classselect').click(function (data) {//點送出查詢課程會觸發
		//找出你已經選了的課
		var id='oooo';
		 $.ajax({
			url: '/selectcourse/yourcourse',
			data:   { id : id },
			type : 'POST',
			async: false,
			success: function (result) {
				var yourselectcourse=result[0].Yourcourse;
				showcourse(yourselectcourse); //	顯示你查詢的課
			//	showyourcourse(yourselectcourse); //顯示你已選的課
			}
		});

	});



	/*

	$('#management').click(function (data) {
		//$('#classresulttable').remove();

		$('#course').empty();
		var coursecheck='資管系<input type="checkbox" onchange="selecthot(this.value)" id="check1" value="13" >';
		coursecheck+='經濟系<input type="checkbox" onchange="selecthot(this.value)" id="check2" value="11" >';
		coursecheck+='國企系<input type="checkbox" onchange="selecthot(this.value)" id="check3" value="12" >';
		coursecheck+='財金系<input type="checkbox" onchange="selecthot(this.value)" id="check4" value="14" >';
		coursecheck+='觀光餐旅系觀光<input type="checkbox" onchange="selecthot(this.value)" id="check5" value="41" >';
		coursecheck+='觀光餐旅系餐旅<input type="checkbox" onchange="selecthot(this.value)" id="check6" value="42" >';
		coursecheck+='<input type="button" onclick="insertselecteddepartment()" value="確定"> ';
		 $('#course').append(coursecheck);
		 checked();
	 });

	 $('#technology').click(function (data) {
		//$('#classresulttable').remove();

		$('#course').empty();
		var coursecheck='資工系<input type="checkbox" onchange="selecthot(this.value)" id="check1" value="21" >';
		coursecheck+='土木系<input type="checkbox" onchange="selecthot(this.value)" id="check2" value="22" >';
		coursecheck+='電機系<input type="checkbox" onchange="selecthot(this.value)" id="check3" value="23" >';
		coursecheck+='應化系<input type="checkbox" onchange="selecthot(this.value)" id="check4" value="24" >';
		coursecheck+='應光系<input type="checkbox" onchange="selecthot(this.value)" id="check5" value="28" >';
		coursecheck+='<input type="button" onclick="insertselecteddepartment()" value="確定"> ';

		 $('#course').append(coursecheck);
		 checked();

	 });

	 $('#humanities').click(function (data) {
		//$('#classresulttable').remove();

		$('#course').empty();

		var coursecheck='中文系<input type="checkbox" onchange="selecthot(this.value)" id="check1" value="01" >';
		coursecheck+='社工系<input type="checkbox" onchange="selecthot(this.value)" id="check2" value="03" >';
		coursecheck+='外文系<input type="checkbox" onchange="selecthot(this.value)" id="check3" value="04" >';
		coursecheck+='歷史系<input type="checkbox" onchange="selecthot(this.value)" id="check4" value="05" >';
		coursecheck+='公行系<input type="checkbox" onchange="selecthot(this.value)" id="check5" value="06" >';
		coursecheck+='東南亞系<input type="checkbox" onchange="selecthot(this.value)" id="check6" value="08" >';
		coursecheck+='原鄉發展學士專班<input type="checkbox" onchange="selecthot(this.value)" id="check7" value="46" >';
		coursecheck+='<input type="button" onclick="insertselecteddepartment()" value="確定"> ';
		 $('#course').append(coursecheck);
		 checked();
	 });

	 $('#education').click(function (data) {
		//$('#classresulttable').remove();
		//checked();
		$('#course').empty();
		var coursecheck='諮人系<input type="checkbox" onchange="selecthot(this.value)" id="check1" value="09" >';
		coursecheck+='國比系<input type="checkbox" onchange="selecthot(this.value)" id="check2" value="02" >';
		coursecheck+='教政系<input type="checkbox" onchange="selecthot(this.value)" id="check3" value="07" >';
		coursecheck+='<input type="button" onclick="insertselecteddepartment()" value="確定"> ';
		 $('#course').append(coursecheck);
		 checked();
	 });

	 $('#tongshi').click(function (data) {
		//$('#classresulttable').remove();
		$('#course').empty();
		var coursecheck='通識<input type="checkbox" onchange="selecthot(this.value)" id="check1" value="99" >';
		coursecheck+='<input type="button"  onclick="insertselecteddepartment()" value="確定"> ';

		 $('#course').append(coursecheck);
		checked();
	 });
	 */

});


var yourtruecourse="";	//存課 資料庫的課+yourcourse-deletecourse
var count=0;
var deletecourse=new Array();	//存你點下取消button的課的id
var yourcourse=new Array();		////存你點下選擇button的課的id
var yourcoursecount=0;		//記錄array的位子和長度
var deletecoursecount=0;	//


var yourtruedepartment="";
var addcourse=new Array();
var delcourse=new Array();
var yourdcount=0;		//記錄array的位子和長度
var deletedcount=0;

window.onload = function ()	//onload
{
/*
	var x = document.cookie;

	var splitcookie=x.split(";");

	for(var i in splitcookie){
		var isclassname=splitcookie[i].substring(1,10);
		if(isclassname=="classname"){
			var classname=splitcookie[i].substring(11);
		}
	}
	*/

		var id='oooo';
		 $.ajax({
			url: '/selectcourse/yourcourse',
			data:   { id : id },
			type : 'POST',
			async: false,
			success: function (result) {

				var yourselectcourse=result[0].Yourcourse;
				showyourcourse(yourselectcourse);
				showyourdepartment(result[0].hotselected);
			}
		});
}



function showcourse(yourselectcourse){	//顯示你查詢的課

	var trtd;
	var department=$("#Yourdepartment option:selected").val();
	alert(department)
	var grade=$("#YourGrade option:selected").val();
	var course=$("#coursename").val();
	course=course.replace(/\s+/g,"");
	var mn="管院";
	var spl=new Array();
	var Class=new Array();

	$.ajax({
			url: '/selectcourse/selectcourse',
			data:   { department : department , grade : grade, mn :mn , course:course},
			type : 'POST',
			async: false,
			success: function (result) {
				$('#resulttable').empty();

				trtd='<table border="3" id="classresulttable"><tr><td>學期</td><td>課號</td><td>班別</td><td>中文課名</td><td>開課系所代碼</td><td>部別</td><td>年級</td><td>開課教師</td><td>地點</td><td>時間</td><td>人數上限</td><td>修課人數</td></tr>';


				for(var i in result){
					Class[i]=result[i].Class;

					var spl=result[i].Class.split(',');
					//missing ) after argument list 错误
					trtd+='<tr><td>'+spl[0] +'</td><td>'+spl[1] +'</td><td>'+ spl[2]+'</td><td>'+result[i].Classname +'</td><td>'+ result[i].Department+'</td><td>'+ result[i].EducationLevel+'</td><td>'+ result[i].Grade+'</td><td>'+ result[i].Teacher+'</td><td>'+result[i].Place +'</td><td>'+result[i].Time +'</td><td>'+ result[i].StudentLimet+'</td><td>'+result[i].StudentQuantity +'</td><td><input type="button"   value="選擇" id="'+Class[i]+'" class="btn btn-default btn-success"  onclick="updatecourse(this.id)"></td></tr>';
				}
				trtd+='</table>';


				$('#resulttable').append(trtd);
				//以上都是顯示出來

				//因為可能是反复按選擇和取消 所以要先相減消去
				for(var i = 0 ; i < yourcourse.length ; i++ ){
					for(var j = 0 ; j < deletecourse.length ; j++ ){
						//alert("delete"+deletecourse[j]);
						if((yourcourse[i]==deletecourse[j])&&deletecourse[j]!=""){
						yourcourse[i]="";
						deletecourse[j]="";
						break;
						}
					}
				}

				var splitcourse=yourselectcourse.split("|");

				for(var i=0;i<Class.length;i++){
					//查詢 如果是已選的就把button value改成取消
					for(var j=0;j<splitcourse.length;j++){
						if(Class[i]==splitcourse[j]){
							document.getElementById(Class[i]).value = "取消";
							document.getElementById(Class[i]).className = "btn btn-default btn-danger";
						}
					}
					for(var j=0;j<yourcourse.length;j++){
						if(Class[i]+"|"==yourcourse[j]){
							document.getElementById(Class[i]).value = "取消";
							document.getElementById(Class[i]).className = "btn btn-default btn-danger";
						}
					}
					//如果是未選就把button value 改成選擇
					for(var j=0;j<deletecourse.length;j++){
						if(Class[i]+"|"==deletecourse[j]){

							document.getElementById(Class[i]).value = "選擇";
							document.getElementById(Class[i]).className = "btn btn-default btn-success";
							try{
								document.getElementById(Class[i]+"|").value = "選擇";
								document.getElementById(Class[i]+"|").className = "btn btn-default btn-success";
							}
							catch(e){

							}
						}
					}
				}
			}
		});

}
//點課程選擇or取消會觸發
function updatecourse(tid){
	var id=tid.replace("|","");
	//最後一個字元如果是|代表是點下面 不是代表點上面
	if(tid.charAt(tid.length-1)!='|'){
		//更改classname和記錄選擇的課 or 取消的課
		if(document.getElementById(id).className == "btn btn-default btn-danger"){

			tid=tid+'|';

			document.getElementById(id).className = "btn btn-default btn-success";
			document.getElementById(id).value = "選擇";
			try{
				document.getElementById(tid).className = "btn btn-default btn-success";
				document.getElementById(tid).value = "選擇";
			}
			catch(e){
				//alert(e);
			}
			deletecourse[deletecoursecount]=id+"|";
			deletecoursecount++;
		}
		else{
			tid=tid+'|';


			document.getElementById(id).className = "btn btn-default btn-danger";
			document.getElementById(id).value = "取消";
			try{
				document.getElementById(tid).className = "btn btn-default btn-danger";
				document.getElementById(tid).value = "取消";
			}
			catch(e){
				;
			}
			yourcourse[yourcoursecount]=id+"|";
			yourcoursecount++;
		}
	}
	else{

		if(document.getElementById(tid).className == "btn btn-default btn-danger"){


			document.getElementById(tid).className = "btn btn-default btn-success";
			document.getElementById(tid).value = "選擇";
			try{
				document.getElementById(id).className = "btn btn-default btn-success";
				document.getElementById(id).value = "選擇";
			}
			catch(e){
				//alert(e);
			}
			deletecourse[deletecoursecount]=id+"|";
			deletecoursecount++;
		}
		else{


			document.getElementById(tid).className = "btn btn-default btn-danger";
			document.getElementById(tid).value = "取消";


			try{
				document.getElementById(id).className = "btn btn-default btn-danger";
				document.getElementById(id).value = "取消";
			}
			catch(e){
				//alert(e);
			}
			yourcourse[yourcoursecount]=id+"|";
			yourcoursecount++;
		}
	}

}

//按 下面的 確定button會觸發 是存入資料庫的function
function courseselect(yourselectedcourse){
	//相減消去
	for(var i = 0 ; i < yourcourse.length ; i++ ){
		for(var j = 0 ; j < deletecourse.length ; j++ ){

			if((yourcourse[i]==deletecourse[j])&&deletecourse[j]!=""){
				yourcourse[i]="";
				deletecourse[j]="";
				break;
			}
		}
	}
	//因為第一次yourtruecourse是空值 所以要先把資料庫裡存的課放進去 第二次後就不需要了
	if(count==0){
		yourtruecourse+=yourselectedcourse;
		for(var i = 0 ; i < yourcourse.length ; i++ ){
			yourtruecourse+=yourcourse[i];
		}
		count++;

	}
	else{

		for(var i = 0 ; i < yourcourse.length ; i++ ){
			yourtruecourse+=yourcourse[i];
		}
	}


	for(var j = 0 ; j < deletecourse.length ; j++ ){
		yourtruecourse=yourtruecourse.replace(deletecourse[j],"");
	}
	//存進資料庫
	$.ajax({
		url: '/selectcourse/insertcourse',
		data:   { yourcourse : yourtruecourse},
		type : 'POST',
		async: false,
		success: function (result) {
				clearyourcourse();
				alert("success");
		}
	});

	showyourcourse(yourtruecourse); //show你已選擇在資料庫的課在下面的table

}

function clearyourcourse(){ //存入資料庫後要初始化array
	yourcourse.splice(0, yourcourse.length);
	deletecourse.splice(0, deletecourse.length);
	deletecoursecount=0;
	yourcoursecount=0;


}

//show你已選擇在資料庫的課在下面的table
function showyourcourse(yourtruecourse){
	$.ajax({
		url: '/selectcourse/yourcourseinfo',
		data:   { yourcourse : yourtruecourse},
		type : 'POST',
		async: false,
		success: function (result) {
			//alert(result.length);
			$('#yourcoursetable').empty();
			var trtd;
			trtd='<table border="3" id="yourclassresulttable"><tr><td>中文課名</td><td>年級</td><td>開課教師</td><td>地點</td><td>時間</td></tr>';
			for(var i in result){
				trtd+='<tr><td>'+result[i].Classname +'</td><td>'+ result[i].Grade+'</td><td>'+ result[i].Teacher+'</td><td>'+result[i].Place +'</td><td>'+result[i].Time +'</td><td><input type="button"   value="取消" id="'+result[i].Class+'|" class="btn btn-default btn-danger"  onclick="updatecourse(this.id)"></td></tr>';

			}
			trtd+='</table>';
			trtd+='<input type="button" class="btn btn-default btn-success" id="courseselect" onclick="courseselect(\'' + yourtruecourse+ '\')" value="確定">';

			$('#yourcoursetable').append(trtd);

			for(var i=0;i<result[i].length;i++){
				for(var j=0;j<deletecourse.length;j++){
					if(result[i].Class+"|"==deletecourse[j]){

						try{
							document.getElementById(result[i].Class+"|").value = "選擇";
							document.getElementById(result[i].Class+"|").className = "btn btn-default btn-success";
						}
						catch(e){

						}
					}
				}
			}

		}
	});

}


var yourtruedepartment="";
var addcourse=new Array();
var delcourse=new Array();
var yourdcount=0;		//記錄array的位子和長度
var deletedcount=0;


function showyourdepartment(seid){
	$('#College').empty();
	var splitdepa=new Array();
	var splitid=new Array();
	splitdepa=seid.split("|");
	alert(splitdepa);
	var trtd='<table border="3" id="yourclassresulttable">';
	for(var i =0;i<splitdepa.length-1;i++){
		splitid=splitdepa[i].split(",");
		trtd+='<tr><td>'+splitid[0]+'</td><td><input type="button"   value="取消" id="'+splitdepa[i]+'|" class="btn btn-default btn-danger"  onclick="insertdepartment(this.id)"></td></tr>'
	}
	trtd+='</table>';
	yourtruedepartment+=seid;
	$('#College').append(trtd);
	var buttons='<input type="button"   value="確定"  class="btn btn-default btn-success"  onclick="updatedepartment()">';
	$('#buttonCollege').append(buttons);
}

function departmentselect(){
	$('#searchCollege').empty();
	var college=$("#yourCollege option:selected").val();
	//alert(college);
	var trtd='<table border="3" id="yourclassresulttable">';
	if(college=="管院"){
		trtd+='<tr><td>資管系</td><td><input type="button"   value="選擇" id="資管系,13" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>經濟系</td><td><input type="button"   value="選擇" id="經濟系,11" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>國企系</td><td><input type="button"   value="選擇" id="國企系,12" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>財金系</td><td><input type="button"   value="選擇" id="財金系,14" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>觀光餐旅系觀光</td><td><input type="button"   value="選擇" id="觀光餐旅系觀光,41" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>觀光餐旅系餐旅</td><td><input type="button"   value="選擇" id="觀光餐旅系餐旅,42" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
	}
	if(college=="人院"){
		trtd+='<tr><td>中文系</td><td><input type="button"   value="選擇" id="中文系,01" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>社工系</td><td><input type="button"   value="選擇" id="社工系,03" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>外文系</td><td><input type="button"   value="選擇" id="外文系,04" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>歷史系</td><td><input type="button"   value="選擇" id="歷史系,05" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>公行系</td><td><input type="button"   value="選擇" id="公行系,06" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>東南亞系</td><td><input type="button"   value="選擇" id="東南亞系,08" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>原鄉發展學士專班</td><td><input type="button"   value="選擇" id="原鄉發展學士專班,46" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'

	}
	if(college=="科院"){
		trtd+='<tr><td>資工系</td><td><input type="button"   value="選擇" id="資工系,21" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>土木系</td><td><input type="button"   value="選擇" id="土木系,22" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>電機系</td><td><input type="button"   value="選擇" id="電機系,23" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>應化系</td><td><input type="button"   value="選擇" id="應化系,24" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>應光系</td><td><input type="button"   value="選擇" id="應光系,28" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
	}
	if(college=="all"){
		trtd+='<tr><td>資管系</td><td><input type="button"   value="選擇" id="資管系,13" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>經濟系</td><td><input type="button"   value="選擇" id="經濟系,11" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>國企系</td><td><input type="button"   value="選擇" id="國企系,12" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>財金系</td><td><input type="button"   value="選擇" id="財金系,14" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>觀光餐旅系觀光</td><td><input type="button"   value="選擇" id="觀光餐旅系觀光,41" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>觀光餐旅系餐旅</td><td><input type="button"   value="選擇" id="觀光餐旅系餐旅,42" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>中文系</td><td><input type="button"   value="選擇" id="中文系,01" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>社工系</td><td><input type="button"   value="選擇" id="社工系,03" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>外文系</td><td><input type="button"   value="選擇" id="外文系,04" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>歷史系</td><td><input type="button"   value="選擇" id="歷史系,05" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>公行系</td><td><input type="button"   value="選擇" id="公行系,06" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>東南亞系</td><td><input type="button"   value="選擇" id="東南亞系,08" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>原鄉發展學士專班</td><td><input type="button"   value="選擇" id="原鄉發展學士專班,46" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>資工系</td><td><input type="button"   value="選擇" id="資工系,21" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>土木系</td><td><input type="button"   value="選擇" id="土木系,22" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>電機系</td><td><input type="button"   value="選擇" id="電機系,23" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>應化系</td><td><input type="button"   value="選擇" id="應化系,24" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>應光系</td><td><input type="button"   value="選擇" id="應光系,28" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>諮人系</td><td><input type="button"   value="選擇" id="諮人系,09" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>國比系</td><td><input type="button"   value="選擇" id="國比系,02" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>教政系</td><td><input type="button"   value="選擇" id="教政系,07" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>通識</td><td><input type="button"   value="選擇" id="通識,99" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'



	}
	if(college=="教院"){
		trtd+='<tr><td>諮人系</td><td><input type="button"   value="選擇" id="諮人系,09" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>國比系</td><td><input type="button"   value="選擇" id="國比系,02" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
		trtd+='<tr><td>教政系</td><td><input type="button"   value="選擇" id="教政系,07" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
	}
	if(college=="通識"){
		trtd+='<tr><td>通識</td><td><input type="button"   value="選擇" id="通識,99" class="btn btn-default btn-success"  onclick="insertdepartment(this.id)"></td></tr>'
	}

	trtd+='</table>';
	$('#searchCollege').prepend(trtd);
	var splitdepa=new Array();

	splitdepa=yourtruedepartment.split("|");



	for(var i = 0 ; i < addcourse.length ; i++ ){
		for(var j = 0 ; j < delcourse.length ; j++ ){

			if((addcourse[i]==delcourse[j])&&delcourse[j]!=""){
				addcourse[i]="";
				delcourse[j]="";
				break;
			}
		}

	}

	for(var i in splitdepa){
		try{
			document.getElementById(splitdepa[i]).value = "取消";
			document.getElementById(splitdepa[i]).className = "btn btn-default btn-danger";
		}
		catch(e){

		}

		for(var j=0;j<addcourse.length;j++){
			if(splitdepa[i]+"|"==addcourse[j]){
				document.getElementById(splitdepa[i]).value = "取消";
				document.getElementById(splitdepa[i]).className = "btn btn-default btn-danger";
			}
		}

		for(var j=0;j<delcourse.length;j++){
			if(splitdepa[i]+"|"==delcourse[j]){

				document.getElementById(splitdepa[i]).value = "選擇";
				document.getElementById(splitdepa[i]).className = "btn btn-default btn-success";
				try{
					document.getElementById(splitdepa[i]+"|").value = "選擇";
					document.getElementById(splitdepa[i]+"|").className = "btn btn-default btn-success";
				}
				catch(e){

				}
			}
		}


	}







}

function insertdepartment(tid){
	var id=tid.replace("|","");


	if(tid.charAt(tid.length-1)!='|'){
		//更改classname和記錄選擇的課 or 取消的課
		if(document.getElementById(id).className == "btn btn-default btn-danger"){

			tid=tid+'|';

			document.getElementById(id).className = "btn btn-default btn-success";
			document.getElementById(id).value = "選擇";
			try{
				document.getElementById(tid).className = "btn btn-default btn-success";
				document.getElementById(tid).value = "選擇";
			}
			catch(e){
				//alert(e);
			}
			delcourse[deletedcount]=id+"|";
			deletedcount++;
		}
		else{
			tid=tid+'|';


			document.getElementById(id).className = "btn btn-default btn-danger";
			document.getElementById(id).value = "取消";
			try{
				document.getElementById(tid).className = "btn btn-default btn-danger";
				document.getElementById(tid).value = "取消";
			}
			catch(e){
				;
			}
			addcourse[yourdcount]=id+"|";
			yourdcount++;
		}
	}
	else{

		if(document.getElementById(tid).className == "btn btn-default btn-danger"){


			document.getElementById(tid).className = "btn btn-default btn-success";
			document.getElementById(tid).value = "選擇";
			try{
				document.getElementById(id).className = "btn btn-default btn-success";
				document.getElementById(id).value = "選擇";
			}
			catch(e){
				//alert(e);
			}
			delcourse[deletedcount]=id+"|";
			deletedcount++;
		}
		else{


			document.getElementById(tid).className = "btn btn-default btn-danger";
			document.getElementById(tid).value = "取消";


			try{
				document.getElementById(id).className = "btn btn-default btn-danger";
				document.getElementById(id).value = "取消";
			}
			catch(e){
				//alert(e);
			}
			addcourse[yourdcount]=id+"|";
			yourdcount++;
		}
	}

	/*
	if(document.getElementById(tid).className == "btn btn-default btn-danger"){
		document.getElementById(tid).className = "btn btn-default btn-success";
		document.getElementById(tid).value = "選擇";
		delcourse[deletedcount]=tid;
		deletedcount++;
	}

	else if(document.getElementById(tid).className == "btn btn-default btn-success"){

		document.getElementById(tid).className = "btn btn-default btn-danger";
		document.getElementById(tid).value = "取消";
		addcourse[yourdcount]=tid;
		yourdcount++;
	}
	*/

	//alert(addcourse);
	//alert(delcourse);

}


function updatedepartment(){
	console.log(addcourse);
	for(var i = 0 ; i < addcourse.length ; i++ ){
		for(var j = 0 ; j < delcourse.length ; j++ ){

			if((addcourse[i]==delcourse[j])&&delcourse[j]!=""){
				addcourse[i]="";
				delcourse[j]="";
				break;
			}
		}

	}


	for(var i = 0 ; i < addcourse.length ; i++ ){
			yourtruedepartment+=addcourse[i];
		}
	for(var j = 0 ; j < delcourse.length ; j++ ){
		yourtruedepartment=yourtruedepartment.replace(delcourse[j],"");
	}


	alert(yourtruedepartment);
	$.ajax({
		url: '/selectcourse/insertdepartment',
		data:   { departmentid : yourtruedepartment},
		type : 'POST',
		async: false,
		success: function (result) {
				clearyourdepartment();
				alert("success");
		}
	});
}

function clearyourdepartment(){ //存入資料庫後要初始化array
	addcourse.splice(0, addcourse.length);
	delcourse.splice(0, delcourse.length);
	deletedcount=0;
	yourdcount=0;
	showyourdepartmentafter(yourtruedepartment);


}


function showyourdepartmentafter(seid){
	$('#College').empty();
	$('#buttonCollege').empty();
	var splitdepa=new Array();
	var splitid=new Array();
	splitdepa=seid.split("|");
	alert(splitdepa);
	var trtd='<table border="3" id="yourclassresulttable">';
	for(var i =0;i<splitdepa.length-1;i++){
		splitid=splitdepa[i].split(",");
		trtd+='<tr><td>'+splitid[0]+'</td><td><input type="button"   value="取消" id="'+splitdepa[i]+'|" class="btn btn-default btn-danger"  onclick="insertdepartment(this.id)"></td></tr>'
	}
	trtd+='</table>';

	$('#College').append(trtd);
	var buttons='<input type="button"   value="確定"  class="btn btn-default btn-success"  onclick="updatedepartment()">';
	$('#buttonCollege').append(buttons);
}

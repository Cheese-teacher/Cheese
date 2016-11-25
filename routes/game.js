var ui ={
    
    talkrun:$(".ui-talkrun"),
    cancel:$(".ui-cancel")
};
   
$(".progress-ring").loadingRing();

window.onload=getdata();
var realanswer= {
    attr: 0
};

var correct=0;
function getdata(){
correct=0;
$.getJSON("http://localhost:3000/routes/totalq.json",function(barrages){
realanswer= {
    attr: 0
};



var looper_time=3*1000;
var items=barrages.array;
//弹幕总数
var total=barrages.array.length;
//是否首次执行
var run_once=true;
//弹幕索引
var index=0;
 
barrager();


function  barrager(){
 
  
    if(run_once){
        //如果是首次执行,则设置一个定时器,并且把首次执行置为false
        looper=setInterval(barrager,looper_time);                
        run_once=false;
    }
    //发布一个弹幕
    $('body').barrager(items[index]);
   
  //索引自增
  index++;
  //所有弹幕发布完毕，清除计时器。
  if(index == total){
 
      clearInterval(looper);
      index=0;
      return false;
  }
 
   
 
 
}
    var deletedemu;
    $('.question-modal').on('show.bs.modal', function (event) 
    {   
        var triggeredTarget = $(event.relatedTarget) ;
                //Button的 whatever_can id
        var myid = triggeredTarget.data('whatever_can') ;
               
        $("#qw1").empty();
        $("#qw2").empty();
        $("#qw3").empty();
        $("#qw4").empty();
        $(".contentq").empty();
        $(".contentq").append(barrages.array[myid].info);
        $("#qw1").append('<input type="radio" name="qu" id="q1" value="1" checked>(1).'+barrages.array[myid].q1);
        $("#qw2").append('<input type="radio" name="qu" id="q2" value="2" >(2).'+barrages.array[myid].q2);       
        $("#qw3").append('<input type="radio" name="qu" id="q3" value="3" >(3).'+barrages.array[myid].q3);
        $("#qw4").append('<input type="radio" name="qu" id="q4" value="4" >(4).'+barrages.array[myid].q4);
       realanswer = {
        attr: barrages.array[myid].answer
        };
        $(".question-modal").attr({
			'id':myid
		});
        
        
    }); 
    
});
}
    ui.talkrun.click(function (){
        var  studentanswer=$('input:radio[name=qu]:checked').val();
        $('.question-modal').modal('hide');
        
        var deleted=$(".question-modal").attr("id")
        if(studentanswer==realanswer.attr){
            correct++;
            alert("答對:"+correct);
            $("#barrager_"+deleted).remove();
           $("#counter").empty();
           $("#counter").html("答對"+correct+"題");
        }
        else{
            alert("錯誤");
            $("#barrager_"+deleted).remove();
        }
        
		
        
    
    });
    ui.cancel.click(function (){
        $('.question-modal').modal('hide');
    });

 
 

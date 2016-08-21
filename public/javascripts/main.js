var divnum = 0;
var filelist = "";
var numm = "";

//因為jquery不能用onclick所以要放在外面
function comment(id) {

    var tname = "text" + id;
    var dname = "div" + id;

    var msg = document.getElementById(tname).value;
    if (msg.trim().length > 0) {
        var pname = $('#name').val();
        $('#' + dname).append('<p>' + pname + ' : ' + msg + '</p>');
        $('#' + tname).val("");
    }
    //alert("2"+filelist+" a "+numm);
    $.uploadfile(filelist, numm);

    filelist = "";
    numm = "";
}

function upload(num) {
    //alert(num);
    filelist = event.target.files;
    numm = "diva" + num;
    //alert(filelist);


}
$(function () {
//文字傳送---------------------------------------
    var socket = io.connect();
    var filelist = "";

    //sam new
    $('#sendlink').click(function () {
        var links = $('#links').val();
        socket.emit('clientsend', {
            'links': links
        });
        //alert(links);
        var embedlink = links.replace("watch?v=", "embed/");
        //alert(embedlink);
        //<iframe width="560" height="315" src="https://www.youtube.com/embed/f10NBgdve04" frameborder="0" allowfullscreen></iframe>
        $('#divshow').append(' <iframe width="560" height="315" src="' + embedlink + '" frameborder="0" allowfullscreen></iframe>');
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
    });

    //sam
    $('#sendtext').click(function () {
        $("img").remove(".de");
        var message = $('#text').val();
        var name = $('#name').val();
        var divnamenum = "diva" + divnum;
        var buttonname = "a" + divnum;
        var textname = "texta" + divnum;
        var uploadname = "" + divnum;
        socket.emit('clientsend', {
            'name': name,
            'message': message
        });
        message = message.replace(/\n/g, "<br>");
        message = message.replace(/  /g, "&nbsp;&nbsp;");


        $('#divshow').append('<div id="' + divnamenum + '" style="width:500px ;border:5px solid lightgreen">');
        $('#' + divnamenum).append('<p>' + name + ' : ' + message + '</p>');
        $.uploadfile(filelist, divnamenum);
        filelist = "";
        $('#divshow').append('<input type="text" id="' + textname + '"><input type="button" id="' + buttonname + '" value="send" onclick="comment(this.id)" ><input type="file"  value="upload" onchange="upload(' + divnum + ')" ></div>');
        $('#text').val("");
        //$('#divshow').append('<img src=./images/1.jpg style=\'width=300px;height:200px;\'></img>');
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
        divnum++;
    });




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

    //文字傳送---------------------------------------

    //圖片傳送區塊塊塊塊---------------------------------------------------------------------
    $('#file_test').change(function (event) {

        //Filelist Object
        filelist = event.target.files;
        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i]
            var reader = new FileReader();
            reader.onload = function (event) {

                $('#divsend').append('<img class="de" style="width:100px ;height:100px ; " src="' + event.target.result + '"/>');
            }
            reader.readAsDataURL(file);
        }
    });

    //圖片傳送上傳區塊塊塊---------------------------------------------------
    //圖片按下後反應-----------------------------------------------------------



    $(".single").fancybox({
        helpers: {
            title: {
                type: 'float',
            }
        },
        padding: [5, 5, 5, 5],
    });
    //圖片按下後反應-----------------------------------------------------------
    //圖片拖拉功能-------------------------------------------------------------------

    $.uploadfile = function (filelist, divnamenum) {

        for (var i = 0; i < filelist.length; i++) {
            var file = filelist[i];
            var formData = new window.FormData();
            var ftype = filelist[i]['type'].substr((filelist[i]['type'].indexOf("/") + 1));

            formData.append(ftype, file);
            //將檔案加進FormData
            if (filelist[i]['type'] == 'image/jpeg' || filelist[i]['type'] == 'image/png' || filelist[i]['type'] == 'image/gif') {
                $.ajax({
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: false,
                    type: 'POST',
                    success: function (data) {
                        imgnum = data;
                        //alert(data);
                        var name = $('#name').val();
                        socket.emit('client_send_img', {
                            'name': name,
                            'num': imgnum,
                            'type': ftype,
                        });
                        $('#' + divnamenum).append('<div><a class=\'single\' href=\'../images/' + imgnum + '.' + ftype + '\'><img src=./images/' + imgnum + '.' + ftype + ' style=\'width:250px;height:180px;\' alt="" / ></a></div>');
                        //$('#divshow').append('<div><p>'+name+':</p></div><div   data-imgid='+imgnum+'.'+ftype+' style=\'background-image:url(./images/'+imgnum+'.'+ftype+');width:300px;height:100px\';></div>');

                    }
                });
            }
            else if (filelist[i]['type'] == 'video/mp4') {
                $.ajax({
                    url: '/routes/uploadvideo',
                    data: formData,
                    cache: false,
                    contentType: false,
                    processData: false,
                    async: false,
                    type: 'POST',
                    success: function (data) {
                        imgnum = data;
                        //alert(data);
                        var name = $('#name').val();
                        socket.emit('client_send_img', {
                            'name': name,
                            'num': imgnum,
                            'type': ftype,
                        });
                        //$('#divshow').append('<div><p>'+name+':</p></div><div><a class=\'single\' href=\'./images/'+imgnum+'.'+ftype+'\'><img src=./images/'+imgnum+'.'+ftype+' style=\'width:250px;height:180px;\' alt="" / ></a></div>');
                        $('#divshow').append('<div><p>' + name + ':</p><video src="../video/' + imgnum + '.mp4" width="500px" height="400px" controls="controls" ></div>');
                        //$('#divshow').append('<div><p>'+name+':</p></div><div   data-imgid='+imgnum+'.'+ftype+' style=\'background-image:url(./images/'+imgnum+'.'+ftype+');width:300px;height:100px\';></div>');

                    }
                });
            }
            else {
                $('#divshow').append('<div><p>這個檔案不是JPEG/PNG/GIF</p></div>');
            }
        }
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
    }
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

                $('#divsend').append('<img class="de"  class="de" style="width:100px ;height:100px ; " src="' + event.target.result + '"/>');
            }
            // 因為上面定義好讀取成功的事情，所以這裡可以放心讀取檔案


        }


    }

    $("#divshow").on('dragover', drag).on('drop', drop);
    $("#divsend").on('dragover', drag).on('drop', drop);
    ///////



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

    socket.on('server_send_pre', function (data) {
        var fn = JSON.parse(data);
        var tmp = "";
        tmp += "<div style='border:5px solid blue'><p>XXX 上傳了考古題</p>";
        for (var a = 0; a < fn.length; a++) {
            tmp += "<p style='margin:0px auto;'>" + fn[a] + "</p><a href='/routes/pretestdownload?fn=" + fn[a] + "'>下載</a>";
        }
        tmp += "</div>";
        $('#divshow').append(tmp);
        window.scrollTo(0, document.getElementById('divshow').clientHeight);
    });

    //圖片拖拉功能-------------------------------------------------------------------
});


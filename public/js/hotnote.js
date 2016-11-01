var sort = {
    viewCount : $('#viewCount')
}

sort.viewCount.on('click', function(){
    $('#noteSquare').html('');
    $.ajax({
    url: '/notelist/viewCount',
    type: 'POST',
    error: function(xhr) {
      alert('Ajax request 發生錯誤');
    },
    success: function(response) {
        for (var i = 0; i < response.data.length; i++) {
            $('#noteSquare').append('<div class="col-xs-6 col-lg-4"><img src="note.jpg" alt="..." class="img-responsive img-thumbnail" alt="Responsive image" style="width:300px;height:180px"><h2>' + response.profile[i].name + '</h2><p> ' + response.content[i]
                +'<p><a href="http://localhost:3000/' + response.notestring[i] + '" class="btn btn-default" role=button>View details &raquo;</a></div>');
        }
    }
  });
});

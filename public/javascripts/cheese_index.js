//先發ajax 取得登入狀態
function login () {
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
                alert('fff');
                if (response.photo) $('.ui-avatar').prop('src', response.photo).show();
                else $('.ui-avatar').prop('src', '').hide();
                $('.ui-name').html(response.name);
            } else {
                //do nothing
            }
        }
    });
}

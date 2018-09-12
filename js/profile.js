/*global User _config jQuery*/

var User = window.User || {};

(function profileScopeWrapper($) {
    var authToken;
    User.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            $.ajax({
                url: _config.api.invokeUrl + "profileInfo",
                type: "POST",
                data: JSON.stringify({ token: authToken }),
                dataType: "json",
                success: function(data) {
                    $('#user_info').html(data.user_info);
                    if ('highlighted' in data) {
                        $('#highlighted').html(data.highlighted);
                    }
                    if ('subjectTable' in data) {
                        $('#subjectTable_content').html(data.subjectTable);
                    }
                    $('#subjectTable').DataTable({
                        'responsive': true
                    });
                },
                error: function(xhr, status) {
                    console.error(xhr);
                    console.error(status);
                }
            });
        }
        else {
            window.location.href = '/signin.html';
        }
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/signin.html';
    });
}(jQuery));

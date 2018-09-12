/*global User _config jQuery*/

var User = window.User || {};

(function profileScopeWrapper($) {
    var authToken;
    User.authToken.then(function setAuthToken(token) {
        if (token) {
            authToken = token;
            window.location.href = '/profile.html';
        };
    }).catch(function handleTokenError(error) {
        alert(error);
        window.location.href = '/index.html';
    });
}(jQuery));

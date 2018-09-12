/*global User jQuery bootbox, fetch */
var User = window.User || {};

jQuery(document).ready(function($) {
    //open menu
    $('.cd-menu-trigger').on('click', function(event) {
        event.preventDefault();
        $('#cd-main-content').addClass('move-out');
        $('#main-nav').addClass('is-visible');
        $('.cd-shadow-layer').addClass('is-visible');
    });
    //close menu
    $('.cd-close-menu').on('click', function(event) {
        event.preventDefault();
        $('#cd-main-content').removeClass('move-out');
        $('#main-nav').removeClass('is-visible');
        $('.cd-shadow-layer').removeClass('is-visible');
    });

    //clipped image - blur effect
    set_clip_property();
    $(window).on('resize', function() {
        set_clip_property();
    });

    function set_clip_property() {
        var $header_height = $('.cd-header').height(),
            $window_height = $(window).height(),
            $header_top = $window_height - $header_height,
            $window_width = $(window).width();
        $('.cd-blurred-bg').css('clip', 'rect(' + $header_top + 'px, ' + $window_width + 'px, ' + $window_height + 'px, 0px)');
    }

    setTimeout(() => {
        $('.loader-bg').fadeOut('slow');
    }, 1200);


    User.authToken.then(function setAuthToken(token) {
        if (token) {
            $.get('auth-navbar.html', rep => {
                $('#main-nav').html(rep);
                $('#signOut').click(function() {
                    User.signOut();
                    bootbox.alert({
                        message: 'You have been logged out.',
                        backdrop: true,
                        callback: () => {
                            window.location = "/";
                        }
                    });
                });
                $('.cd-close-menu').on('click', function(event) {
                    event.preventDefault();
                    $('#cd-main-content').removeClass('move-out');
                    $('#main-nav').removeClass('is-visible');
                    $('.cd-shadow-layer').removeClass('is-visible');
                });
            });
        }
        else {}
    }).catch(function handleTokenError(error) {
        alert(error);
    });
});

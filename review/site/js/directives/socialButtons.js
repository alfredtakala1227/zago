angular.module('app').directive('socialButtons', function() {

    // Another abstratced piece of re-used code
    ////////////////////////////////////////////////

    var linker = function(scope, element, attrs) {
        scope.socials = [
            {
                'name'  : 'facebook',
                'url'   : 'https://www.facebook.com/zago',
                'class' : 'fb_btn',
                'order' : 0
            },
            {
                'name'  : 'twitter',
                'url'   : 'https://twitter.com/zagonyc',
                'class' : 'tw_btn',
                'order' : 1
            },
            {
                'name'  : 'behance',
                'url'   : 'https://www.behance.net/Zagolovesyou',
                'class' : 'be_btn',
                'order' : 2
            },
            {
                'name'  : 'pinterest',
                'url'   : 'http://www.pinterest.com/zagolovesyou',
                'class' : 'pi_btn',
                'order' : 3
            },
            {
                'name'  : 'linkedin',
                'url'   : 'https://www.linkedin.com/company/zago',
                'class' : 'li_btn',
                'order' : 4
            },
            {
                'name'  : 'email',
                'url'   : 'mailto:info@zagollc.com',
                'class' : 'ma_btn',
                'order' : 5
            }
        ];
    };

    return {
        restrict: "A",
        templateUrl: 'pieces/social_buttons.html',
        link: linker
    };
});
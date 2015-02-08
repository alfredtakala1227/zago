angular.module('app').controller('HomeCtrl', function($scope, $rootScope, $timeout, $interval, Functions, Preloader, Storage){

    $rootScope.pageView = "homePage";
    $scope.setPageTitle();

    var posts = JSON.parse(Storage.site).home;
    $scope.hero = posts.banners[0];
    $scope.blurb = posts.blurb[0];
    $scope.sections = posts.sections;

    // Section Nav scrolling event listener & logic
    ////////////////////////////////////////////////////////////////////////////////////
    $rootScope.$on('$viewContentLoaded', function(){
        // if it IS the homepage
        if ($rootScope.pageView === "homePage") {
            try { // Workaround for $rootScope.$on checking on every view instead of just homePage
                $timeout(function(){ setDimensions(); });
                Functions.setListener(  window, 'resize', Functions.throttle(setDimensions, 10));
                Functions.setListener(window, 'scroll', Functions.throttle(pinMenu, 10)); }
            catch (error) { }
        }
    });

    var pieces; // Get & Set Dimensions and add menu scroll listener once Preloader finishes
    function setDimensions(){ pieces = getDimensions(); pinMenu(); };

    function getDimensions(){
        var dims = {
            'blurb' : document.getElementById('homeBlurb'),
            'nav' : document.getElementById('sectionNav'),
            'sections' : document.getElementById('homeSections').children,
            'links' : [],
            'navPos' : '',
            'endPos' : ''
        };

        dims.links = dims.nav.children[0].children;
        dims.navPos = dims.blurb.offsetTop + (dims.blurb.scrollHeight - dims.nav.scrollHeight);
        dims.endPos = dims.sections[dims.sections.length - 1].offsetTop + dims.sections[dims.sections.length-1].scrollHeight;

        return dims;
    };

    function pinMenu() {
        // get current Scroll position (fires every pixel)
        // timeout applies updated isActive variable
        $timeout(function(){
            var winPos = window.pageYOffset;
            var scrollPos = winPos + pieces.nav.scrollHeight + 10;
            // If scroll position is above highest point of nav, release nav
            if (winPos <= pieces.navPos) {
                pieces.nav.classList.remove('pinned');
                $scope.isActive = '';
                // if scroll position is below lowest section point, release active class
            } else if (winPos >= pieces.endPos) {
                pieces.nav.classList.add('pinned');
                $scope.isActive = '';
                // otherwise if scroll position is in section area, pin nav to top and activate actie class
            } else {
                pieces.nav.classList.add('pinned');
                // Check the x/y dimensions against scroll position (including nav height)
                for (var i = 0; pieces.sections.length > i; i++) {
                    // if scroll position is within current section, set active class
                    if (scrollPos > pieces.sections[i].offsetTop && scrollPos < (pieces.sections[i].offsetTop + pieces.sections[i].scrollHeight)) {
                        $scope.isActive = pieces.sections[i].id;
                        break;
                    }
                    // If this is the last iteration of loop (not in any sections) empty isActive class
                    else if (i == (pieces.sections.length - 1)) { $scope.isActive = ''; }
                };
            }
        });
    };

});
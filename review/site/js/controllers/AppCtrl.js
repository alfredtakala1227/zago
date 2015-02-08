angular.module('app').controller('AppCtrl', function($scope, $rootScope, $timeout, Functions, Storage){

    // App-general Functions
    ////////////////////////////////////////////////////////////////////////////////////
    $scope.route = Functions.route;
    $scope.toggleMenu = Functions.toggleMenu;
    $scope.viewProject = Functions.viewProject;
    $scope.setPageTitle = Functions.setPageTitle;
    $scope.anchorTo = Functions.anchorTo;
    $scope.scrollTop = Functions.scrollTop;
    $scope.colors = ['#00ffff','#ffff00','#ff00ff','#00ff00'];

    // Show/Hide ScrollToTop button functionality
    window.addEventListener('scroll', Functions.throttle(Functions.showScroll, 200));

    // Splash Page configuration
    ////////////////////////////////////////////////////////////////////////////////////
    // (function splashPage() {
    //     // If first time visiting site via mobile, flash splashpage
    //     if (!Storage.splashed && (Modernizr.phone)) {
    //         $scope.showSplash = true;
    //         Functions.disableScroll(true);
    //     }
    // })();

    // // Button to hide splash page and show full site
    // $scope.hideSplash = function() {
    //     Storage.splashed = true;
    //     $scope.showSplash = false;
    //     Functions.disableScroll(false);
    // };

});
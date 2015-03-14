angular.module('app').controller('LegacyCtrl', function($scope, $rootScope, $state, Functions, Storage){

    $scope.setPageTitle('Outdated Browser');

    // Set Notice Height to Window Height, monitor resize event
    function setBodyHeight(){
        document.getElementById('legacy-notice').style.minHeight = (((window.innerHeight || document.documentElement.clientHeight)-200) + 'px');
    }; setBodyHeight();

    window.addEventListener('resize', setBodyHeight);

    Functions.hideAppElements();

});
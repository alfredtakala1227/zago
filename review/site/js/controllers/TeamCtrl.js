angular.module('app').controller('TeamCtrl', function($scope, $rootScope, Functions, Preloader, Storage){

    $rootScope.pageView = "teamPage";
    $scope.setPageTitle('The Team');

    var posts = JSON.parse(Storage.site).team;
    $scope.blurb = posts.blurb[0];
    $scope.members = posts.members.shuffle();

});
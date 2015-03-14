angular.module('app').controller('ProjectsCtrl', function($scope, $rootScope, Storage, Preloader, Styling){

    $rootScope.pageView = "projectsOverviewPage";
    $scope.setPageTitle('Projects');

    var posts = JSON.parse(Storage.site).project;
    $scope.blurb = posts.blurb[0];
    $scope.projects = posts.projects;

    (function randomizeHoverColors(){
        colors = $scope.colors.shuffle();
        var styles = '';
        for (var i = 0; colors.length > i; i++) {
            styles = styles.concat('.projectWrapper .grid section:nth-of-type('+(i+1)+') .imgWrapper .overlay{background-color:'+colors[i]+'}');
        };
        Styling.clear();
        Styling.add(styles);
    })();

});
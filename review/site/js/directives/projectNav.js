angular.module('app').directive('projectNav', function(){

    var linker = function($scope, element, attrs){

    };

    return {
        restrict: 'A',
        templateUrl: '../pieces/project_nav.html',
        replace: true,
        link : linker
    }
});
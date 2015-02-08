angular.module('app').directive('imageLoader', function(){

    var linker = function(scope, element, attrs){
        var loader = document.createElement('div');
        var wheel = document.createElement('div');
        loader.setAttribute('class', 'loaderBox');
        wheel.setAttribute('class', 'loader');
        loader.appendChild(wheel);
        element[0].appendChild(loader);
        element[0].classList.add('loaderWrapper');
    };

    return {
        restrict: 'A',
        link: linker
    }
});
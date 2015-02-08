angular.module('app').directive('precisionImage', function($timeout, Functions){

    var linker = function($scope, element, attrs){
        // Add Custom Image Positioning classes
        if (attrs.precisionImage) {
            var classes = JSON.parse(attrs.precisionImage);
            for (var i = 0; classes.length > i; i++) {
                element[0].classList.add(classes[i]);
            };
        }

        var image = element[0];
        var wrapper = image.parentNode;

        function checkRatio(){
            if (attrs.aspectRatio / (wrapper.clientHeight / wrapper.clientWidth) > 1) {
                image.classList.add('stretch');
            } else { image.classList.remove('stretch'); }
        };

        var listener = window.addEventListener('resize', Functions.throttle(checkRatio, 100));

        $timeout(checkRatio);

        $scope.$on('$destroy', function(){
            window.removeEventListener('resize', Functions.throttle(checkRatio, 100));
        });

    };

    return {
        restrict: 'A',
        link : linker,
        scope: true
    }
});
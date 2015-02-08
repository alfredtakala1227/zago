angular.module('app').directive('rotateImages', function($interval){
    var linker = function($scope, element, attrs){

        function getImages(){
            var elems = element[0].children;

            var images = [];
            // Get IMG Tags
            for (var r = 0; elems.length > r; r++) {
                if (elems[r].tagName == 'IMG') {
                    images.push(elems[r]);
                }   }

            return images;
        };


        function rotateImages(){
            var images = getImages();
            // @BUG This is acting funny, 95% working, but has some weird issues
            // If img is last in array, set NEXT to first image, else set to next image in array
            $scope.lastBanner = $scope.activeBanner;
            $scope.activeBanner = ($scope.activeBanner + 1) % images.length;
            console.log($scope.activeBanner);
        };

        var timer;
        var waitTiming = 4000; // how long each slide remains active
        $scope.setTimer = function(){
            $scope.activeBanner = 0;
            $scope.lastBanner;
            // Set rotation interval
            timer = $interval(rotateImages, waitTiming);
        };

        $scope.$watch(function(){ return element; }, function(){
            $scope.setTimer();
        });

        $scope.$on('$destroy', function() {
            // Clear old timers
            $interval.cancel(timer);
            $scope.timer = undefined;
        });

    };

    return {
        restrict: 'A',
        link: linker
    }


});
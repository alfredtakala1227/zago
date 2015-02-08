angular.module('app').directive('underZ', function() {

    // Add to any element where an "underlined Z" may be used

    var linker = function(scope, element, attrs) {
        element[0].innerHTML = scope.str.replaceAll(' Z ', ' <u class="z">Z</u> ');
    }

    return {
        restrict: "A",
        scope: { str: "@" },
        link: linker
    };
});
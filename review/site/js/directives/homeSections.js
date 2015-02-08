angular.module('app').directive('homeSections', function() {

    // Dynamically grab and set the home section's
    // key words and highlight colors
    ////////////////////////////////////////////////

    var linker = function(scope, element, attrs) {
        // scope.banner_caption.first = 
        var words = scope.section.content.caption.trim().split(" ");
        var colors = ['blue', 'yellow', 'pink', 'green'];

        scope.caption = {
            'first' : words[0],
            'last' : words[1] + ' ' + words[2],
            'color' : colors[(scope.$index % 4)]
        }
    }

    return {
        restrict: "A",
        templateUrl: 'pieces/home_sections.html',
        link: linker
    };
});
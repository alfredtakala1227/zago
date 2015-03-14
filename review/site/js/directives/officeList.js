angular.module('app').directive('officeList', function() {

    // Just an abstratced piece of re-used code
    ////////////////////////////////////////////////

    var linker = function(scope, element, attrs) {

        scope.offices = [
            {
                'location': 'New York',
                'address'    : '392 Broadway, 2nd Floor',
                'region'  : 'New York, NY 10013',
                'phone'   : '+1 212 219 1606'
            },
            {
                'location': 'Rio de Janeiro',
                'address'    : 'R Benjamim Batista, 153',
                'region'  : 'Rio de Janeiro, RJ 22461-120',
                'phone'   : '+55 21 3627 7529'
            },
            {
                'location': 'Geneva',
                'address'    : '37 rue Eug&egrave;ne-Marziano',
                'region'  : 'CH-1227 Gen&egrave;ve',
                'phone'   : '+41 22 548 0480'
            }
        ];
    }

    return {
        restrict: "A",
        templateUrl: 'pieces/office_list.html',
        link: linker
    };
});
angular.module('app').controller('ProjectDetailCtrl', function($scope, $rootScope, $stateParams, Storage, Preloader){

    $rootScope.pageView = "projectPage";

    var posts = JSON.parse(Storage.site).project;

    // Get CURRENT, NEXT & PERVIOUS project IDs based on SITE TREE position (Project Sub-Nav)
    ////////////////////////////////////////////////////////////////////////////////////
    $scope.project = null;
    for (var i = 0; posts.projects.length > i; i++) {
        if (posts.projects[i].id == $stateParams.project) {
            $scope.project = posts.projects[i];
            if (i == 0) { // If THIS project is the first one
                $scope.nextProject = posts.projects[(i+1)];
                $scope.prevProject = posts.projects[(posts.projects.length-1)];
            } else if (i == (posts.projects.length - 1)) { // If THIS project is the last one
                $scope.nextProject = posts.projects[(0)];
                $scope.prevProject = posts.projects[(i-1)];
            } else { // If THIS project is any of the interior ones
                $scope.nextProject = posts.projects[(i+1)];
                $scope.prevProject = posts.projects[(i-1)];
            }

            // if there are less than 3 projects in the site tree
            if (posts.projects.length < 3) {
                if (i == 0) {
                    $scope.nextProject = posts.projects[(1)];
                    $scope.prevProject = posts.projects[(0)]; }
                else {
                    $scope.nextProject = posts.projects[(0)];
                    $scope.prevProject = posts.projects[(1)]; }
            }

            break;
        }
    }

    // If project exists, extract image urls and preload images
    if ($scope.project) {

        $scope.setPageTitle($scope.project.title);

        var sections = $scope.project.content.image_sections;

        // Construct Image Object
        ///////////////////////////////////////////////////////
        $scope.imageSections = [];
        for (var o = 0; sections.length > o; o++) {
            var temp = {
                'label' : sections[o].label,
                'order' : sections[o].order,
                'images' : [{
                    'url' : sections[o].url,
                    'alt' : sections[o].alt,
                    'position' : sections[o].position,
                    'aspectRatio' : sections[o].aspectRatio
                }]
            };

            // If this Image and Next Image are part of a pair
            // Then Advance loop $index ahead by one and pair img urls together
            if (sections[o].half && sections[o+1].half) {
                o++;
                temp.images.push({
                    'url' : sections[o].url,
                    'alt' : sections[o].alt,
                    'position' : sections[o].position,
                    'aspectRatio' : sections[o].aspectRatio
                });
            }

            $scope.imageSections.push(temp);
        };


        ///////////////////////////////////////////////////////
        // Else redirect back to projects overview page if project doesn't exist
    } else { $scope.route('projects', true); }

});
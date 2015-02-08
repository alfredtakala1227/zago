$(document).ready(function(){

    // Simulate click action on touch screen tap (hopefully)
    // @BUG not sure if this is really working or not
    $('button#menuButton').on('tap', function(){ $(this).click(); });

    // function to display Modernizr classes (append to end of DOM)    
    function cssTester(){
        var HTMLclasses= $('html')[0].classList;
        var wrap = document.createElement('div');
        wrap.classList.add('tester_classes');
        for (var i = 0; HTMLclasses.length > i; i++) {
            var sect = document.createElement('div');
            sect.innerHTML = HTMLclasses[i];
            wrap.appendChild(sect);
        };
        document.body.appendChild(wrap);
    };

    // cssTester();   

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var app = angular.module('app', ['ui.router', 'ngSanitize', 'duScroll']);

app.config(['$stateProvider', '$urlRouterProvider', '$locationProvider',
    function($stateProvider , $urlRouterProvider, $locationProvider) {

        $urlRouterProvider.otherwise('/');

        $stateProvider
        .state('home', { 
            url: '/',
            templateUrl: 'views/home.html',
            controller: 'HomeCtrl'
        })
        .state('projects', { 
            url: '/projects',
            templateUrl: 'views/projects.html',
            controller: 'ProjectsCtrl'
        })
        .state('project', {
            url: '/projects/:project',
            templateUrl: 'views/project.html',
            controller: 'ProjectDetailCtrl'
        })
        .state('team', { 
            url: '/team',
            templateUrl: 'views/team.html',
            controller: 'TeamCtrl'
        })
        .state('love', { 
            url: '/zagolovesyou',
            templateUrl: 'views/love.html',
            controller: 'LoveCtrl'
        })
        .state('error', { 
            url: '/error',
            templateUrl: 'views/error.html',
            controller: 'ErrorCtrl'
        })
        .state('legacy', { 
            url: '/legacy',
            templateUrl: 'views/legacy.html',
            controller: 'LegacyCtrl'
        });

        $locationProvider.html5Mode(true);
}]);

app.run(function($rootScope, $state, SiteLoader, Storage, Functions, $window) {

    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams){


        
        // If the Site Data is missing, stop navigation and retreive data
        // Cache timer for Storage (24hrs: 86400000 1hr: 3600000 1min: 60000)
        //////////////////////////////////////////////////////////////////////////
        var newTimestamp = new Date().getTime();
        // Set Time of User Entry (default to 24hr reset)
        Storage.dailyTimestamp = (Storage.dailyTimestamp && Storage.dailyTimestamp > (newTimestamp - 86400000)) ? Storage.dailyTimestamp : newTimestamp;
        // If the Storage Site object is empty or older than X, reload Wordpress data tree (default to 1hr reset)
        if (!Storage.site || !Storage.dataTimestamp || (Storage.dataTimestamp < newTimestamp - 3600000)) {
            event.preventDefault();
            SiteLoader.getRawData().then(function(data){
                var site, posts;
                // If object returned is some fucked up IE shit (ie String), parse it
                site = data.responseText || data.data;
                if (typeof site == 'string') { site = JSON.parse(site); }
                // Get & Store Posts Tree
                posts = SiteLoader.getPosts(site);
                Storage.site = JSON.stringify(posts);
                Storage.dataTimestamp = newTimestamp;
                $rootScope.site = posts;

                // Continue to Destination
                $state.go(to.name, toParams);
            });
        }

        // Remove page-specific event listeners
        Functions.removeListeners();
        
    });

    $rootScope.$on( "$stateChangeSuccess", function(event, to, toParams, from, fromParams) {


    });
});
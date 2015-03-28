$(document).ready(function(){

    // Simulate click action on touch screen tap (hopefully)
    // @BUG not sure if this is really working or not
    $('*').on('tap', function(){ $(this).click(); });

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
            templateUrl: 'partials/home.html',
            controller: 'HomeCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        })
        .state('projects', { 
            url: '/projects',
            templateUrl: 'partials/projects.html',
            controller: 'ProjectsCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        })
        .state('project', {
            url: '/projects/:project',
            templateUrl: 'partials/project.html',
            controller: 'ProjectDetailCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        })
        .state('team', { 
            url: '/team',
            templateUrl: 'partials/team.html',
            controller: 'TeamCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        })
        .state('love', { 
            url: '/zagolovesyou',
            templateUrl: 'partials/love.html',
            controller: 'LoveCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        })
        .state('legacy', { 
            url: '/legacy',
            templateUrl: 'partials/legacy.html',
            controller: 'LegacyCtrl',
            resolve: {
                SiteLoader: AppCtrl.SiteLoader
            }
        });

        $locationProvider.html5Mode(true);
}]);

app.run(function($rootScope, $state, SiteLoader, Storage, Functions, $window) {

    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams){

        // Remove page-specific event listeners
        Functions.removeListeners();

        var menuOpen = $('#mainNav').hasClass('menu-open'),
            menuTimer = 550;

        if (menuOpen) {
            event.preventDefault();

            Functions.toggleMenu(true);
            setTimeout(function(){ $state.go(to.name, toParams); }, menuTimer);

        } else {
            $rootScope.currentState = to.name;
        }
        
    });

    $rootScope.$on( "$stateChangeSuccess", function(event, to, toParams, from, fromParams) {
        console.log($state);

    });
});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Factories / Services / Directives
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.factory('Storage', function(){
    var db = window.localStorage;
    // Test that LocalStorage works, return Angular object if disabled
    // @BUG this needs to be much more extensive (search for existing Angular storage factory/service)
    try {
        db.testKey = '1';
        delete db.testKey;
        return db; }
    catch (error) {
        return {}; }
});

app.factory('SiteLoader', function($http, $q, $rootScope){

    // Wordpress API call for site post data
    var reqUrl = 'http://admin.zagollc.com/wp-json/posts?filter[posts_per_page]=1000';

    // Custom sorter function to arrange post tree via 'order' property
    function sorter(a,b) {
        var first  = parseInt(a.order),
            second = parseInt(b.order);

        if ( first < second ) return -1;
        if ( first > second ) return 1;
        return 0;
    }

    return {
        // Call for Site Data, when a promise
        'getRawData' : function(){

            // $rootScope.isLoading = true; // @LOADER

            var deferred = $q.defer();
            // If some fucked up IE feature exists, use it
            if(window.XDomainRequest){
                var xdr = new XDomainRequest();
                xdr.open("get", reqUrl);
                xdr.onprogress = function () { };
                xdr.ontimeout = function () { };
                xdr.onerror = function () { };
                xdr.onload = function() {
                  deferred.resolve(xdr);                  
                }
                setTimeout(function () {xdr.send();}, 0);
            // Otherwise, use implementation of every other browser in existence
            } else {
                deferred.resolve($http.get(reqUrl));
            }
            return deferred.promise;
        },

        // Parse raw site data into data tree to be used with App
        'getPosts' : function(rawData){
            console.log(rawData);

            function ternValue(object, i) {
                if (i) {
                    var index = i || 0;
                    return object ? object[index] : null; }
                else {
                    return object ? object : null; }
            }

            function splitCSV(str) {
                // Remove whitespace and split by ','
                var arr = str.replace(/, /g,',').split(",");

                // Remove empty pieces
                for(var i = arr.length; i >= 0; i--) {
                    if(arr[i] === ""){
                        arr.splice(i, 1);
                    }
                }

                return arr;
            };

            function aspectRatio(width, height){
                return (height / width);
            }

            // Structure Site Posts object 
            function postTree(Site){
                var tree = {
                    'home' : {
                        'blurb' : [],
                        'banners' : [],
                        'sections': [],
                        'images': [],
                        'preloaded': false
                    },
                    'project': {
                        'blurb' : [],
                        'projects': [],
                        'images': [],
                        'preloaded': false
                    },
                    'team' : {
                        'blurb': [],
                        'members': [],
                        'images': [],
                        'preloaded': false
                    }
                };

                // Categorize Posts into Site object
                for (var i = 0; Site.length > i; i++) {
                    // Assign Current Post to variable
                    var post = Site[i];

                    // Check if Post has been given 2 Categories (bad)
                    if (post.terms.category.length == 1 && post.status == 'publish') {

                        // General temp Post Object
                        var temp = {
                            'id' : post.ID,
                            'title' : ternValue(post.title),
                            'order' : ternValue(post.acf.arrangement),
                            'body' : post.acf.content ? post.acf.content : post.content,
                            'content' : { }
                        };
                        
                        var images = [];

                        // Populate temp Post Object according to Post Type
                        //////////////////////////////////////////////////////////////////////////////
                        if (post.terms.category[0].slug == 'home-hero-banner') {
                            
                            temp.content = {
                                'banner_caption' : ternValue(post.acf.banner_caption),
                                'images' : []
                            };

                            for (var h = 0; post.acf.banner_images.length > h; h++) {
                                var obj = {
                                    'url' : post.acf.banner_images[h].image.url,
                                    'alt' : ternValue(post.acf.banner_images[h].alt),
                                    'order' : ternValue(post.acf.banner_images[h].arrangement),
                                    'position' : ternValue(post.acf.banner_images[h].positioning),
                                    'aspectRatio' : aspectRatio(post.acf.banner_images[h].image.width, post.acf.banner_images[h].image.height)
                                }

                                temp.content.images.push(obj);
                                tree.home.images.push(obj.url);
                            }

                            tree.home.banners.push(temp);
                            continue;
                        }

                        if (post.terms.category[0].slug == 'home-section' && tree.home.sections.length < 4) {
                            temp.content = {
                                'id' : ternValue(post.acf.banner_image.id),
                                'alt' : ternValue(post.acf.banner_image.alt),
                                'url': ternValue(post.acf.banner_image.url),
                                'caption' : ternValue(post.acf.banner_caption),
                                'position' : ternValue(post.acf.positioning),
                                'aspectRatio' : aspectRatio(post.acf.banner_image.width, post.acf.banner_image.height)
                            };

                            tree.home.images.push(temp.content.image_url);
                            tree.home.sections.push(temp);
                            continue;
                        }

                        if (post.terms.category[0].slug == 'home-blurb') {
                            temp.body = ternValue(post.content);

                            tree.home.blurb.push(temp);
                            continue;
                        }

                        if (post.terms.category[0].slug == 'projects-blurb') {
                            temp.body = ternValue(post.content);

                            tree.project.blurb.push(temp);
                            continue;
                        }

                        if (post.terms.category[0].slug == 'project') {

                            temp.title = ternValue(post.acf.title);

                            temp.content = {
                                'name' : ternValue(post.title),
                                'slug' : post.slug,
                                'case_study' : post.acf.case_study,
                                'client' : ternValue(post.acf.client),
                                'services' : ternValue(splitCSV(post.acf.services)),
                                'project' : ternValue(splitCSV(post.acf.project)),
                                'other_details' : ternValue(post.acf.other_details),
                                'project_url' : ternValue(post.acf.project_url),
                                'social_media' : ternValue(post.acf.social_media),
                                'read_about' : ternValue(post.acf.read_about),
                                'related_projects' : ternValue(post.acf.related_projects),
                                'featured_image' : {},
                                'image_sections' : [],
                                'images' : []
                            };

                            for ( var q = 0; temp.content.other_details.length > q; q++){
                                temp.content.other_details[q].details = splitCSV(temp.content.other_details[q].details);
                            }

                            // Get project images outside of repeater array                       
                            if (post.acf.images && post.acf.images.length) {
                                for (var d = 0; post.acf.images.length > d; d++) {
                                    var obj = {
                                        'url' : post.acf.images[d].image.url,
                                        'alt' : post.acf.images[d].image.alt,
                                        'label' : post.acf.images[d].label,
                                        'order' : post.acf.images[d].arrangement,
                                        'half' : post.acf.images[d].half,
                                        'position' : ternValue(post.acf.images[d].positioning),
                                        'aspectRatio' : aspectRatio(post.acf.images[d].image.width, post.acf.images[d].image.height)
                                    };

                                    // Skip first image (featured image)
                                    if (d > 0) { temp.content.image_sections.push(obj); }
                                    else { temp.content.featured_image = obj; }

                                    temp.content.images.push(obj);
                                }
                            }

                            tree.project.images.push(temp.content.featured_image.url);
                            tree.project.projects.push(temp);

                            continue;
                        }

                        if (post.terms.category[0].slug == 'team-blurb') {
                            temp.body = ternValue(post.content);

                            tree.team.blurb.push(temp);
                            continue;
                        }

                        if (post.terms.category[0].slug == 'team-member') {
                            temp.content = {
                                'position' : ternValue(post.acf.position),
                                'accounts' : ternValue(post.acf.accounts),
                                'featured_image' : (post.acf.profile_picture && post.acf.profile_picture.url) ? post.acf.profile_picture.url : null,
                                'funny_picture' : (post.acf.funny_picture && post.acf.funny_picture.url) ? post.acf.funny_picture.url : null,
                                'images' : {
                                    'featured' : ternValue(post.acf.profile_picture),
                                    'funny'    : ternValue(post.acf.funny_picture)
                                }
                            };

                            tree.team.images.push(temp.content.featured_image);
                            temp.content.funny_picture ? tree.team.images.push(temp.content.funny_picture) : '';
                            
                            tree.team.members.push(temp);
                            continue;
                        }
                    }
                }

                // Retrieve and Store each project's Related Projects info
                // For each project in Site Tree once tree has been compiled
                var projects = tree.project.projects;
                for (var o = 0; projects.length > o; o++) {
                    var related = projects[o].content.related_projects || [];
                    var details = [];
                    // For each Related Project of currently selected project
                    for (var p = 0; related.length > p; p++) {
                        // Loop thru each project again and find ID match
                        for (var r = 0; projects.length > r; r++) {
                            if (related[p] == projects[r].id) {
                                var obj = {
                                    'id' : projects[r].id,
                                    'title' : projects[r].title,
                                    'client' : projects[r].content.client,
                                    'image' : projects[r].content.featured_image,
                                    'slug' : projects[r].content.slug
                                };
                                details.push(obj);
                                projects[o].content.images.push(obj.image.url);
                                break;
                    }   }   }
                    // Assign/Push new Related Pojects obj into tree
                    projects[o].content.related_projects = details;
                }

                // Sort projects object via arrangement parameter
                tree.project.projects.sort(sorter);

                console.log(tree);
                return tree;
            };

            $rootScope.isLoading = false;
            return postTree(rawData);
        }
    }
});

app.factory('Styling', function(){
    var div = document.createElement('style');
    div.id = "stylesheet";
    div.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(div);

    return {
        'add' : function(str){ div.innerHTML = div.innerHTML.concat(str); },
        'clear' : function(){ div.innerHTML = ''; }
    }
});

app.factory("Functions", function( $q, $http, $rootScope, $templateCache, $state, Storage, $document, $timeout ) {
    
    //////////////////////////////////////////////////////////////////////
    // Methods, Properties and Values Used/Shared throughout entire site
    //////////////////////////////////////////////////////////////////////


    // Data Elements
    ////////////////////////////////////////////////////////////////
    var eventListeners = []; // Stor
    var preloadedImages = []; // Store preloaded pageView src's so image loading isn't repeatede page-specific eventListeners for removal in stateChange

    // DOM Elements
    ////////////////////////////////////////////////////////////////
    var dom = getDOM();

    function getDOM(){
        var dom = {
            'body' : document.body,
            'content' : document.getElementById('pageContent'),
            'footer' : document.getElementById('footer'),
            'menuBtn' : document.getElementById('menuButton'),
            'mainNav' : document.getElementById('mainNav'),
            'mainMenu' : document.getElementById('menuWrapper'),
            'sectionNav' : document.getElementById('sectionNav'),
            'scrollTopBtn' : document.getElementById('scrollTop'),
            'siteID' : document.getElementById('siteID'),
            'prompt' : document.getElementById('menuPrompt')
        };

        return dom;
    };

    $rootScope.$on('$viewContentLoaded', function(){
        // Checks to see that image preloading isn't still processing
        dom = getDOM();
    });

    // Helper Functions
    ////////////////////////////////////////////////////////////////

    function prevent(e){ 
        e.preventDefault();
    };

    function stopProp(e){ 
        e.stopPropagation();
    };

    function reloadSite(){
        setTimeout(function(){
            Storage.clear();
            location.reload();
            return;
        }, 100);
    };

    function checkPrompt(){
        // If user hasn't been prompted/clicked the menu, show prompt (else hide)
        if (!Storage.prompted) { 
            dom.prompt.classList.remove('marquee');
            // $timeout to let class removal trigger first
            $timeout(function(){ dom.prompt.classList.add('marquee'); }); 
        } else { hidePrompt(); }
    };

    checkPrompt();

    function hidePrompt(){
        // Function to hide menuPrompt
        dom.prompt.classList.add('hiding');
        setTimeout(function(){
            dom.prompt.classList.remove('marquee');
        }, 500);
    };

    // AAAAARRRRRRGHGHGHGHGGHGH
    // // @BUG
    // function disableScroll(set){
    //     if (set) {
    //         dom.body.classList.add('hidden');
    //         dom.body.addEventListener('touchmove', prevent, true);
    //         // dom.mainNav.addEventListener('touchmove', stopProp);
    //         $(dom.body).css('height', window.innerHeight+'px');
    //     } else {
    //         dom.body.classList.remove('hidden');
    //         dom.body.removeEventListener('touchmove', prevent, true);
    //         // dom.mainNav.removeEventListener('touchmove', stopProp);
    //         $(dom.body).css('height', '');
    //     }
    // };

    // Object Menthods
    ////////////////////////////////////////////////////////////////
    var Functions = {
    
        'checkPrompt' : checkPrompt,

        'hidePrompt' : hidePrompt,

        'reloadSite' : reloadSite,

        // 'disableScroll' : disableScroll,

        'anchorTo' : function(anchor) {
                var elem = document.getElementById(anchor);
                var menuHeight = dom.sectionNav.scrollHeight;
                $document.scrollToElement(elem, menuHeight, '500');
            },

        'hideAppElements' : function(){
            dom.siteID.style.display = 'none';
            dom.mainNav.style.display = 'none';
            dom.menuBtn.style.display = 'none';
            dom.prompt.style.display = 'none';
            dom.footer.style.display = 'none';
            },

        'route' : function(route, turnOff, params) {

                var params = params || {};
                var menuOpen = dom.mainNav.classList.contains('menu-open');
                Functions.toggleMenu(turnOff);

                // if route is different, or params are different (stringified object comparison), then route to new destination
                if ($state.current.name != route || JSON.stringify($state.params) != JSON.stringify(params)) {
                    // pause for menu animation if routing while menu was open [500ms menu animation, 50ms toggle delay]
                    if (menuOpen) { setTimeout(function(){ $state.go(route, params); }, 550); }
                    else { $state.go(route, params); }
                // If route is same as current view, scrollTop()
                } else { this.scrollTop(); }
            },

        'removeListeners' : function(){
                var arr = eventListeners;
                for (var i = 0; arr.length > i; i++) {
                    arr[i].obj.removeEventListener(arr[i].evt, arr[i].func, arr[i].bub)
                };
                eventListeners = [];
            },

        // Set page-specific event listener's
        //(removed @ $stateChangeStart by Functions.removeListeners)
        'setListener' : function(obj, evt, func, bub){
                obj.addEventListener(evt, func, bub);
                eventListeners.push({
                    'obj' : obj,
                    'evt' : evt,
                    'func': func,
                    'bub' : bub
                });
            },

        'setPageTitle' : function(str) {
                var headTitle = document.getElementsByTagName('title')[0];
                str = str ? (' | ' + str) : '';
                str = ' | Under Construction';
                headTitle.innerHTML = 'Zago' + str;
            },

        'showScroll' : function() {
                // @BUG onload dom timing isn't being caught properly
                if (window.pageYOffset > 200) { dom.scrollTopBtn.classList.add('show'); }
                else { dom.scrollTopBtn.classList.remove('show'); }
            },

        'scrollTop' : function() {
                $document.scrollTo(0, 0, 500);
            },

        'throttle' : function(fn, threshhold, scope) {
                threshhold || (threshhold = 250);
                var last, deferTimer;
                return function () {
                    var context = scope || this;
                    var now = +new Date,
                    args = arguments;
                    if (last && now < last + threshhold) {
                        // hold on to it
                        clearTimeout(deferTimer);
                        deferTimer = setTimeout(function () {
                            last = now;
                            fn.apply(context, args);
                        }, threshhold);
                    } else {
                        last = now;
                        fn.apply(context, args);
                    }
                };
            },

        'toggleMenu' : function(turnOff){

                // Delete tree if Shift key is pressed when menuButton clicked (hidden admin function)
                try {
                    if (event && event.shiftKey && event.target.id == 'menuButton') {
                        reloadSite();
                        return; } }
                catch (error) { }

                function close(){

                        dom.body.classList.remove('hidden');
                        setTimeout(function(){mainNav.classList.remove('menu-open')}, 50); // timeout for Firefox animation fix (pretty glitchy tho)
                        dom.menuBtn.classList.remove('menu-open');
                        dom.content.classList.remove('menu-open');
                        dom.content.removeEventListener('click', close, true); // (bug) Doesn't remove until content area is actually clicked
               
                };

                function open(){

                        setTimeout(function(){mainNav.classList.add('menu-open')}, 50); // timeout for Firefox animation fix (pretty glitchy tho)
                        dom.menuBtn.classList.add('menu-open');
                        dom.content.classList.add('menu-open');
                        dom.content.addEventListener('click', close, true);

                        // If first time user opens menu, hide menuPrompt
                        if (!Storage.prompted) {
                            Storage.prompted = true;
                            hidePrompt();
                        };
             
                };

                // Toggle Logic
                // If turnoff var true, and menu-open, close menu. if menu closed, do nothing
                // if turnoff var false, close menu if open, open if close
                if (turnOff) {
                    if (turnOff && dom.mainNav.classList.contains('menu-open')) {
                        close();
                    }
                } else {
                    if (dom.mainNav.classList.contains('menu-open')) { close(); }
                    else { open(); }
                }
            },

        'viewProject' : function(id){
                Functions.route('project', true, {'project':id});
            },

        'getTemplate' : function(tree, branch, baseURL) {
                var base = baseURL || '../../pieces/';
                var templateUrl = base + tree[branch];
                console.log(templateUrl);

                var templateLoader = $http.get(templateUrl, {cache: $templateCache});

                return templateLoader;

            },

        'testFunction' : function(test){
                console.log(test || 'test');
            }
    }

    return Functions;
});

////////////////////////////////////////////////////////////////////////////////////

// app.directive('grid', function($compile, $http, $templateCache) {

    //     function newDiv(classes) {
    //         var elem = document.createElement('div');
    //         elem.setAttribute('class', classes || '');

    //         return elem;
    //     };

    //     var getTemplate = function(contentType) {
    //         var baseUrl = '../pieces/';
    //         var templateMap = {
    //             members: 'team_section.html',
    //             projects: 'project_section.html'
    //         };

    //         var templateUrl = baseUrl + templateMap[contentType];
    //         var templateLoader = $http.get(templateUrl, {cache: $templateCache});

    //         return templateLoader;

    //     }

    //     var linker = function(scope, element, attrs) {

    //         function parseSections(sections, template){

    //             var wrapper = newDiv('directiveElement');
    //             var i, gridWrapper, gridSection, section;

    //             for(i = 0; sections.length > i; i++ ) {

    //                 section = newDiv('ngTemplate '+i); // dummy for sections[i] (ngTemplate)

    //                 // for Every 3 sections (or the first) create a new .grid div
    //                 if (i % 3 == 0) {  
    //                     gridSection = newDiv('grid');
    //                     // If its a new set of 6 (or the first)
    //                     if (i % 6 == 0) { 
    //                         // create new .gridWrapper and set .grid to .gridLeft
    //                         gridWrapper = newDiv('gridWrapper');
    //                         wrapper.appendChild(gridWrapper);
    //                         gridSection.classList.add('gridLeft');
    //                     // if its the second set of 3, just set .grid to .gridRight
    //                     } else { gridSection.classList.add('gridRight'); }

    //                     gridWrapper.appendChild(gridSection);
    //                 }

    //                 // Populate/link template data and append to wrap system
    //                 gridSection.appendChild(section);  
    //             };

    //             return wrapper;

    //         };

    //         // Retieve gridType and scope[sections] from element data attribute
    //         var gridType = element[0].dataset.grid;
    //         var sections = scope.$parent[gridType];
    //         var loader = getTemplate(gridType);

    //         var promise = loader.success(function(html) {
    //                     element.html(html);
    //             }).then(function (response) {
                    
    //                 console.log(element);
    //                 element.replaceWith($compile(element.html())(scope));
    //                 console.log(element);
    //             });

    //         // var promise = loader.success(function(html) {
    //         //         element.html(parseSections(sections, html, scope));
    //         //     }).then(function (response) {
                    
    //         //         console.log(element);
    //         //         element.replaceWith($compile(element.html())(scope));
    //         //         console.log(element);
    //         //     });
    //     };

    //     return {
    //         restrict: "E",
    //         link: linker,

    //         scope: {
    //             content:'='
    //         }
    //     };


    // });



app.directive('grid', function($compile) {

        // @BUG This is a really horrible directive to dynamically load the 6-box grid that's
        // used on the projects overview and team page. I could not figure out how to use
        // a modulo repeater function with an Angular template to dynamically produce the grid. This
        // was the best i could come up with at the time. It works, but it's ugly and i don't
        // like it.

        var data, view;
        var linker = function(scope, element, attrs) {

            switch(scope.$parent.pageView) {
                case 'projectsOverviewPage':
                    data = scope.$parent.projects;
                    view = 'projects';
                    break;
                case 'teamPage':
                    data = scope.$parent.members;
                    view = 'team';
                    break;
            }

            // Send to format function and append to element
            element.html(getTemplate(data));
            // Compile for Angular functionality
            $compile(element.contents())(scope);
        }

        var getTemplate = function(data){
            // Template strings
            var newWrapper = function(){
                var temp = document.createElement('div');
                switch(view) {
                    case 'projects':
                        temp.setAttribute('class', 'gridWrapper projectWrapper');
                        break;
                    case 'team':
                        temp.setAttribute('class', 'gridWrapper teamWrapper');
                        break;
                }

                return temp;
            }

            var newGrid = function(i){
                var grid = document.createElement('div');
                grid.setAttribute('class', 'grid');

                // Assign left or right depending on which group of 3
                if (i % 6 == 0) { grid.classList.add('gridLeft') }
                else { grid.classList.add('gridRight') }

                return grid;
            }

            var newSection = function(data){

                // Create Section elements
                var section = document.createElement('section'),
                    image   = document.createElement('img'),
                    h2      = document.createElement('h2'),
                    h3      = document.createElement('h3'),

                    imgWrap = document.createElement('div'),
                    wrapper; // <= Will be set as [section] or section-wrapped anchor to hold rest of elements

                // Set Common Element Attributes
                image.setAttribute('precision-image', true);
                imgWrap.setAttribute('image-loader', true);
                h2.innerHTML = data.title;

                // Set Common Element Classes
                imgWrap.setAttribute('class', 'imgWrapper');

                if (data.content.featured_image) {

                    var featured = data.content.images.featured || data.content.images[0] || {};

                    image.setAttribute('ng-src', featured.url);
                    image.setAttribute('aspect-ratio', (featured.aspectRatio || 0) );

                    // User-Set Precision Positioning
                    if (featured.position) { 
                        // Assign Absolute left/right/top/bottom position
                        for (var pos = 0; featured.position.length > pos; pos++) {
                            image.classList.add(featured.position[pos]);
                        };
                    }

                    imgWrap.appendChild(image);
                }
                
                if (data.content.funny_picture) {
                    var funny = data.content.images.funny || {},
                        image2 = document.createElement('img');

                    image2.setAttribute('ng-src', funny.url);
                    image2.setAttribute('precision-image', true);

                    imgWrap.appendChild(image2);
                }

                if (view === 'projects') {
                    wrapper = document.createElement('a');
                    wrapper.setAttribute('href', '/projects/' + data.content.slug);
                    section.appendChild(wrapper);

                    h3.innerHTML = data.content.name;
                    var overlay = document.createElement('div');
                    overlay.setAttribute('class', 'overlay');

                    imgWrap.appendChild(overlay);

                } else if (view === 'team') {
                    wrapper = section;

                    h3.innerHTML =  data.content.position;

                    // Add Social Media Account Buttons
                    if (data.content.accounts && data.content.accounts.length) {

                        var account, anchor;
                        var socialList = document.createElement('ul');
                        socialList.setAttribute('class', 'socialButtons');

                        for (var d = 0; data.content.accounts.length > d; d++) {

                            var linkClass;
                            switch(data.content.accounts[d].account.toLowerCase()) {
                                case 'facebook':
                                    linkClass = 'fb_btn';
                                    break;
                                case 'twitter':
                                    linkClass = 'tw_btn';
                                    break;
                                case 'behance':
                                    linkClass = 'be_btn';
                                    break;
                                case 'pinterest':
                                    linkClass = 'pi_btn';
                                    break;
                                case 'linkedin':
                                    linkClass = 'li_btn';
                                    break;
                                case 'tumblr':
                                    linkClass = 'tr_btn';
                                    break;
                                case 'youtube':
                                    linkClass = 'yt_btn';
                                    break;
                                case 'mail':
                                    linkClass = 'ma_btn';
                                    break;
                                default:
                                    linkClass = 'ot_btn';
                            }

                            account = document.createElement('li');
                            account.setAttribute('class', 'anchorWrapper invert invertHover ' + linkClass);

                            anchor = document.createElement('a');
                            anchor.setAttribute('href', ((data.content.accounts[d].account.toLowerCase() == 'mail') ? 'mailto:' : '') + data.content.accounts[d].url);
                            anchor.setAttribute('target', '_blank');
                            account.appendChild(anchor);
                            socialList.appendChild(account);
                        }

                        imgWrap.appendChild(socialList);
                    }
                }

                // Append Section Elements together
                wrapper.appendChild(imgWrap);
                wrapper.appendChild(h2);
                wrapper.appendChild(h3);

                return section;
            }


            var grid, wrapper;
            var allProjects = document.createElement('div');
            allProjects.setAttribute('class', 'gridBox')
            // Iterate thru tree, format template
            for (var i = 0; data.length > i; i++) {
                // Create new project section module
                var proj = newSection(data[i]);

                // Create grid if first of a new group of 3
                if (i % 3 == 0) {
                    // if already inside of a grid
                    if (grid) { wrapper.appendChild(grid); }
                    // Finsih last grid, create new one
                    grid = newGrid(i);
                    // Create wrapper if first of a new group of 6
                    if (i % 6 == 0) {
                        // if already inside of a wrapper
                        if (wrapper) { allProjects.appendChild(wrapper); }
                        wrapper = newWrapper(); 
                    }
                }

                // Attach section to grid if no new wrappers or grid are created
                grid.appendChild(proj);

                // Attach grid to wrapper if final loop iteration
                if (i == (data.length - 1)) {
                    wrapper.appendChild(grid);
                    allProjects.appendChild(wrapper);
                }
            };

            return allProjects;
        }

        return {
            restrict: "E",
            link: linker,
            scope: {
                content:'='
            }
        };
});

// app.directive('newGrid', function($compile, $http, Functions){

//     var templateTree = {
//         'project-section' : 'project_section.html',
//         'team-section' : 'team_section.html'
//     };

            

//     var linker = function($scope, element, attrs){

//         Functions.getTemplate(templateTree, attrs.type).then(function(data){
//             var template = data.data;
//             $scope.sections = $scope.$parent.sections; 

//             function newWrapper(){
//                 var newWrapper = $(document.createElement(el));

//             }

//             function newSection(el){
//                 var newEl = $(document.createElement(el));
//                 newEl.html(template);
//                 $compile(newEl.contents());

//                 return newEl[0];
//             }

//             for (var i = 0; $scope.sections.length > i; i++) {
//                 var section = newSection('div', template);
//                 element[0].appendChild(section);
//                 $compile($(element[0]).contents())($scope);
//             };
//         });

//     };

//     return {
//         restrict: "E",
//         link: linker,
//         scope: true

//     };
// });

app.directive('officeList', function() {
    
    // Just an abstratced piece of re-used code
    ////////////////////////////////////////////////

    var linker = function(scope, element, attrs) {

        scope.offices = [
            {
                'location': 'Rio de Janeiro',
                'address'    : 'R Benjamim Batista, 153',
                'region'  : 'Rio de Janeiro, RJ 22461-120',
                'phone'   : '+55 21 3627 7529'
            },
            {
                'location': 'New York',
                'address'    : '392 Broadway, 2nd Floor',
                'region'  : 'New York, NY 10013',
                'phone'   : '+1 212 219 1606'
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

app.directive('socialButtons', function() {
    
    // Another abstratced piece of re-used code
    ////////////////////////////////////////////////

    var linker = function(scope, element, attrs) {
        scope.currentYear = new Date().getFullYear();

        scope.socials = [
            {
                'name'  : 'facebook',
                'url'   : 'https://www.facebook.com/zago',
                'class' : 'fb_btn',
                'order' : 0
            },
            {
                'name'  : 'twitter',
                'url'   : 'https://twitter.com/zagonyc',
                'class' : 'tw_btn',
                'order' : 1
            },
            {
                'name'  : 'behance',
                'url'   : 'https://www.behance.net/Zagolovesyou',
                'class' : 'be_btn',
                'order' : 2
            },
            {
                'name'  : 'pinterest',
                'url'   : 'http://www.pinterest.com/zagolovesyou',
                'class' : 'pi_btn',
                'order' : 3
            }, 
            {
                'name'  : 'linkedin',
                'url'   : 'https://www.linkedin.com/company/zago',
                'class' : 'li_btn',
                'order' : 4
            },
            {
                'name'  : 'tumblr',
                'url'   : 'http://zagolovesyou.tumblr.com',
                'class' : 'tr_btn',
                'order' : 5
            }  
        ];
    };

    return {
        restrict: "A",
        templateUrl: 'pieces/social_buttons.html',
        link: linker
    };
});

app.directive('homeSections', function() {
    
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

app.directive('underZ', function() {

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

app.directive('projectNav', function(){

    var linker = function($scope, element, attrs){

    };

    return {
        restrict: 'A',
        templateUrl: '../pieces/project_nav.html',
        replace: true,
        link : linker
    }
});

app.directive('precisionImage', function($timeout, Functions){

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

app.directive('imageLoader', function(){

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
        restrict: 'AE',
        link: linker
    }
});

app.directive('rotateImages', function($interval){
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
        };

        var timer;
        var waitTiming = 5000; // how long each slide remains active
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

app.directive('newWindowLinks', function($location, $timeout){

    var linker = function($scope, element, attrs) {
        $timeout(function(){
            var links = element.find('a');
            console.log($location.host());
            for (var i = 0; links.length > i; i++) {
                if (links[i]) {
                    $(links[i]).attr('target', '_blank');
                }
            }
        });
    };

    return {
        restrict: 'A',
        link: linker
    }

});

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

var AppCtrl = app.controller('AppCtrl', function($scope, $rootScope, $timeout, Functions, Storage){

    // App-general Functions
    ////////////////////////////////////////////////////////////////////////////////////
    $scope.route = Functions.route;
    $scope.toggleMenu = Functions.toggleMenu;
    $scope.viewProject = Functions.viewProject;
    $scope.setPageTitle = Functions.setPageTitle;
    $scope.anchorTo = Functions.anchorTo;
    $scope.scrollTop = Functions.scrollTop;
    $scope.colors = ['#00ffff','#ffff00','#ff00ff','#00ff00'];

    // Show/Hide ScrollToTop button functionality
    window.addEventListener('scroll', Functions.throttle(Functions.showScroll, 200));

    $scope.keyRelease = function($event){
        if ($event.keyCode === 27){ Functions.toggleMenu(true); }
    };

    // Splash Page configuration
    ////////////////////////////////////////////////////////////////////////////////////
    // (function splashPage() {
    //     // If first time visiting site via mobile, flash splashpage
    //     if (!Storage.splashed && (Modernizr.phone)) {
    //         $scope.showSplash = true;
    //         Functions.disableScroll(true);
    //     }
    // })();

    // // Button to hide splash page and show full site
    // $scope.hideSplash = function() {
    //     Storage.splashed = true;
    //     $scope.showSplash = false;
    //     Functions.disableScroll(false);
    // };

});

AppCtrl.SiteLoader = function($q, $rootScope, SiteLoader, Storage){
    var defer = $q.defer();
    // If the Site Data is missing, stop navigation and retreive data
    // Cache timer for Storage (24hrs: 86400000 1hr: 3600000 1min: 60000)
    //////////////////////////////////////////////////////////////////////////
    var newTimestamp = new Date().getTime();
    // Set Time of User Entry (default to 24hr reset)
    Storage.dailyTimestamp = (Storage.dailyTimestamp && Storage.dailyTimestamp > (newTimestamp - 86400000)) ? Storage.dailyTimestamp : newTimestamp;
    // If the Storage Site object is empty or older than X, reload Wordpress data tree (default to 1hr reset)
    if (!Storage.site || !Storage.dataTimestamp || (Storage.dataTimestamp < newTimestamp - 3600000)) {
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
            defer.resolve();
        });
    } else { $rootScope.site = JSON.parse(Storage.site); defer.resolve(); }

    return defer.promise;

};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.controller('HomeCtrl', function($scope, $rootScope, $timeout, $interval, $document, Functions, Storage){

    $rootScope.pageView = "homePage";
    $scope.setPageTitle();

    var posts = $rootScope.site.home;
    $scope.hero = posts.banners[0];
    $scope.blurb = posts.blurb[0];
    $scope.sections = posts.sections;

    // Section Nav scrolling event listener & logic
    ////////////////////////////////////////////////////////////////////////////////////
    $rootScope.$on('$viewContentLoaded', function(){
        // if it IS the homepage
        if ($rootScope.pageView === "homePage") {
            try { // Workaround for $rootScope.$on checking on every view instead of just homePage
                $timeout(function(){ setDimensions(); });
                Functions.setListener(  window, 'resize', Functions.throttle(setDimensions, 10));
                Functions.setListener(window, 'scroll', Functions.throttle(pinMenu, 10)); }
            catch (error) { }
        }
    });

    var pieces; // Get & Set Dimensions and add menu scroll listener once Preloader finishes
    function setDimensions(){ pieces = getDimensions(); pinMenu(); };

    function getDimensions(){
        var dims = {
            'blurb' : document.getElementById('homeBlurb'),
            'nav' : document.getElementById('sectionNav'),
            'sections' : document.getElementById('homeSections').children,
            'links' : [],
            'navPos' : '',
            'endPos' : ''
        };
        
        dims.links = dims.nav.children[0].children;
        dims.navPos = dims.blurb.offsetTop + (dims.blurb.scrollHeight - dims.nav.scrollHeight);
        dims.endPos = dims.sections[dims.sections.length - 1].offsetTop + dims.sections[dims.sections.length-1].scrollHeight;

        return dims;
    };

    function pinMenu() {
        // get current Scroll position (fires every pixel)
        // timeout applies updated isActive variable
        $timeout(function(){
            var winPos = window.pageYOffset;
            var scrollPos = winPos + pieces.nav.scrollHeight + 10;
            // If scroll position is above highest point of nav, release nav
            if (winPos <= pieces.navPos) {
                pieces.nav.classList.remove('pinned');
                $scope.isActive = '';
            // if scroll position is below lowest section point, release active class
            } else if (winPos >= pieces.endPos) {
                pieces.nav.classList.add('pinned');
                $scope.isActive = '';
            // otherwise if scroll position is in section area, pin nav to top and activate actie class
            } else {
                pieces.nav.classList.add('pinned');
                // Check the x/y dimensions against scroll position (including nav height)
                for (var i = 0; pieces.sections.length > i; i++) {
                    // if scroll position is within current section, set active class
                    if (scrollPos > pieces.sections[i].offsetTop && scrollPos < (pieces.sections[i].offsetTop + pieces.sections[i].scrollHeight)) {
                        $scope.isActive = pieces.sections[i].id;
                        break;
                    }
                    // If this is the last iteration of loop (not in any sections) empty isActive class
                    else if (i == (pieces.sections.length - 1)) { $scope.isActive = ''; }
                };
            }
        });
    };

    $scope.scrollDown = function(){
        var topFrame = $("#heroBanner");
        $document.scrollTo(0, topFrame[0].offsetHeight, 500);
    }

});

app.controller('ProjectsCtrl', function($scope, $rootScope, Storage, Styling){

    $rootScope.pageView = "projectsOverviewPage";
    $scope.setPageTitle('Projects');

    var posts = $rootScope.site.project;
    $scope.blurb = posts.blurb[0];
    $scope.projects = posts.projects;
    $scope.sections = posts.projects;

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

app.controller('ProjectDetailCtrl', function($scope, $rootScope, $stateParams, Storage){

    $rootScope.pageView = "projectPage";

    var posts = $rootScope.site.project;

    // Get CURRENT, NEXT & PERVIOUS project IDs based on SITE TREE position (Project Sub-Nav)
    ////////////////////////////////////////////////////////////////////////////////////
    $scope.project = null;
    for (var i = 0; posts.projects.length > i; i++) {

        if (posts.projects[i].content.slug == $stateParams.project) {
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

app.controller('TeamCtrl', function($scope, $rootScope, Functions, Storage){

    $rootScope.pageView = "teamPage";
    $scope.setPageTitle('The Team');

    var posts = $rootScope.site.team;
    $scope.blurb = posts.blurb[0];
    $scope.members = posts.members.shuffle();
    $scope.sections = posts.members.shuffle();

});

app.controller('LoveCtrl', function($scope, $rootScope){

    $rootScope.pageView = "lovePage";

});

app.controller('LegacyCtrl', function($scope, $rootScope, $state, Functions, Storage){

    $scope.setPageTitle('Outdated Browser');

    // Set Notice Height to Window Height, monitor resize event
    function setBodyHeight(){
        document.getElementById('legacy-notice').style.minHeight = (((window.innerHeight || document.documentElement.clientHeight)-200) + 'px');
    }; setBodyHeight();

    window.addEventListener('resize', setBodyHeight);

    Functions.hideAppElements();

});
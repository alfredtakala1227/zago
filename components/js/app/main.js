$(document).ready(function() {
    $("*").on("touchend", function() {
        $(this).blur();
    });
    function cssTester() {
        var HTMLclasses = $("html")[0].classList;
        var wrap = document.createElement("div");
        wrap.classList.add("tester_classes");
        for (var i = 0; HTMLclasses.length > i; i++) {
            var sect = document.createElement("div");
            sect.innerHTML = HTMLclasses[i];
            wrap.appendChild(sect);
        }
        document.body.appendChild(wrap);
    }
});

var app = angular.module("app", [ "ui.router", "ngSanitize", "duScroll", "angulartics", "angulartics.google.analytics" ]);

app.config([ "$stateProvider", "$urlRouterProvider", "$locationProvider", function($stateProvider, $urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise("/");
    $stateProvider.state("home", {
        url: "/",
        templateUrl: "partials/home.html",
        controller: "HomeCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    }).state("projects", {
        url: "/projects",
        templateUrl: "partials/projects.html",
        controller: "ProjectsCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    }).state("project", {
        url: "/projects/:project",
        templateUrl: "partials/project.html",
        controller: "ProjectDetailCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    }).state("team", {
        url: "/team",
        templateUrl: "partials/team.html",
        controller: "TeamCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    }).state("love", {
        url: "/zagolovesyou",
        templateUrl: "partials/love.html",
        controller: "LoveCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    }).state("legacy", {
        url: "/legacy",
        templateUrl: "partials/legacy.html",
        controller: "LegacyCtrl",
        resolve: {
            SiteLoader: AppCtrl.SiteLoader
        }
    });
    $locationProvider.html5Mode(true);
} ]);

app.run(function($rootScope, $location, $state, $analytics, Storage, Functions, $window) {
    $rootScope.$on("$stateChangeStart", function(event, to, toParams, from, fromParams) {
        $rootScope.pageLoading = true;
        Functions.removeListeners();
        var menuOpen = $("#mainNav").hasClass("menu-open"), menuTimer = 550;
        if (menuOpen) {
            event.preventDefault();
            Functions.toggleMenu(true);
            setTimeout(function() {
                $state.go(to.name, toParams);
            }, menuTimer);
        } else {
            $rootScope.currentState = to.name;
        }
    });
    $rootScope.$on("$stateChangeSuccess", function(event, to, toParams, from, fromParams) {
        $rootScope.pageLoading = false;
        $analytics.pageTrack($location.$$path);
    });
});

app.factory("Storage", function() {
    var db = window.localStorage;
    try {
        db.testKey = "1";
        delete db.testKey;
        return db;
    } catch (error) {
        return {};
    }
});

app.factory("SiteLoader", function($http, $q, $rootScope, $analytics, Storage) {

    var defer = $q.defer(),
        reqUrl = "http://admin.zagollc.com/wp-json/posts?filter[posts_per_page]=1000",

        newTimestamp, site, posts;

    function sorter(a, b) {
        var first = parseInt(a.order), second = parseInt(b.order);
        if (first < second) return -1;
        if (first > second) return 1;
        return 0;
    }
    
    function getRawData() {
        var deferred = $q.defer();
        if (window.XDomainRequest) {
            var xdr = new XDomainRequest();
            xdr.open("get", reqUrl);
            xdr.onprogress = function() {};
            xdr.ontimeout = function() {};
            xdr.onerror = function() {};
            xdr.onload = function() {
                deferred.resolve(xdr);
            };
            setTimeout(function() {
                xdr.send();
            }, 0);
        } else {
            deferred.resolve($http.get(reqUrl));
        }
        return deferred.promise;
    }

    function getPosts(rawData) {
        console.log(rawData);
        function ternValue(object, i) {
            if (i) {
                var index = i || 0;
                return object ? object[index] : null;
            } else {
                return object ? object : null;
            }
        }
        function splitCSV(str) {
            var arr = str.replace(/, /g, ",").split(",");
            for (var i = arr.length; i >= 0; i--) {
                if (arr[i] === "") {
                    arr.splice(i, 1);
                }
            }
            return arr;
        }
        function aspectRatio(width, height) {
            return height / width;
        }
        function postTree(Site) {
            var tree = {
                home: {
                    blurb: [],
                    banners: [],
                    sections: [],
                    images: [],
                    preloaded: false
                },
                project: {
                    blurb: [],
                    projects: [],
                    images: [],
                    preloaded: false
                },
                team: {
                    blurb: [],
                    members: [],
                    images: [],
                    preloaded: false
                }
            };
            for (var i = 0; Site.length > i; i++) {
                var post = Site[i];
                if (post.terms.category.length == 1 && post.status == "publish") {
                    var temp = {
                        id: post.ID,
                        title: ternValue(post.title),
                        order: ternValue(post.acf.arrangement),
                        body: post.acf.content ? post.acf.content : post.content,
                        content: {}
                    };
                    var images = [];
                    if (post.terms.category[0].slug == "home-hero-banner") {
                        temp.content = {
                            banner_caption: ternValue(post.acf.banner_caption),
                            images: []
                        };
                        for (var h = 0; post.acf.banner_images.length > h; h++) {
                            var obj = {
                                url: post.acf.banner_images[h].image.url,
                                alt: ternValue(post.acf.banner_images[h].alt),
                                order: ternValue(post.acf.banner_images[h].arrangement),
                                position: ternValue(post.acf.banner_images[h].positioning),
                                aspectRatio: aspectRatio(post.acf.banner_images[h].image.width, post.acf.banner_images[h].image.height)
                            };
                            temp.content.images.push(obj);
                            tree.home.images.push(obj.url);
                        }
                        tree.home.banners.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "home-section" && tree.home.sections.length < 4) {
                        temp.content = {
                            id: ternValue(post.acf.banner_image.id),
                            alt: ternValue(post.acf.banner_image.alt),
                            url: ternValue(post.acf.banner_image.url),
                            caption: ternValue(post.acf.banner_caption),
                            position: ternValue(post.acf.positioning),
                            aspectRatio: aspectRatio(post.acf.banner_image.width, post.acf.banner_image.height)
                        };
                        tree.home.images.push(temp.content.image_url);
                        tree.home.sections.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "home-blurb") {
                        temp.body = ternValue(post.content);
                        tree.home.blurb.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "projects-blurb") {
                        temp.body = ternValue(post.content);
                        tree.project.blurb.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "project") {
                        temp.title = ternValue(post.acf.title);
                        temp.content = {
                            name: ternValue(post.title),
                            slug: post.slug,
                            case_study: post.acf.case_study,
                            client: ternValue(post.acf.client),
                            services: ternValue(splitCSV(post.acf.services)),
                            project: ternValue(splitCSV(post.acf.project)),
                            other_details: ternValue(post.acf.other_details),
                            project_url: ternValue(post.acf.project_url),
                            social_media: ternValue(post.acf.social_media),
                            read_about: ternValue(post.acf.read_about),
                            related_projects: ternValue(post.acf.related_projects),
                            featured_image: {},
                            image_sections: [],
                            images: []
                        };
                        for (var q = 0; temp.content.other_details.length > q; q++) {
                            temp.content.other_details[q].details = splitCSV(temp.content.other_details[q].details);
                        }
                        if (post.acf.images && post.acf.images.length) {
                            for (var d = 0; post.acf.images.length > d; d++) {
                                var obj = {
                                    url: post.acf.images[d].image.url,
                                    alt: post.acf.images[d].image.alt,
                                    label: post.acf.images[d].label,
                                    order: post.acf.images[d].arrangement,
                                    half: post.acf.images[d].half,
                                    position: ternValue(post.acf.images[d].positioning),
                                    aspectRatio: aspectRatio(post.acf.images[d].image.width, post.acf.images[d].image.height)
                                };
                                if (d > 0) {
                                    temp.content.image_sections.push(obj);
                                } else {
                                    temp.content.featured_image = obj;
                                }
                                temp.content.images.push(obj);
                            }
                        }
                        tree.project.images.push(temp.content.featured_image.url);
                        tree.project.projects.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "team-blurb") {
                        temp.body = ternValue(post.content);
                        tree.team.blurb.push(temp);
                        continue;
                    }
                    if (post.terms.category[0].slug == "team-member") {
                        temp.content = {
                            position: ternValue(post.acf.position),
                            accounts: ternValue(post.acf.accounts),
                            featured_image: post.acf.profile_picture && post.acf.profile_picture.url ? post.acf.profile_picture.url : null,
                            funny_picture: post.acf.funny_picture && post.acf.funny_picture.url ? post.acf.funny_picture.url : null,
                            images: {
                                featured: ternValue(post.acf.profile_picture),
                                funny: ternValue(post.acf.funny_picture)
                            }
                        };
                        tree.team.images.push(temp.content.featured_image);
                        temp.content.funny_picture ? tree.team.images.push(temp.content.funny_picture) : "";
                        tree.team.members.push(temp);
                        continue;
                    }
                }
            }
            var projects = tree.project.projects;
            for (var o = 0; projects.length > o; o++) {
                var related = projects[o].content.related_projects || [];
                var details = [];
                for (var p = 0; related.length > p; p++) {
                    for (var r = 0; projects.length > r; r++) {
                        if (related[p] == projects[r].id) {
                            var obj = {
                                id: projects[r].id,
                                title: projects[r].title,
                                client: projects[r].content.client,
                                image: projects[r].content.featured_image,
                                slug: projects[r].content.slug
                            };
                            details.push(obj);
                            projects[o].content.images.push(obj.image.url);
                            break;
                        }
                    }
                }
                projects[o].content.related_projects = details;
            }
            tree.project.projects.sort(sorter);
            console.log(tree);
            return tree;
        }
        $rootScope.isLoading = false;
        return postTree(rawData);
    }

    return function(){

        getRawData().then(function(data) {
            $analytics.pageTrack('/SiteLoader');

            site = data.responseText || data.data;
            if (typeof site == "string") { site = JSON.parse(site); }

            posts = getPosts(site);
            $rootScope.site = posts;

            Storage.site = JSON.stringify(posts);
            Storage.dataTimestamp = new Date().getTime();

            defer.resolve();
        });

        return defer.promise;
    }

});

app.factory("Styling", function() {
    var div = document.createElement("style");
    div.id = "stylesheet";
    div.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(div);
    return {
        add: function(str) {
            div.innerHTML = div.innerHTML.concat(str);
        },
        clear: function() {
            div.innerHTML = "";
        }
    };
});

app.factory("Functions", function($q, $http, $rootScope, $templateCache, $state, Storage, $document, $timeout) {
    var eventListeners = [];
    var preloadedImages = [];
    var dom = getDOM();
    function getDOM() {
        var dom = {
            body: document.body,
            content: document.getElementById("pageContent"),
            footer: document.getElementById("footer"),
            menuBtn: document.getElementById("menuButton"),
            mainNav: document.getElementById("mainNav"),
            mainMenu: document.getElementById("menuWrapper"),
            sectionNav: document.getElementById("sectionNav"),
            scrollTopBtn: document.getElementById("scrollTop"),
            siteID: document.getElementById("siteID"),
            prompt: document.getElementById("menuPrompt")
        };
        return dom;
    }
    $rootScope.$on("$viewContentLoaded", function() {
        dom = getDOM();
    });
    function prevent(e) {
        e.preventDefault();
    }
    function stopProp(e) {
        e.stopPropagation();
    }
    function reloadSite() {
        setTimeout(function() {
            Storage.clear();
            location.reload();
            return;
        }, 100);
    }
    function checkPrompt() {
        if (!Storage.prompted) {
            dom.prompt.classList.remove("marquee");
            $timeout(function() {
                dom.prompt.classList.add("marquee");
            });
        } else {
            hidePrompt();
        }
    }
    checkPrompt();
    function hidePrompt() {
        dom.prompt.classList.add("hiding");
        setTimeout(function() {
            dom.prompt.classList.remove("marquee");
        }, 500);
    }
    var Functions = {
        checkPrompt: checkPrompt,
        hidePrompt: hidePrompt,
        reloadSite: reloadSite,
        anchorTo: function(anchor) {
            var elem = document.getElementById(anchor);
            var menuHeight = dom.sectionNav.scrollHeight;
            $document.scrollToElement(elem, menuHeight, "500");
        },
        hideAppElements: function() {
            dom.siteID.style.display = "none";
            dom.mainNav.style.display = "none";
            dom.menuBtn.style.display = "none";
            dom.prompt.style.display = "none";
            dom.footer.style.display = "none";
        },
        route: function(route, turnOff, params) {
            var params = params || {};
            var menuOpen = dom.mainNav.classList.contains("menu-open");
            Functions.toggleMenu(turnOff);
            if ($state.current.name != route || JSON.stringify($state.params) != JSON.stringify(params)) {
                if (menuOpen) {
                    setTimeout(function() {
                        $state.go(route, params);
                    }, 550);
                } else {
                    $state.go(route, params);
                }
            } else {
                this.scrollTop();
            }
        },
        removeListeners: function() {
            var arr = eventListeners;
            for (var i = 0; arr.length > i; i++) {
                arr[i].obj.removeEventListener(arr[i].evt, arr[i].func, arr[i].bub);
            }
            eventListeners = [];
        },
        setListener: function(obj, evt, func, bub) {
            obj.addEventListener(evt, func, bub);
            eventListeners.push({
                obj: obj,
                evt: evt,
                func: func,
                bub: bub
            });
        },
        setPageTitle: function(str) {
            var headTitle = document.getElementsByTagName("title")[0];
            str = str ? " | " + str : "";
            headTitle.innerHTML = "Zago" + str;
        },
        showScroll: function() {
            if (window.pageYOffset > 200) {
                dom.scrollTopBtn.classList.add("show");
            } else {
                dom.scrollTopBtn.classList.remove("show");
            }
        },
        scrollTop: function() {
            $document.scrollTo(0, 0, 500);
        },
        throttle: function(fn, threshhold, scope) {
            threshhold || (threshhold = 250);
            var last, deferTimer;
            return function() {
                var context = scope || this;
                var now = +new Date(), args = arguments;
                if (last && now < last + threshhold) {
                    clearTimeout(deferTimer);
                    deferTimer = setTimeout(function() {
                        last = now;
                        fn.apply(context, args);
                    }, threshhold);
                } else {
                    last = now;
                    fn.apply(context, args);
                }
            };
        },
        toggleMenu: function(turnOff) {
            try {
                if (event && event.shiftKey && event.target.id == "menuButton") {
                    reloadSite();
                    return;
                }
            } catch (error) {}
            function close() {
                dom.body.classList.remove("hidden");
                setTimeout(function() {
                    mainNav.classList.remove("menu-open");
                }, 50);
                dom.menuBtn.classList.remove("menu-open");
                dom.content.classList.remove("menu-open");
                dom.content.removeEventListener("click", close, true);
            }
            function open() {
                setTimeout(function() {
                    mainNav.classList.add("menu-open");
                }, 50);
                dom.menuBtn.classList.add("menu-open");
                dom.content.classList.add("menu-open");
                dom.content.addEventListener("click", close, true);
                if (!Storage.prompted) {
                    Storage.prompted = true;
                    hidePrompt();
                }
            }
            if (turnOff) {
                if (turnOff && dom.mainNav.classList.contains("menu-open")) {
                    close();
                }
            } else {
                if (dom.mainNav.classList.contains("menu-open")) {
                    close();
                } else {
                    open();
                }
            }
        },
        viewProject: function(id) {
            Functions.route("project", true, {
                project: id
            });
        },
        getTemplate: function(tree, branch, baseURL) {
            var base = baseURL || "../../pieces/";
            var templateUrl = base + tree[branch];
            console.log(templateUrl);
            var templateLoader = $http.get(templateUrl, {
                cache: $templateCache
            });
            return templateLoader;
        },
        testFunction: function(test) {
            console.log(test || "test");
        }
    };
    return Functions;
});

app.directive("grid", function($compile) {
    var data, view;
    var linker = function(scope, element, attrs) {
        switch (scope.$parent.pageView) {
          case "projectsOverviewPage":
            data = scope.$parent.projects;
            view = "projects";
            break;

          case "teamPage":
            data = scope.$parent.members;
            view = "team";
            break;
        }
        element.html(getTemplate(data));
        $compile(element.contents())(scope);
    };
    var getTemplate = function(data) {
        var newWrapper = function() {
            var temp = document.createElement("div");
            switch (view) {
              case "projects":
                temp.setAttribute("class", "gridWrapper projectWrapper");
                break;

              case "team":
                temp.setAttribute("class", "gridWrapper teamWrapper");
                break;
            }
            return temp;
        };
        var newGrid = function(i) {
            var grid = document.createElement("div");
            grid.setAttribute("class", "grid");
            if (i % 6 == 0) {
                grid.classList.add("gridLeft");
            } else {
                grid.classList.add("gridRight");
            }
            return grid;
        };
        var newSection = function(data) {
            var section = document.createElement("section"), image = document.createElement("img"), h2 = document.createElement("h2"), h3 = document.createElement("h3"), imgWrap = document.createElement("div"), wrapper;
            image.setAttribute("precision-image", true);
            imgWrap.setAttribute("image-loader", true);
            h2.innerHTML = data.title;
            imgWrap.setAttribute("class", "imgWrapper");
            if (data.content.featured_image) {
                var featured = data.content.images.featured || data.content.images[0] || {};
                image.setAttribute("ng-src", featured.url);
                image.setAttribute("aspect-ratio", featured.aspectRatio || 0);
                if (featured.position) {
                    for (var pos = 0; featured.position.length > pos; pos++) {
                        image.classList.add(featured.position[pos]);
                    }
                }
                imgWrap.appendChild(image);
            }
            if (data.content.funny_picture) {
                var funny = data.content.images.funny || {}, image2 = document.createElement("img");
                image2.setAttribute("ng-src", funny.url);
                image2.setAttribute("precision-image", true);
                imgWrap.appendChild(image2);
            }
            if (view === "projects") {
                wrapper = document.createElement("a");
                wrapper.setAttribute("href", "/projects/" + data.content.slug);
                section.appendChild(wrapper);
                h3.innerHTML = data.content.name;
                var overlay = document.createElement("div");
                overlay.setAttribute("class", "overlay");
                imgWrap.appendChild(overlay);
            } else if (view === "team") {
                wrapper = section;
                h3.innerHTML = data.content.position;
                if (data.content.accounts && data.content.accounts.length) {
                    var account, anchor;
                    var socialList = document.createElement("ul");
                    socialList.setAttribute("class", "socialButtons");
                    for (var d = 0; data.content.accounts.length > d; d++) {
                        var linkClass;
                        switch (data.content.accounts[d].account.toLowerCase()) {
                          case "facebook":
                            linkClass = "fb_btn";
                            break;

                          case "twitter":
                            linkClass = "tw_btn";
                            break;

                          case "behance":
                            linkClass = "be_btn";
                            break;

                          case "pinterest":
                            linkClass = "pi_btn";
                            break;

                          case "linkedin":
                            linkClass = "li_btn";
                            break;

                          case "tumblr":
                            linkClass = "tr_btn";
                            break;

                          case "youtube":
                            linkClass = "yt_btn";
                            break;

                          case "mail":
                            linkClass = "ma_btn";
                            break;

                          default:
                            linkClass = "ot_btn";
                        }
                        account = document.createElement("li");
                        account.setAttribute("class", "anchorWrapper invert invertHover " + linkClass);
                        anchor = document.createElement("a");
                        anchor.setAttribute("href", (data.content.accounts[d].account.toLowerCase() == "mail" ? "mailto:" : "") + data.content.accounts[d].url);
                        anchor.setAttribute("target", "_blank");
                        account.appendChild(anchor);
                        socialList.appendChild(account);
                    }
                    imgWrap.appendChild(socialList);
                }
            }
            wrapper.appendChild(imgWrap);
            wrapper.appendChild(h2);
            wrapper.appendChild(h3);
            return section;
        };
        var grid, wrapper;
        var allProjects = document.createElement("div");
        allProjects.setAttribute("class", "gridBox");
        for (var i = 0; data.length > i; i++) {
            var proj = newSection(data[i]);
            if (i % 3 == 0) {
                if (grid) {
                    wrapper.appendChild(grid);
                }
                grid = newGrid(i);
                if (i % 6 == 0) {
                    if (wrapper) {
                        allProjects.appendChild(wrapper);
                    }
                    wrapper = newWrapper();
                }
            }
            grid.appendChild(proj);
            if (i == data.length - 1) {
                wrapper.appendChild(grid);
                allProjects.appendChild(wrapper);
            }
        }
        return allProjects;
    };
    return {
        restrict: "E",
        link: linker,
        scope: {
            content: "="
        }
    };
});

app.directive("officeList", function() {
    var linker = function(scope, element, attrs) {
        scope.offices = [ {
            location: "Geneva",
            address: "37 rue Eug&egrave;ne-Marziano",
            region: "CH-1227 Gen&egrave;ve",
            phone: "+41 22 548 0480"
        }, {
            location: "New York",
            address: "392 Broadway, 2nd Floor",
            region: "New York, NY 10013",
            phone: "+1 212 219 1606"
        }, {
            location: "Rio de Janeiro",
            address: "R Benjamim Batista, 153",
            region: "Rio de Janeiro, RJ 22461-120",
            phone: "+55 21 3627 7529"
        } ];
    };
    return {
        restrict: "A",
        templateUrl: "pieces/office_list.html",
        link: linker
    };
});

app.directive("socialButtons", function() {
    var linker = function(scope, element, attrs) {
        scope.currentYear = new Date().getFullYear();
        scope.socials = [ {
            name: "facebook",
            url: "https://www.facebook.com/zago",
            "class": "fb_btn",
            order: 0
        }, {
            name: "twitter",
            url: "https://twitter.com/zagonyc",
            "class": "tw_btn",
            order: 1
        }, {
            name: "behance",
            url: "https://www.behance.net/Zagolovesyou",
            "class": "be_btn",
            order: 2
        }, {
            name: "pinterest",
            url: "http://www.pinterest.com/zagolovesyou",
            "class": "pi_btn",
            order: 3
        }, {
            name: "linkedin",
            url: "https://www.linkedin.com/company/zago",
            "class": "li_btn",
            order: 4
        }, {
            name: "tumblr",
            url: "http://zagolovesyou.tumblr.com",
            "class": "tr_btn",
            order: 5
        } ];
    };
    return {
        restrict: "A",
        templateUrl: "pieces/social_buttons.html",
        link: linker
    };
});

app.directive("homeSections", function() {
    var linker = function(scope, element, attrs) {
        var words = scope.section.content.caption.trim().split(" ");
        var colors = [ "blue", "yellow", "pink", "green" ];
        scope.caption = {
            first: words[0],
            last: words[1] + " " + words[2],
            color: colors[scope.$index % 4]
        };
    };
    return {
        restrict: "A",
        templateUrl: "pieces/home_sections.html",
        link: linker
    };
});

app.directive("underZ", function() {
    var linker = function(scope, element, attrs) {
        element[0].innerHTML = scope.str.replaceAll(" Z ", ' <u class="z">Z</u> ');
    };
    return {
        restrict: "A",
        scope: {
            str: "@"
        },
        link: linker
    };
});

app.directive("projectNav", function() {
    var linker = function($scope, element, attrs) {};
    return {
        restrict: "A",
        templateUrl: "pieces/project_nav.html",
        replace: true,
        link: linker
    };
});

app.directive("precisionImage", function($timeout, Functions) {
    var linker = function($scope, element, attrs) {
        if (attrs.precisionImage) {
            var classes = JSON.parse(attrs.precisionImage);
            for (var i = 0; classes.length > i; i++) {
                element[0].classList.add(classes[i]);
            }
        }
        var image = element[0];
        var wrapper = image.parentNode;
        function checkRatio() {
            if (attrs.aspectRatio / (wrapper.clientHeight / wrapper.clientWidth) > 1) {
                image.classList.add("stretch");
            } else {
                image.classList.remove("stretch");
            }
        }
        var listener = window.addEventListener("resize", Functions.throttle(checkRatio, 100));
        $timeout(checkRatio);
        $scope.$on("$destroy", function() {
            window.removeEventListener("resize", Functions.throttle(checkRatio, 100));
        });
    };
    return {
        restrict: "A",
        link: linker,
        scope: true
    };
});

app.directive("imageLoader", function() {
    var linker = function(scope, element, attrs) {
        var loader = document.createElement("div");
        var wheel = document.createElement("div");
        loader.setAttribute("class", "loaderBox");
        wheel.setAttribute("class", "loader");
        loader.appendChild(wheel);
        element[0].appendChild(loader);
        element[0].classList.add("loaderWrapper");
        element[0].classList.add("loading");
        var nImage = 0;

        jQuery(function(){
            jQuery(element[0]).find("img").on('load', function(){
                nImage++;
                if ( nImage == jQuery(element[0]).find("img").length) {
                    element[0].classList.remove("loading");
                    element[0].removeChild(loader);
                }
            });
        });

    };
    return {
        restrict: "AE",
        link: linker
    };
});

app.directive("rotateImages", function($interval) {
    var linker = function($scope, element, attrs) {
        function getImages() {
            var elems = element[0].children;
            var images = [];
            for (var r = 0; elems.length > r; r++) {
                if (elems[r].tagName == "IMG") {
                    images.push(elems[r]);
                }
            }
            return images;
        }
        function rotateImages() {
            if (element.hasClass('loading')) {
                return;
            }
            var images = getImages();
            $scope.lastBanner = $scope.activeBanner;
            $scope.activeBanner = ($scope.activeBanner + 1) % images.length;
        }
        var timer;
        var waitTiming = 5000;

        $scope.setTimer = function() {
            $scope.activeBanner = -1;
            $scope.lastBanner;
            timer = $interval(rotateImages, waitTiming);
        };

        $scope.$watch(function() { return element; }, function() {
            $scope.setTimer();
        });

        $scope.$on("$destroy", function() {
            $interval.cancel(timer);
            $scope.timer = undefined;
        });
    };
    return {
        restrict: "A",
        link: linker
    };
});

app.directive("newWindowLinks", function($location, $timeout) {
    var linker = function($scope, element, attrs) {
        $timeout(function() {
            var links = element.find("a");
            for (var i = 0; links.length > i; i++) {
                if (links[i]) {
                    $(links[i]).attr("target", "_blank");
                }
            }
        });
    };
    return {
        restrict: "A",
        link: linker
    };
});

var AppCtrl = app.controller("AppCtrl", function($scope, $rootScope, $timeout, SiteLoader, Functions, Storage) {
    $scope.route = Functions.route;
    $scope.toggleMenu = Functions.toggleMenu;
    $scope.viewProject = Functions.viewProject;
    $scope.setPageTitle = Functions.setPageTitle;
    $scope.anchorTo = Functions.anchorTo;
    $scope.scrollTop = Functions.scrollTop;
    $scope.colors = [ "#00ffff", "#ffff00", "#ff00ff", "#00ff00" ];

    window.addEventListener("scroll", Functions.throttle(Functions.showScroll, 200));

    $scope.keyRelease = function($event) {
        if ($event.keyCode === 27) {
            Functions.toggleMenu(true);
        }
    };

});

AppCtrl.SiteLoader = function($q, $rootScope, SiteLoader, Storage) {

    var defer = $q.defer();

    function refreshSiteData(){
        var refreshRate  = (1000 * 10 * 1),
            refreshTime = new Date().getTime() - refreshRate,
            oldData = Storage.dataTimestamp,
            defer = $q.defer();

        if (!oldData || oldData < refreshTime) { 
            SiteLoader().then(function(){
                console.log('refresh site');
                defer.resolve();
            });
        } else { defer.resolve(); }

        defer.promise.then(function(){
            setTimeout(function(){ refreshSiteData(); }, (refreshRate + 5000));
        });
    }
    
    if (!Storage.site) { console.log('intial site load'); SiteLoader().then(function(){ defer.resolve(); }); }
    else { $rootScope.site = JSON.parse(Storage.site); defer.resolve(); }

    return defer.promise.then(function(){
        console.log('resolved');
        refreshSiteData();
    });
};

app.controller("HomeCtrl", function($scope, $rootScope, $timeout, $interval, $document, Functions, Storage) {
    $rootScope.pageView = "homePage";
    $scope.setPageTitle();
    var posts = $rootScope.site.home;
    $scope.hero = posts.banners[0];
    $scope.blurb = posts.blurb[0];
    $scope.sections = posts.sections;
    $rootScope.$on("$viewContentLoaded", function() {
        if ($rootScope.pageView === "homePage") {
            try {
                $timeout(function() {
                    setDimensions();
                });
                Functions.setListener(window, "resize", Functions.throttle(setDimensions, 10));
                Functions.setListener(window, "scroll", Functions.throttle(pinMenu, 10));
            } catch (error) {}
        }
    });
    var pieces;
    function setDimensions() {
        pieces = getDimensions();
        pinMenu();
    }
    function getDimensions() {
        var dims = {
            blurb: document.getElementById("homeBlurb"),
            nav: document.getElementById("sectionNav"),
            sections: document.getElementById("homeSections").children,
            links: [],
            navPos: "",
            endPos: ""
        };
        dims.links = dims.nav.children[0].children;
        dims.navPos = dims.blurb.offsetTop + (dims.blurb.scrollHeight - dims.nav.scrollHeight);
        dims.endPos = dims.sections[dims.sections.length - 1].offsetTop + dims.sections[dims.sections.length - 1].scrollHeight;
        return dims;
    }
    function pinMenu() {
        $timeout(function() {
            var winPos = window.pageYOffset;
            var scrollPos = winPos + pieces.nav.scrollHeight + 10;
            if (winPos <= pieces.navPos) {
                pieces.nav.classList.remove("pinned");
                $scope.isActive = "";
            } else if (winPos >= pieces.endPos) {
                pieces.nav.classList.add("pinned");
                $scope.isActive = "";
            } else {
                pieces.nav.classList.add("pinned");
                for (var i = 0; pieces.sections.length > i; i++) {
                    if (scrollPos > pieces.sections[i].offsetTop && scrollPos < pieces.sections[i].offsetTop + pieces.sections[i].scrollHeight) {
                        $scope.isActive = pieces.sections[i].id;
                        break;
                    } else if (i == pieces.sections.length - 1) {
                        $scope.isActive = "";
                    }
                }
            }
        });
    }
    $scope.scrollDown = function() {
        var topFrame = $("#heroBanner");
        $document.scrollTo(0, topFrame[0].offsetHeight, 500);
    };
});

app.controller("ProjectsCtrl", function($scope, $rootScope, Storage, Styling) {
    $rootScope.pageView = "projectsOverviewPage";
    $scope.setPageTitle("Projects");
    var posts = $rootScope.site.project;
    $scope.blurb = posts.blurb[0];
    $scope.projects = posts.projects;
    $scope.sections = posts.projects;
    (function randomizeHoverColors() {
        colors = $scope.colors.shuffle();
        var styles = "";
        for (var i = 0; colors.length > i; i++) {
            styles = styles.concat(".projectWrapper .grid section:nth-of-type(" + (i + 1) + ") .imgWrapper .overlay{background-color:" + colors[i] + "}");
        }
        Styling.clear();
        Styling.add(styles);
    })();
});

app.controller("ProjectDetailCtrl", function($scope, $rootScope, $stateParams, Storage) {
    $rootScope.pageView = "projectPage";
    var posts = $rootScope.site.project;
    $scope.project = null;
    for (var i = 0; posts.projects.length > i; i++) {
        if (posts.projects[i].content.slug == $stateParams.project) {
            $scope.project = posts.projects[i];
            if (i == 0) {
                $scope.nextProject = posts.projects[i + 1];
                $scope.prevProject = posts.projects[posts.projects.length - 1];
            } else if (i == posts.projects.length - 1) {
                $scope.nextProject = posts.projects[0];
                $scope.prevProject = posts.projects[i - 1];
            } else {
                $scope.nextProject = posts.projects[i + 1];
                $scope.prevProject = posts.projects[i - 1];
            }
            if (posts.projects.length < 3) {
                if (i == 0) {
                    $scope.nextProject = posts.projects[1];
                    $scope.prevProject = posts.projects[0];
                } else {
                    $scope.nextProject = posts.projects[0];
                    $scope.prevProject = posts.projects[1];
                }
            }
            break;
        }
    }
    if ($scope.project) {
        $scope.setPageTitle($scope.project.title);
        var sections = $scope.project.content.image_sections;
        $scope.imageSections = [];
        for (var o = 0; sections.length > o; o++) {
            var temp = {
                label: sections[o].label,
                order: sections[o].order,
                images: [ {
                    url: sections[o].url,
                    alt: sections[o].alt,
                    position: sections[o].position,
                    aspectRatio: sections[o].aspectRatio
                } ]
            };
            if (sections[o].half && sections[o + 1].half) {
                o++;
                temp.images.push({
                    url: sections[o].url,
                    alt: sections[o].alt,
                    position: sections[o].position,
                    aspectRatio: sections[o].aspectRatio
                });
            }
            $scope.imageSections.push(temp);
        }
    } else {
        $scope.route("projects", true);
    }
});

app.controller("TeamCtrl", function($scope, $rootScope, Functions, Storage) {
    $rootScope.pageView = "teamPage";
    $scope.setPageTitle("The Team");
    var posts = $rootScope.site.team;
    $scope.blurb = posts.blurb[0];
    $scope.members = posts.members.shuffle();
    $scope.sections = posts.members.shuffle();
});

app.controller("LoveCtrl", function($scope, $rootScope) {
    $rootScope.pageView = "lovePage";
});

app.controller("LegacyCtrl", function($scope, $rootScope, $state, Functions, Storage) {
    $scope.setPageTitle("Outdated Browser");
    function setBodyHeight() {
        document.getElementById("legacy-notice").style.minHeight = (window.innerHeight || document.documentElement.clientHeight) - 200 + "px";
    }
    setBodyHeight();
    window.addEventListener("resize", setBodyHeight);
    Functions.hideAppElements();
});

angular.module("app").run([ "$templateCache", function($templateCache) {
    "use strict";
    $templateCache.put("index.html", '<!DOCTYPE html><html lang=en xml:lang=en ng-app=app><head><base href="/"><meta charset="UTF-8"><meta name=google content=notranslate><meta http-equiv=Content-Language content=en_US><meta name=viewport content="width=device-width,height=device-height,initial-scale=1"><link rel=icon type=image/png href=images/favicon.ico><title>Zago</title><link rel=stylesheet href=css/style.css><script src=js/lib/polyfills.js></script><script src=js/lib/modernizr.js></script><script src=js/lib/jquery.js></script><script src=js/lib/angular.js></script><script src=js/lib/start_scripts.js></script><script src=js/app/main.js></script></head><body id=body ng-controller=AppCtrl ng-keyup=keyRelease($event)><div id=container><a ui-sref=home><img id=siteID class=siteID alt="Zago LLC Logo" src=images/zago_logo.png></a><nav id=mainNav class=overthrow><div id=menuWrapper><div id=menu><ul><li><a ui-sref=home href="" ng-class="{active: currentState == \'home\'}" title=Home>Zago</a></li><li><a ui-sref=projects href="" ng-class="{active: currentState == \'projects\'}" title="Zago Projects">Projects</a></li><li><a ui-sref=team href="" ng-class="{active: currentState == \'team\'}" title="Meet Z Team">Team</a></li><li><a href="http://zagolovesyou.tumblr.com/" ng-click=toggleMenu(true) target=_blank title="Blog Love">Love</a></li></ul></div><div class=menuContacts office-list></div></div></nav><div class=buttonWrapper><button id=menuButton type=button ng-click=toggleMenu()><span id=menuPrompt>CLICK HERE FOR MENU</span></button></div><button id=scrollTop type=button ng-click=scrollTop()></button><div id=pageContent class={{pageView}} ui-view autoscroll=true></div><footer id=footer ng-class="{homePage: pageView == \'homePage\', pageLoading: pageLoading}"><section class=collaboration><p>Let\'s work together.</p><p>Come have coffee & say ciao.</p><a href=mailto:info@zagollc.com>info@zagollc.com</a></section><section class=intern><p class=footerCiaoline>Say ciao at <a href=mailto:info@zagollc.com>info@zagollc.com</a></p><p>We take interns in NYC for</p><p>3 to 6 month engagements.</p><p>Inquire at <a href=mailto:intern@zagollc.com>intern@zagollc.com</a></p></section><div class=officeListing office-list></div><section class=social social-buttons></section></footer></div><script src=js/lib/end_scripts.js></script></body></html>');
    $templateCache.put("pieces/grid.html", '<div ng-repeat="section in sections"><div ng-class="{ gridWrapper: checkModulo($index, 6) }"><div ng-class="{ grid: checkModulo($index, 3), gridLeft: checkModulo($index, 6) }"></div></div></div>');
    $templateCache.put("pieces/home_sections.html", '<div class=bannerWrapper><div class=imgWrapper image-loader><img ng-src={{section.content.url}} precision-image aspect-ratio={{section.content.aspectRatio}}></div><div class=captionWrapper><p><span class=color ng-class=caption.color>{{caption.first}}</span></p><p>{{caption.last}}</p></div></div><div class=sectionWrapper><div class="padder left"><h1>{{section.title}}</h1></div><div class=padder><div class=sectionText ng-bind-html=section.body></div></div></div>');
    $templateCache.put("pieces/loader.html", "<div class=loaderWrapper><div class=loaderBox><div class=loader></div></div></div>");
    $templateCache.put("pieces/office_list.html", '<section ng-repeat="office in offices"><h2 ng-bind-html=office.location></h2><p ng-bind-html=office.address></p><p ng-bind-html=office.region></p><p>T: <a href=tel:{{office.phone}} ng-bind-html=office.phone></a></p></section><section class=info><a href=mailto:info@zagollc.com>info@zagollc.com</a></section>');
    $templateCache.put("pieces/project_nav.html", '<nav id=projectNav><ul><li><a ui-sref=projects><div class="navButton project-back"></div><div class=navTitle>All Projects</div></a></li><li><a ui-sref="project({ project: prevProject.content.slug })"><div class="navButton project-prev"></div><div class=navTitle ng-bind-html=prevProject.content.name></div></a></li><li><a ui-sref="project({ project: nextProject.content.slug })"><div class="navButton project-next"></div><div class=navTitle ng-bind-html=nextProject.content.name></div></a></li></ul></nav>');
    $templateCache.put("pieces/project_section.html", "<section data-id={{sections[$index].id}}><div class=imgWrapper><img ng-src={{sections[$index].featured_image.url}}><div class=overlay></div></div><h2>{{sections[$index].title}}</h2><h3>{{sections[$index].client}}</h3></section>");
    $templateCache.put("pieces/social_buttons.html", '<ul class=socialButtons><li ng-class=social.class ng-repeat="social in socials | orderBy: \'order\'"><a href={{social.url}} title="zago {{social.name}} account" target=_blank></a></li></ul><p>&copy;{{currentYear}} Zago, LLC.</p>');
    $templateCache.put("pieces/team_section.html", '<section data-id={{section.id}}><div class=imgWrapper><img ng-src={{section.featured_image}} precision-image> <img ng-src={{section.funny_image}} precision-image><ul class=socialButtons><li class="anchorWrapper invert" ng-repeat="social in section.content.social_media" ng-class="{\r' + "\n" + "                 fb_btn: social.account.toLowerCase() == 'facebook',\r" + "\n" + "                   tw_btn: social.account.toLowerCase() == 'twitter',\r" + "\n" + "                    be_btn: social.account.toLowerCase() == 'behance',\r" + "\n" + "                    pi_btn: social.account.toLowerCase() == 'pinterest',\r" + "\n" + "                  li_btn: social.account.toLowerCase() == 'linkedin',\r" + "\n" + "                   tr_btn: social.account.toLowerCase() == 'tumblr',\r" + "\n" + "                 yt_btn: social.account.toLowerCase() == 'youtube',\r" + "\n" + "                    ot_btn: social.account.toLowerCase() == 'other',\r" + "\n" + "                  ma_btn: social.account.toLowerCase() == 'mail'\r" + "\n" + '                }"><a href={{section.account.url}}></a></li></ul></div><h2>{{section.name}}</h2><h3>{{section.position}}</h3></section>');
    $templateCache.put("partials/error.html", "<h1>Error Page</h1><h2>{{errorPageMessage}}</h2>");
    $templateCache.put("partials/home.html", '<div id=heroBanner image-loader rotate-images><img ng-repeat="image in hero.content.images | orderBy:\'order\'" ng-src={{image.url}} ng-class="{showing: activeBanner == $index, last: lastBanner == $index}" precision-image aspect-ratio={{image.aspectRatio}}><h1>Zago</h1><p ng-bind-html=hero.content.banner_caption></p><button type=button ng-click=scrollDown()></button></div><div id=homeBlurb><div ng-bind-html=blurb.body></div><nav id=sectionNav><ul><li ng-repeat="section in sections | orderBy:\'order\'" ng-click=anchorTo(section.content.caption.firstWord()) ng-class="{active: isActive == section.content.caption.firstWord()}">{{section.content.caption.firstWord()}}</li></ul></nav></div><div id=homeSections><section id={{section.content.caption.firstWord()}} ng-repeat="section in sections | orderBy:\'order\'" home-sections></section></div>');
    $templateCache.put("partials/legacy.html", "<div id=legacy-notice><h1>Sorry, looks like you're on an older browser.</h1><p>Bad design exists everywhere, and internet stuff is no exception. Unfortunately, some internet browsers of days past just can't handle what we got goin' on over here (true story).</p><p>If you are using Internet Explorer 8 or less, or are otherwise seeing this page instead of us, please try switching to a newer browser.</p></div>");
    $templateCache.put("partials/love.html", '<embed src="http://zagolovesyou.tumblr.com/" frameborder=0>');
    $templateCache.put("partials/project.html", '<div project-nav></div><div id=projectLayout ng-class="{caseStudy: project.content.case_study}"><div class=featuredImage image-loader><img ng-src={{project.content.featured_image.url}} alt={{project.content.featured_image.alt}} ng-class="{isPortrait: project.content.featured_image.isPortrait}" precision-image={{project.content.featured_image.position}} aspect-ratio={{project.content.featured_image.aspectRatio}}></div><div class=projectContent><h1 ng-bind-html=project.title ng-if=project.content.case_study></h1><div class=projectDetails><div class=projectInfo><section><h2>Client</h2><p>{{project.content.client}}</p></section><section ng-if=project.content.project><h2>Project</h2><p ng-repeat="bodyText in project.content.project">{{bodyText}}</p></section><section ng-if=project.content.services><h2>Services</h2><p ng-repeat="bodyText in project.content.services">{{bodyText}}</p></section><section ng-repeat="detail in project.content.other_details"><h2>{{detail.title}}</h2><p ng-repeat="bodyText in detail.details">{{bodyText}}</p></section></div><a class=clientSite ng-href={{project.content.project_url}} ng-if=project.content.project_url>Visit Website</a><div class=socialAccounts ng-if=project.content.social_media.length><ul class=socialButtons><li ng-repeat="social in project.content.social_media" ng-class="{\r' + "\n" + "                         fb_btn: social.account.toLowerCase() == 'facebook',\r" + "\n" + "                           tw_btn: social.account.toLowerCase() == 'twitter',\r" + "\n" + "                            be_btn: social.account.toLowerCase() == 'behance',\r" + "\n" + "                            pi_btn: social.account.toLowerCase() == 'pinterest',\r" + "\n" + "                          li_btn: social.account.toLowerCase() == 'linkedin',\r" + "\n" + "                           tr_btn: social.account.toLowerCase() == 'tumblr',\r" + "\n" + "                         ma_btn: social.account.toLowerCase() == 'mail'\r" + "\n" + '                        }"><a href={{social.url}} target=_blank></a></li></ul></div></div><div ng-if=project.content.case_study class=projectBody ng-class="{singleColumn: project.body.length < 1500}" ng-bind-html=project.body new-window-links></div></div></div><div id=projectImages ng-if=imageSections.length><section ng-repeat="section in imageSections"><h6>{{section.label}}</h6><div class=imageWrapper><div ng-repeat="image in section.images" class=imageBox ng-class="{halfImage: section.images.length > 1}" image-loader><img ng-src={{image.url}} alt={{image.alt}} ng-class="{isPortrait: image.isPortrait}" precision-image={{image.position}} aspect-ratio={{image.aspectRatio}}></div></div></section></div><div id=readAbout ng-if="project.content.case_study && project.content.read_about.length"><h3>Read More About {{project.content.name}}</h3><section ng-repeat="story in project.content.read_about"><a href={{story.url}} target=_blank><p>{{story.title}}</p><h4>{{story.source}}</h4></a></section></div><div id=relatedProjects ng-if="project.content.case_study && project.content.related_projects.length"><h3>Related Projects</h3><section ng-repeat="related in project.content.related_projects"><a ui-sref="project({project: related.slug})"><div class=imgWrapper image-loader><img ng-src={{related.image.url}} alt={{related.image.alt}} ng-class="{isPortrait: related.image.isPortrait}" precision-image={{related.image.position}} aspect-ratio={{related.image.aspectRatio}}></div><div class=contentWrapper><p>{{related.title}}</p><h4>{{related.client}}</h4></div></a></section></div>');
    $templateCache.put("partials/projects.html", "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=projects></grid>");
    $templateCache.put("partials/team.html", "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=members></grid>");
} ]);
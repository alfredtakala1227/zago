app.factory("Functions", function( $q, $rootScope, $state, Preloader, Storage, $document, $timeout ) {

    console.log('Factory: Compiling "Functions"');

    // Data Elements
    ////////////////////////////////////////////////////////////////
    var eventListeners = [];

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

        console.dir(dom);

        return dom;
    };

    $rootScope.$on('$viewContentLoaded', function(){ 
        if (!$rootScope.isLoading) {
            dom = getDOM();
            checkPrompt();
        }
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
        console.log('checking prompt');
        // If user hasn't been prompted/clicked the menu, show prompt (else hide)
        if (!Storage.prompted) { 
            dom.prompt.classList.remove('bounce');
            $timeout(function(){ dom.prompt.classList.add('bounce'); }); // $timeout to let class removal trigger first
        } else { hidePrompt(); }
    };

    function hidePrompt(){
        // Function to hide menuPrompt
        dom.prompt.classList.add('hiding');
        setTimeout(function(){
            dom.prompt.classList.add('hidden');
        }, 500);
    };

    function disableScroll(set){
        if (set) {
            dom.body.classList.add('hidden');
            dom.body.addEventListener('touchmove', prevent, true);
            // dom.mainNav.addEventListener('touchmove', stopProp);
            $(dom.body).css('height', window.innerHeight+'px');
        } else {
            dom.body.classList.remove('hidden');
            dom.body.removeEventListener('touchmove', prevent, true);
            // dom.mainNav.removeEventListener('touchmove', stopProp);
            $(dom.body).css('height', '');
        }
    };

    // Object Menthods
    ////////////////////////////////////////////////////////////////
    return {

        'anchorTo' : function(anchor) {
                var elem = document.getElementById(anchor);
                var menuHeight = dom.sectionNav.scrollHeight;
                $document.scrollToElement(elem, menuHeight, '500');
            },
        'checkPrompt' : checkPrompt,

        'hidePrompt' : hidePrompt,

        'reloadSite' : reloadSite,

        'disableScroll' : disableScroll,

        'hideAppElements' : function(){
            console.log('hiding app elements');
            dom.siteID.style.display = 'none';
            dom.mainNav.style.display = 'none';
            dom.menuBtn.style.display = 'none';
            dom.prompt.style.display = 'none';
            dom.footer.style.display = 'none';
            },

        'preloadImages' : function(posts, src) {
            if (posts.images && !posts.preloaded) {
                console.log(src);
                // Preload Images if first time
                Preloader.preload(posts.images);
                posts.preloaded = true;
                // Update Storage object to reflect preload status
                console.log(JSON.parse(Storage.site));
                var site = JSON.parse(Storage.site);
                site[src] = posts;
                Storage.site = JSON.stringify(site);
                console.log(JSON.parse(Storage.site));
            }
            },

        'route' : function(route, turnOff, params) {
                var params = params || {};
                var menuOpen = dom.mainNav.classList.contains('menu-open');
                this.toggleMenu(turnOff);

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

        'showScroll' : function() {
                // @BUG doesn't show unless scrolled FROM hidden position
                if (window.pageYOffset > 200) { dom.scrollTopBtn.classList.add('show'); }
                else { dom.scrollTopBtn.classList.remove('show'); }
            },

        'scrollTop' : function() {
            console.log('scroll to top');
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

                // Delete tree if Shift key is pressed when menuButton clicked
                try { // Event obj missing in firefox
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
                        disableScroll(); console.log('toggle menu close');
               
                };

                function open(){

                        setTimeout(function(){mainNav.classList.add('menu-open')}, 50); // timeout for Firefox animation fix (pretty glitchy tho)
                        dom.menuBtn.classList.add('menu-open');
                        dom.content.classList.add('menu-open');
                        dom.content.addEventListener('click', close, true);
                        disableScroll(true); console.log('toggle menu open');

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
                console.log('viewProject clicked: ' + id);
                this.route('project', true, {'project':id});
            },
        'testFunction' : function(test){
                console.log(test || 'test');
            }
    }
});
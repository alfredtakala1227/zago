app.run(function($rootScope, $state, SiteLoader, Storage, Functions, $window) {

    $rootScope.$on('$stateChangeStart', function(event, to, toParams, from, fromParams){

        $rootScope.isRouting = true;
        
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
        
        $rootScope.isRouting = false;

        // Add/Remove page class to footer element
        document.getElementsByTagName('footer')[0].className = '';
        if (to.name == 'home') { document.getElementsByTagName('footer')[0].classList.add('homePage'); }
        if (to.name == 'love') { document.getElementsByTagName('footer')[0].classList.add('lovePage'); }
    });
});
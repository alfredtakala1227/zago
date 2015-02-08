angular.module('app').factory('SiteLoader', function($http, $q, $rootScope){

    // Wordpress API call for site post data
    var reqUrl = 'http://admin.zagollc.com/wp-json/posts?filter[posts_per_page]=1000';

    // Custom sorter function to arrange post tree via 'order' property
    function sorter(a,b) {
        if ( a.order < b.order ) return -1;
        if ( a.order > b.order ) return 1;
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

                            temp.content = {
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
                            // Sort projects object via arrangement parameter
                            tree.project.projects.sort(sorter);

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
                                    'featured' : post.acf.profile_picture,
                                    'funny'    : post.acf.funny_picture
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
                                    'image' : projects[r].content.featured_image
                                };
                                details.push(obj);
                                projects[o].content.images.push(obj.image.url);
                                break;
                            }   }   }
                    // Assign/Push new Related Pojects obj into tree
                    projects[o].content.related_projects = details;
                }
                console.log(tree);
                return tree;
            };

            $rootScope.isLoading = false;
            return postTree(rawData);
        }
    }
});
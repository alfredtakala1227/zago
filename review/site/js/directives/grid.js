angular.module('app').directive('grid', function($compile) {

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
        addEventListeners(scope);
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
            console.log(data);
            // Create Section element
            var sec = document.createElement('section');
            sec.setAttribute('data-id', data.id);
            // Create wrapper element for img & overlay
            var imgWrap = document.createElement('div');
            imgWrap.setAttribute('class', 'imgWrapper');
            // Create Img Element
            var img = document.createElement('img');
            img.setAttribute('ng-src', data.content.featured_image.url || data.content.featured_image);
            // Check and Add class for portrait images
            img.setAttribute('precision-image', true);
            if (data.content.featured_image.aspectRatio) { img.setAttribute('aspect-ratio', data.content.featured_image.aspectRatio); }
            if (data.content.featured_image.position) {
                var classes = data.content.featured_image.position;
                for (var pos = 0; classes.length > pos; pos++) {
                    img.classList.add(classes[pos]);
                };
            }

            imgWrap.appendChild(img);
            imgWrap.setAttribute('image-loader', true);
            if (data.content.funny_picture) {
                var img2 = document.createElement('img');
                img2.setAttribute('ng-src', data.content.funny_picture);
                img.setAttribute('precision-image', true);
                imgWrap.appendChild(img2);
            }
            // Create Overlay
            var ovrly = document.createElement('div');
            ovrly.setAttribute('class', 'overlay');
            // Create Title Elements
            var h2 = document.createElement('h2');
            h2.innerHTML = data.title;
            var h3 = document.createElement('h3');
            var h3Text;

            if (view === 'projects') {
                h3Text = data.content.client;
                imgWrap.appendChild(ovrly); }
            else if (view === 'team') {

                h3Text =  data.content.position;

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

            h3.innerHTML = h3Text;

            // Append Section Elements together
            sec.appendChild(imgWrap);
            sec.appendChild(h2);
            sec.appendChild(h3);

            return sec;
        }


        var grid, wrapper;
        var allProjects = document.createElement('div');
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

    function addEventListeners(scope){
        // Add a hover effect for the image overlay when img or headers are hovered over
        $('.projectWrapper .grid section > *').click(function(){
            var project;
            try {
                project = this.parentNode.dataset.id;
            } catch(e) {
                for (var i = 0; this.parentNode.attributes.length > i; i++) {
                    if (this.parentNode.attributes[i].nodeName = "data-id") {
                        project = this.parentNode.attributes[i].nodeValue;
                        break;
                    }
                };
            }
            scope.$parent.viewProject(project);
        });

    };

    return {
        restrict: "E",
        link: linker,
        scope: {
            content:'='
        }
    };
});
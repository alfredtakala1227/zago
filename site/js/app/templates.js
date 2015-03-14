angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('index.html',
    "<!DOCTYPE html><html lang=en xml:lang=en ng-app=app><head><meta charset=\"UTF-8\"><meta name=google content=notranslate><meta http-equiv=Content-Language content=en_US><base href=\"/\"><meta name=viewport content=\"width=device-width,height=device-height,initial-scale=1\"><title>Zago | Under Construction</title><link rel=icon type=image/png href=images/favicon.ico><link rel=stylesheet href=\"css/style.css\"><script src=js/enhance.js></script><script src=js/polyfills.js></script><script src=js/modernizr.js></script><script src=js/mobile-detect.min.js></script><script src=js/mobile-detect-modernizr.js></script><script src=js/modernizr-script.js></script><script src=js/ios-orientationchange-fix.js></script><script src=js/overthrow.min.js></script><script src=js/jquery-1.8.3.min.js></script><script src=js/angular.min.js></script><script src=js/angular-ui-router.min.js></script><script src=js/angular-sanitize.min.js></script><script src=js/angular-scroll.min.js></script><script src=js/main.js></script><script src=js/templates.js></script></head><body id=body ng-controller=AppCtrl><div id=container><img id=siteID class=siteID alt=\"Zago LLC Logo\" src=images/zago_logo.png ng-click=\"route('home', true)\"><nav id=mainNav class=overthrow><div id=menuWrapper><div id=menu><ul><li><a ng-click=\"route('home')\" title=Home>Zago</a></li><li><a ng-click=\"route('projects')\" title=\"Zago Projects\">Projects</a></li><li><a ng-click=\"route('team')\" title=\"Meet Z Team\">Team</a></li><li><a href=\"http://zagolovesyou.tumblr.com/\" ng-click=toggleMenu(true) target=_blank title=\"Blog Love\">Love</a></li></ul></div><div class=menuContacts office-list></div></div></nav><div class=buttonWrapper><p id=menuPrompt>Click for<br>Menu</p><button id=menuButton type=button ng-click=toggleMenu()></button></div><button id=scrollTop type=button ng-click=scrollTop()></button><div id=pageContent class={{pageView}} ui-view autoscroll=true></div><footer id=footer ng-class=\"{homePage: pageView == 'homePage', lovePage: pageView == 'lovePage'}\"><section class=collaboration><p>Let's work together.</p><p>Come have coffee & say ciao.</p><a href=mailto:info@zagollc.com>info@zagollc.com</a></section><section class=intern><p class=footerCiaoline>Say ciao at <a href=mailto:info@zagollc.com>info@zagollc.com</a></p><p>We take interns in NYC for</p><p>3 to 6 month engagements.</p><p>Inquire at <a href=mailto:intern@zagollc.com>intern@zagollc.com</a></p></section><div class=officeListing office-list></div><section class=social social-buttons></section><div id=test-sprites><ul><li class=downArrow></li><li class=downArrow-white></li><li class=upArrow></li><li class=upArrow-white></li></ul></div></footer><div id=cssTest><p class=cssvwunit>No vw units</p><p class=mobilegradea>No mobile grade a</p><p class=overthrow-enabled>No overthrow-enabled</p><p class=cssvhunit>No vh units</p><p class=localstorage>No localStorage</p></div></div><script src=http://localhost:35729/livereload.js></script><!--[if lt IE 9]><script type=\"text/javascript\" src=\"js/unsupported.js\"></script><![endif]--></body></html>"
  );


  $templateCache.put('pieces/home_sections.html',
    "<div class=bannerWrapper><div class=imgWrapper image-loader><img ng-src={{section.content.url}} precision-image aspect-ratio={{section.content.aspectRatio}}></div><div class=captionWrapper><p><span class=color ng-class=caption.color>{{caption.first}}</span></p><p>{{caption.last}}</p></div></div><div class=sectionWrapper><div class=\"padder left\"><h1>{{section.title}}</h1></div><div class=padder><div class=sectionText ng-bind-html=section.body></div></div></div>"
  );


  $templateCache.put('pieces/loader.html',
    "<div class=loaderBox><div class=loader></div></div>"
  );


  $templateCache.put('pieces/office_list.html',
    "<section ng-repeat=\"office in offices\"><h2 ng-bind-html=office.location></h2><p ng-bind-html=office.address></p><p ng-bind-html=office.region></p><p>P: <a href=tel:{{office.phone}} ng-bind-html=office.phone></a></p></section><section class=info><a href=mailto:info@zagollc.com>info@zagollc.com</a></section>"
  );


  $templateCache.put('pieces/project_nav.html',
    "<nav id=projectNav><ul><li><a ui-sref=projects><div class=\"navButton project-back\"></div><div class=navTitle>All Projects</div></a></li><li><a href=projects/{{prevProject.id}}><div class=\"navButton project-prev\"></div><div class=navTitle ng-bind-html=prevProject.content.name></div></a></li><li><a href=projects/{{nextProject.id}}><div class=\"navButton project-next\"></div><div class=navTitle ng-bind-html=nextProject.content.name></div></a></li></ul></nav>"
  );


  $templateCache.put('pieces/project_section.html',
    "<section data-id={{section.id}}><div class=imgWrapper><img ng-src={{section.featured_image.url}}><div class=overlay></div></div><h2>{{section.title}}</h2><h3>{{section.client}}</h3></section>"
  );


  $templateCache.put('pieces/social_buttons.html',
    "<ul class=socialButtons><li ng-class=social.class ng-repeat=\"social in socials | orderBy: 'order'\"><a href={{social.url}} title=\"zago {{social.name}} account\" target=_blank></a></li></ul><p>&copy;2014 Zago, LLC.</p>"
  );


  $templateCache.put('pieces/team_section.html',
    "<section data-id={{section.id}}><div class=imgWrapper><img ng-src={{section.featured_image}} precision-image> <img ng-src={{section.funny_image}} precision-image><ul class=socialButtons><li class=\"anchorWrapper invert\" ng-repeat=\"social in section.content.social_media\" ng-class=\"{\n" +
    "\t\t\t\t\tfb_btn: social.account.toLowerCase() == 'facebook',\n" +
    "\t\t\t\t\ttw_btn: social.account.toLowerCase() == 'twitter',\n" +
    "\t\t\t\t\tbe_btn: social.account.toLowerCase() == 'behance',\n" +
    "\t\t\t\t\tpi_btn: social.account.toLowerCase() == 'pinterest',\n" +
    "\t\t\t\t\tli_btn: social.account.toLowerCase() == 'linkedin',\n" +
    "\t\t\t\t\ttr_btn: social.account.toLowerCase() == 'tumblr',\n" +
    "\t\t\t\t\tyt_btn: social.account.toLowerCase() == 'youtube',\n" +
    "\t\t\t\t\tot_btn: social.account.toLowerCase() == 'other',\n" +
    "\t\t\t\t\tma_btn: social.account.toLowerCase() == 'mail'\n" +
    "\t\t\t\t}\"><a href={{section.account.url}}></a></li></ul></div><h2>{{section.name}}</h2><h3>{{section.position}}</h3></section>"
  );


  $templateCache.put('partials/error.html',
    "<h1>Error Page</h1><h2>{{errorPageMessage}}</h2>"
  );


  $templateCache.put('partials/home.html',
    "<div id=heroBanner image-loader rotate-images><img ng-repeat=\"image in hero.content.images | orderBy:'order'\" ng-src={{image.url}} ng-class=\"{showing: activeBanner == $index, last: lastBanner == $index}\" precision-image aspect-ratio={{image.aspectRatio}}><h1>Zago</h1><p ng-bind-html=hero.content.banner_caption></p><button type=button ng-click=scrollDown()></button></div><div id=homeBlurb><div ng-bind-html=blurb.body></div><nav id=sectionNav><ul><li ng-repeat=\"section in sections | orderBy:'order'\" ng-click=anchorTo(section.content.caption.firstWord()) ng-class=\"{active: isActive == section.content.caption.firstWord()}\">{{section.content.caption.firstWord()}}</li></ul></nav></div><div id=homeSections><section id={{section.content.caption.firstWord()}} ng-repeat=\"section in sections | orderBy:'order'\" home-sections></section></div>"
  );


  $templateCache.put('partials/legacy.html',
    "<div id=legacy-notice><h1>Sorry, looks like you're on an older browser.</h1><p>Bad design exists everywhere, and internet stuff is no exception. Unfortunately, some internet browsers of days past just can't handle what we got goin' on over here (true story).</p><p>If you are using Internet Explorer 8 or less, or are otherwise seeing this page instead of us, please try switching to a newer browser.</p></div>"
  );


  $templateCache.put('partials/loading.html',
    "<div id=loader><h1>Loading</h1></div>"
  );


  $templateCache.put('partials/love.html',
    "<embed src=\"http://zagolovesyou.tumblr.com/\" frameborder=0>"
  );


  $templateCache.put('partials/project.html',
    "<div project-nav></div><div id=projectLayout ng-class=\"{caseStudy: project.content.case_study}\"><div class=featuredImage image-loader><img ng-src={{project.content.featured_image.url}} alt={{project.content.featured_image.alt}} ng-class=\"{isPortrait: project.content.featured_image.isPortrait}\" precision-image={{project.content.featured_image.position}} aspect-ratio={{project.content.featured_image.aspectRatio}}></div><div class=projectContent><h1 ng-bind-html=project.title ng-if=project.content.case_study></h1><div class=projectDetails><div class=projectInfo><section><h2>Client</h2><p>{{project.content.client}}</p></section><section ng-if=project.content.project><h2>Project</h2><p ng-repeat=\"bodyText in project.content.project\">{{bodyText}}</p></section><section ng-if=project.content.services><h2>Services</h2><p ng-repeat=\"bodyText in project.content.services\">{{bodyText}}</p></section><section ng-repeat=\"detail in project.content.other_details\"><h2>{{detail.title}}</h2><p ng-repeat=\"bodyText in detail.details\">{{bodyText}}</p></section></div><a class=clientSite ng-href={{project.content.project_url}} ng-if=project.content.project_url>Visit Website</a><div class=socialAccounts ng-if=project.content.social_media.length><ul class=socialButtons><li ng-repeat=\"social in project.content.social_media\" ng-class=\"{\n" +
    "\t\t\t\t\t\t\tfb_btn: social.account.toLowerCase() == 'facebook',\n" +
    "\t\t\t\t\t\t\ttw_btn: social.account.toLowerCase() == 'twitter',\n" +
    "\t\t\t\t\t\t\tbe_btn: social.account.toLowerCase() == 'behance',\n" +
    "\t\t\t\t\t\t\tpi_btn: social.account.toLowerCase() == 'pinterest',\n" +
    "\t\t\t\t\t\t\tli_btn: social.account.toLowerCase() == 'linkedin',\n" +
    "\t\t\t\t\t\t\ttr_btn: social.account.toLowerCase() == 'tumblr',\n" +
    "\t\t\t\t\t\t\tma_btn: social.account.toLowerCase() == 'mail'\n" +
    "\t\t\t\t\t\t}\"><a href={{social.url}}></a></li></ul></div></div><div class=projectBody ng-class=\"{singleColumn: project.body.length < 1500}\" ng-bind-html=project.body ng-if=project.content.case_study></div></div></div><div id=projectImages ng-if=imageSections.length><section ng-repeat=\"section in imageSections\"><h6>{{section.label}}</h6><div class=imageWrapper><div ng-repeat=\"image in section.images\" class=imageBox ng-class=\"{halfImage: section.images.length > 1}\" image-loader><img ng-src={{image.url}} alt={{image.alt}} ng-class=\"{isPortrait: image.isPortrait}\" precision-image={{image.position}} aspect-ratio={{image.aspectRatio}}></div></div></section></div><div id=readAbout ng-if=\"project.content.case_study && project.content.read_about.length\"><h3>Read More About {{project.content.name}}</h3><section ng-repeat=\"story in project.content.read_about\"><a href={{story.url}} target=_blank><p>{{story.title}}</p><h4>{{story.source}}</h4></a></section></div><div id=relatedProjects ng-if=\"project.content.case_study && project.content.related_projects.length\"><h3>Related Projects</h3><section ng-repeat=\"related in project.content.related_projects\" ng-click=viewProject(related.id)><div class=imgWrapper image-loader><img ng-src={{related.image.url}} alt={{related.image.alt}} ng-class=\"{isPortrait: related.image.isPortrait}\" precision-image={{related.image.position}} aspect-ratio={{related.image.aspectRatio}}></div><div class=contentWrapper><p>{{related.title}}</p><h4>{{related.client}}</h4></div></section></div>"
  );


  $templateCache.put('partials/projects.html',
    "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=projects></grid>"
  );


  $templateCache.put('partials/team.html',
    "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=members></grid>"
  );

}]);

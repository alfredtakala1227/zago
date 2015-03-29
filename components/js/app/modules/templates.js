angular.module('app').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('index.html',
    "<!DOCTYPE html><html lang=en xml:lang=en ng-app=app><head><base href=\"/\"><meta charset=\"UTF-8\"><meta name=google content=notranslate><meta http-equiv=Content-Language content=en_US><meta name=viewport content=\"width=device-width,height=device-height,initial-scale=1\"><link rel=icon type=image/png href=images/favicon.ico><title>Zago</title><link rel=stylesheet href=css/style.css><script src=js/lib/polyfills.js></script><script src=js/lib/modernizr.js></script><script src=js/lib/jquery.js></script><script src=js/lib/angular.js></script><script src=js/lib/start_scripts.js></script><script src=js/app/main.js></script></head><body id=body ng-controller=AppCtrl ng-keyup=keyRelease($event)><div id=container><a ui-sref=home><img id=siteID class=siteID alt=\"Zago LLC Logo\" src=images/zago_logo.png></a><nav id=mainNav class=overthrow><div id=menuWrapper><div id=menu><ul><li><a ui-sref=home href=\"\" ng-class=\"{active: currentState == 'home'}\" title=Home>Zago</a></li><li><a ui-sref=projects href=\"\" ng-class=\"{active: currentState == 'projects'}\" title=\"Zago Projects\">Projects</a></li><li><a ui-sref=team href=\"\" ng-class=\"{active: currentState == 'team'}\" title=\"Meet Z Team\">Team</a></li><li><a href=\"http://zagolovesyou.tumblr.com/\" ng-click=toggleMenu(true) target=_blank title=\"Blog Love\">Love</a></li></ul></div><div class=menuContacts office-list></div></div></nav><div class=buttonWrapper><button id=menuButton type=button ng-click=toggleMenu()><span id=menuPrompt>CLICK HERE FOR MENU</span></button></div><button id=scrollTop type=button ng-click=scrollTop()></button><div id=pageContent class={{pageView}} ui-view autoscroll=true></div><footer id=footer ng-class=\"{homePage: pageView == 'homePage', pageLoading: pageLoading}\"><section class=collaboration><p>Let's work together.</p><p>Come have coffee & say ciao.</p><a href=mailto:info@zagollc.com>info@zagollc.com</a></section><section class=intern><p class=footerCiaoline>Say ciao at <a href=mailto:info@zagollc.com>info@zagollc.com</a></p><p>We take interns in NYC for</p><p>3 to 6 month engagements.</p><p>Inquire at <a href=mailto:intern@zagollc.com>intern@zagollc.com</a></p></section><div class=officeListing office-list></div><section class=social social-buttons></section></footer></div><script src=js/lib/end_scripts.js></script></body></html>"
  );


  $templateCache.put('pieces/grid.html',
    "<div ng-repeat=\"section in sections\"><div ng-class=\"{ gridWrapper: checkModulo($index, 6) }\"><div ng-class=\"{ grid: checkModulo($index, 3), gridLeft: checkModulo($index, 6) }\"></div></div></div>"
  );


  $templateCache.put('pieces/home_sections.html',
    "<div class=bannerWrapper><div class=imgWrapper image-loader><img ng-src={{section.content.url}} precision-image aspect-ratio={{section.content.aspectRatio}}></div><div class=captionWrapper><p><span class=color ng-class=caption.color>{{caption.first}}</span></p><p>{{caption.last}}</p></div></div><div class=sectionWrapper><div class=\"padder left\"><h1>{{section.title}}</h1></div><div class=padder><div class=sectionText ng-bind-html=section.body></div></div></div>"
  );


  $templateCache.put('pieces/loader.html',
    "<div class=loaderWrapper><div class=loaderBox><div class=loader></div></div></div>"
  );


  $templateCache.put('pieces/office_list.html',
    "<section ng-repeat=\"office in offices\"><h2 ng-bind-html=office.location></h2><p ng-bind-html=office.address></p><p ng-bind-html=office.region></p><p>T: <a href=tel:{{office.phone}} ng-bind-html=office.phone></a></p></section><section class=info><a href=mailto:info@zagollc.com>info@zagollc.com</a></section>"
  );


  $templateCache.put('pieces/project_nav.html',
    "<nav id=projectNav><ul><li><a ui-sref=projects><div class=\"navButton project-back\"></div><div class=navTitle>All Projects</div></a></li><li><a ui-sref=\"project({ project: prevProject.content.slug })\"><div class=\"navButton project-prev\"></div><div class=navTitle ng-bind-html=prevProject.content.name></div></a></li><li><a ui-sref=\"project({ project: nextProject.content.slug })\"><div class=\"navButton project-next\"></div><div class=navTitle ng-bind-html=nextProject.content.name></div></a></li></ul></nav>"
  );


  $templateCache.put('pieces/project_section.html',
    "<section data-id={{sections[$index].id}}><div class=imgWrapper><img ng-src={{sections[$index].featured_image.url}}><div class=overlay></div></div><h2>{{sections[$index].title}}</h2><h3>{{sections[$index].client}}</h3></section>"
  );


  $templateCache.put('pieces/social_buttons.html',
    "<ul class=socialButtons><li ng-class=social.class ng-repeat=\"social in socials | orderBy: 'order'\"><a href={{social.url}} title=\"zago {{social.name}} account\" target=_blank></a></li></ul><p>&copy;{{currentYear}} Zago, LLC.</p>"
  );


  $templateCache.put('pieces/team_section.html',
    "<section data-id={{section.id}}><div class=imgWrapper><img ng-src={{section.featured_image}} precision-image> <img ng-src={{section.funny_image}} precision-image><ul class=socialButtons><li class=\"anchorWrapper invert\" ng-repeat=\"social in section.content.social_media\" ng-class=\"{\r" +
    "\n" +
    "\t\t\t\t\tfb_btn: social.account.toLowerCase() == 'facebook',\r" +
    "\n" +
    "\t\t\t\t\ttw_btn: social.account.toLowerCase() == 'twitter',\r" +
    "\n" +
    "\t\t\t\t\tbe_btn: social.account.toLowerCase() == 'behance',\r" +
    "\n" +
    "\t\t\t\t\tpi_btn: social.account.toLowerCase() == 'pinterest',\r" +
    "\n" +
    "\t\t\t\t\tli_btn: social.account.toLowerCase() == 'linkedin',\r" +
    "\n" +
    "\t\t\t\t\ttr_btn: social.account.toLowerCase() == 'tumblr',\r" +
    "\n" +
    "\t\t\t\t\tyt_btn: social.account.toLowerCase() == 'youtube',\r" +
    "\n" +
    "\t\t\t\t\tot_btn: social.account.toLowerCase() == 'other',\r" +
    "\n" +
    "\t\t\t\t\tma_btn: social.account.toLowerCase() == 'mail'\r" +
    "\n" +
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


  $templateCache.put('partials/love.html',
    "<embed src=\"http://zagolovesyou.tumblr.com/\" frameborder=0>"
  );


  $templateCache.put('partials/project.html',
    "<div project-nav></div><div id=projectLayout ng-class=\"{caseStudy: project.content.case_study}\"><div class=featuredImage image-loader><img ng-src={{project.content.featured_image.url}} alt={{project.content.featured_image.alt}} ng-class=\"{isPortrait: project.content.featured_image.isPortrait}\" precision-image={{project.content.featured_image.position}} aspect-ratio={{project.content.featured_image.aspectRatio}}></div><div class=projectContent><h1 ng-bind-html=project.title ng-if=project.content.case_study></h1><div class=projectDetails><div class=projectInfo><section><h2>Client</h2><p>{{project.content.client}}</p></section><section ng-if=project.content.project><h2>Project</h2><p ng-repeat=\"bodyText in project.content.project\">{{bodyText}}</p></section><section ng-if=project.content.services><h2>Services</h2><p ng-repeat=\"bodyText in project.content.services\">{{bodyText}}</p></section><section ng-repeat=\"detail in project.content.other_details\"><h2>{{detail.title}}</h2><p ng-repeat=\"bodyText in detail.details\">{{bodyText}}</p></section></div><a class=clientSite ng-href={{project.content.project_url}} ng-if=project.content.project_url>Visit Website</a><div class=socialAccounts ng-if=project.content.social_media.length><ul class=socialButtons><li ng-repeat=\"social in project.content.social_media\" ng-class=\"{\r" +
    "\n" +
    "\t\t\t\t\t\t\tfb_btn: social.account.toLowerCase() == 'facebook',\r" +
    "\n" +
    "\t\t\t\t\t\t\ttw_btn: social.account.toLowerCase() == 'twitter',\r" +
    "\n" +
    "\t\t\t\t\t\t\tbe_btn: social.account.toLowerCase() == 'behance',\r" +
    "\n" +
    "\t\t\t\t\t\t\tpi_btn: social.account.toLowerCase() == 'pinterest',\r" +
    "\n" +
    "\t\t\t\t\t\t\tli_btn: social.account.toLowerCase() == 'linkedin',\r" +
    "\n" +
    "\t\t\t\t\t\t\ttr_btn: social.account.toLowerCase() == 'tumblr',\r" +
    "\n" +
    "\t\t\t\t\t\t\tma_btn: social.account.toLowerCase() == 'mail'\r" +
    "\n" +
    "\t\t\t\t\t\t}\"><a href={{social.url}} target=_blank></a></li></ul></div></div><div ng-if=project.content.case_study class=projectBody ng-class=\"{singleColumn: project.body.length < 1500}\" ng-bind-html=project.body new-window-links></div></div></div><div id=projectImages ng-if=imageSections.length><section ng-repeat=\"section in imageSections\"><h6>{{section.label}}</h6><div class=imageWrapper><div ng-repeat=\"image in section.images\" class=imageBox ng-class=\"{halfImage: section.images.length > 1}\" image-loader><img ng-src={{image.url}} alt={{image.alt}} ng-class=\"{isPortrait: image.isPortrait}\" precision-image={{image.position}} aspect-ratio={{image.aspectRatio}}></div></div></section></div><div id=readAbout ng-if=\"project.content.case_study && project.content.read_about.length\"><h3>Read More About {{project.content.name}}</h3><section ng-repeat=\"story in project.content.read_about\"><a href={{story.url}} target=_blank><p>{{story.title}}</p><h4>{{story.source}}</h4></a></section></div><div id=relatedProjects ng-if=\"project.content.case_study && project.content.related_projects.length\"><h3>Related Projects</h3><section ng-repeat=\"related in project.content.related_projects\"><a ui-sref=\"project({project: related.slug})\"><div class=imgWrapper image-loader><img ng-src={{related.image.url}} alt={{related.image.alt}} ng-class=\"{isPortrait: related.image.isPortrait}\" precision-image={{related.image.position}} aspect-ratio={{related.image.aspectRatio}}></div><div class=contentWrapper><p>{{related.title}}</p><h4>{{related.client}}</h4></div></a></section></div>"
  );


  $templateCache.put('partials/projects.html',
    "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=projects></grid>"
  );


  $templateCache.put('partials/team.html',
    "<div class=blurb><h1 under-z str={{blurb.title}}></h1><div ng-bind-html=blurb.body></div></div><grid data-grid=members></grid>"
  );

}]);

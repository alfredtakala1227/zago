module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-script-link-tags');
	grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.initConfig({

		uglify: {

            options: {
                mangle: false,
                compress: {
                    drop_console: true,
                    keep_fargs: true,
                    hoist_funs: false,
                    hoist_vars: false    
                }
            },

            dependencies: {
                files: {
                    'site/js/lib/angular.js'    : [ 'components/js/lib/angular/**/*.js' ],
                    'site/js/lib/jquery.js'     : [ 'components/js/lib/jquery/**/*.js' ],
                    'site/js/lib/polyfills.js'  : [ 'components/js/lib/polyfills/**/*.js' ],
                    'site/js/lib/start_scripts.js'  : [ 'components/js/lib/start_scripts/**/*.js' ],
                    'site/js/lib/end_scripts.js'  : [ 
                    	'components/js/lib/end_scripts/buggyfill/*.js',
                    	'components/js/lib/end_scripts/buggyfill/modules/*.js'
                    ],
                    'site/js/lib/modernizr.js'  : [ 
	                    	'components/js/lib/modernizr/*.js',
	                    	'components/js/lib/modernizr/modules/*.js',
	                    	'components/js/lib/modernizr/modules/modules/*.js',
	                    	'components/js/lib/modernizr/modules/modules/modules*.js'
	                    ]
                }
            },

            dev: {
                options: { 
                    compress: false,
                    beautify: true,
                    expand: true,
                },

                files: {   /* Export main angular app file */
                    'site/js/app/main.js' : [ 'components/js/app/**/*.js' ]
                }
            },

            pro: { /* Compress and export application file + pieces */

                files: {   /* Export main angular app file */
                    'site/js/app/main.js' : [ 'components/js/app/**/*.js' ]
                }
            },

        },

        tags: {

            options: {
                scriptTemplate: '<script type="text/javascript" src="{{ path }}"></script>',
                linkTemplate: '<link rel="stylesheet" type="text/css" href="{{ path }}">'
            },

            css: {
                options: {
                    openTag: '<!-- css files -->',
                    closeTag: '<!-- /css files -->'
                },
                src: ['site/css/styles.css'],
                dest: 'site/index.html'
            },

            reqs: {
                options: {
                    openTag: '<!-- required files -->',
                    closeTag: '<!-- /required files -->'
                },
                src: [ 
                		'site/js/lib/polyfills.js',
                		'site/js/lib/modernizr.js',
                		'site/js/lib/jquery.js',
                		'site/js/lib/angular.js',
                		'site/js/lib/start_scripts.js'
                	],
                dest: 'site/index.html'
            },

            app: {
                options: {
                    openTag: '<!-- application files -->',
                    closeTag: '<!-- /application files -->'
                },
                src: [ 'site/js/app/main.js' ],
                dest: 'site/index.html'
            },

            end: {
                options: {
                    openTag: '<!-- closing files -->',
                    closeTag: '<!-- /closing files -->'
                },
                src: [ 'site/js/lib/end_scripts.js' ],
                dest: 'site/index.html'
            }
        },

		compass: {
			dev: {
				options: {
					config: 'config.rb'
				}
			}
		},

		autoprefixer: {
		    options: {
		      expand: true,
		      flatten: true,
		      browsers: ['> 1%']
		    },

		    dist: {
		      	src: 'components/css/**/*.css'
		    },
		},

        cssmin: {
             options: {
                advanced: false,
                shorthandCompacting: false,
                roundingPrecision: -1,
                maxLineLength: 12000
              },
              main: {
                files: {
                  'site/css/styles.css': ['components/css/**/*.css']
                }
              }
        },

		ngtemplates:  {
			app:        {
				cwd: 'site',
				src:      ['*.html','pieces/*.html','partials/*.html'],
				dest:     'components/js/app/modules/templates.js',
				options:  {
					htmlmin: {
						collapseBooleanAttributes:      true,
						collapseWhitespace:             true,
						removeAttributeQuotes:          true,
						removeComments:                 true, // Only if you don't use comment directives!
						removeEmptyAttributes:          true,
						removeRedundantAttributes:      true,
						removeScriptTypeAttributes:     true,
						removeStyleLinkTypeAttributes:  true
					}
				}
			}
		},

		watch: {
			options: {livereload: true},

			app: {
				files: ['components/js/app/**/*.js'],
				tasks: ['uglify:dev', 'tags:app']
			},

			deps: {
				files: ['components/js/lib/**/*.js'],
				tasks: ['uglify:dependencies', 'tags']
			},
			sass: {
				files: ['components/base.scss', 'components/sass/**/*.scss'],
				tasks: ['cssStack', 'tags:css']
			},
			html: {
				files: ['site/partials/*.html', 'site/pieces/*.html'],
				tasks: ['ngtemplates']
			}
		}

	});

    
    grunt.registerTask('min', ['cssmin']);  
    grunt.registerTask('cssStack', ['compass', 'autoprefixer', 'cssmin']);
	grunt.registerTask('stack', ['cssStack', 'ngtemplates', 'uglify:dependencies']);

	grunt.registerTask('default', ['stack', 'uglify:dev', 'tags', 'watch']);
	grunt.registerTask('build', ['stack', 'uglify:pro', 'tags']);

}
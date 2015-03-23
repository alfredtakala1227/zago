module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-compass');
	grunt.loadNpmTasks('grunt-angular-templates');
	grunt.loadNpmTasks('grunt-autoprefixer');
	grunt.loadNpmTasks('grunt-usemin');

	grunt.initConfig({

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
		      	src: 'site/css/*.css'
		    },
		},

		ngtemplates:  {
			app:        {
				cwd: 'site',
				src:      ['*.html','pieces/*.html','partials/*.html'],
				dest:     'site/js/app/templates.js',
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

			scripts: {
				files: ['site/js/**/*.js'],
				tasks: []
			},
			sass: {
				files: ['components/**/*.scss'],
				tasks: ['compass:dev', 'autoprefixer']
			},
			html: {
				files: ['site/index.html', 'site/partials/*.html', 'site/pieces/*.html'],
				tasks: ['ngtemplates']
			}
		}

	});

	grunt.registerTask('default', ['compass', 'autoprefixer',  'ngtemplates', 'watch']);
}
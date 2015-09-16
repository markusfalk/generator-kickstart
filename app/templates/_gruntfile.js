module.exports = function(grunt) {

  'use strict';

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    watch: {
      options: {
        spawn: false
      },

      // Styling
      scss: {
        files: 'components/**/*.scss',
        tasks: ['sync:webfonts', 'imagemin', 'compass:development', 'modernizr']
      },

      // Scripting
      js: {
        files: ['components/*.js', 'components/app/**/*.js', '!components/app/_deferred/**/*.js'],
        tasks: ['requirejs:development', 'modernizr'],
      },
      js_deferred: {
        files: ['components/app/_deferred/**/*.js'],
        tasks: ['uglify:deferred', 'modernizr'],
      },
      js_bower: {
        files: ['components/bower/**/*.js'],
        tasks: ['uglify:external', 'requirejs:development'],
      },
      json: {
        options: { livereload: true },
        files: ['components/app/**/*.json'],
        tasks: ['sync:json'],
      },

      // HTML
      html: {
        options: { livereload: true },
        files: ['*.html','components/app/**/*.html' , '!components/bower/**/*.html', '!build/**/*.html'],
        tasks: ['replace'],
      },

      // Images
      img_content: {
        options: { livereload: true },
        files: 'img/**/*.{png,gif,jpg,svg}',
        tasks: ['imagemin:content'],
      },
      img_background: {
        options: { livereload: true },
        files: 'components/**/*.{png,gif,jpg,svg}',
        tasks: ['clean:css', 'imagemin:backgrounds' , 'compass:development', 'clean:development'],
      },

      // websocket support
      livereload: {
        options: { livereload: true },
        files: ['build/**/*.{css,js}']
      }
    },

    compass: {
      options: {
        asset_cache_buster: false,
        bundleExec: true,
        cssDir: 'build/assets/css',
        httpFontsPath: '/assets/font',
        httpImagesPath: '/assets/img',
        imagesDir: 'build/assets/img',
        noLineComments: true,
        require: 'sass-css-importer',
        sassDir: 'components',
        specify: ['components/*.scss', 'components/app/_deferred/**/*.scss']
      },
      development: {
        options: {
          environment: 'development',
          sourcemap: true
        }
      },
      production: {
        options: {
          environment: 'production',
          httpPath: '/' // . = relative
        }
      }
    },

    replace: {
      modules: {
        options: {
          excludeBuiltins: true,
          patterns: [
            {
              match: /{(app|deferred):{([\w|\-]*)}}/g,
              replacement: function (match, type, file) {

                // use regular file

                // add app folder to deferred component
                type = type === 'deferred' ? 'app/_' + type : type;

                // get file for replacement
                output =  grunt.file.read('components/' + type + '/' + file + '/' + file + '.html');

                // check if output include some 'app placeholder'
                match = output.match( /{(app):{([\w|\-]{0,})}}/g );
                if( match !== null ) {

                  // replace each placeholder with its accociated file content
                  match.forEach(function(elem){
                    var
                    inner_match = elem.replace( /[{}]/g,'').split(':'),
                    inner_type = inner_match[0],
                    inner_file = inner_match[1],
                    inner_regex = new RegExp("{("+inner_type+"):{"+inner_file+"}}", "g"),

                    inner_output =  grunt.file.read('components/' + inner_type + '/' + inner_file + '/' + inner_file + '.html');

                    // write file content into main output
                    output = output.replace( inner_regex , inner_output );
                  });

                }

                return output;
              }
            },
            {
              match: /{(app|deferred):{(.+):{(.+)}}}/g,
              replacement: function (match, type, component, alt_file) {

                // use alternate file

                // add app folder to deferred component
                type = type === 'deferred' ? 'app/_' + type : type;

                // get file for replacement
                return grunt.file.read('components/' + type + '/' + component + '/' + alt_file + '.html');
              }
            }
          ]
        },
        files: [
          {
            expand: true,
            flatten: true,
            src: ['*.html'],
            dest: 'build/'
          }
        ]
      }
    },

    requirejs: {
      options: {
        mainConfigFile: 'components/<%= ProjectName %>.js',
        name: '<%= ProjectName %>',
        out: 'build/assets/js/<%= ProjectName %>.js',
        useStrict: true
      },
      development: {
        options: {
          generateSourceMaps: true,
          optimize: 'none'
        }
      },
      production: {
        options: {
          generateSourceMaps: false,
          optimize: 'uglify'
        }
      }
    },

    uglify: {
      deferred_development: {
        options: {
          sourceMap: true
        },
        files: [{
          expand: true,
          flatten: true,
          cwd: 'components/app/_deferred',
          src: ['**/*.js', '!**/test-*.js'],
          dest: 'build/assets/js/deferred'
        }]
      },
      deferred_production: {
        files: [{
          expand: true,
          flatten: true,
          cwd: 'components/app/_deferred',
          src: ['**/*.js', '!**/test-*.js'],
          dest: 'build/assets/js/deferred'
        }]
      },
      external: {
        files: {
          'build/assets/js/libs/require.js': ['components/libs/requirejs/require.js']
        }
      }
    },

    imagemin: {
      content: {
        files: [{
          flatten: true,
          expand: true,
          cwd: 'img',
          src: ['**/*.{gif,ico,jpg,png,svg}'],
          dest: 'build/img'
        }]
      },
      backgrounds: {
        files: [{
          flatten: true,
          expand: true,
          cwd: 'components/app',
          src: ['**/*.{gif,jpg,png,svg}'],
          dest: 'build/assets/img'
        }]
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: ['components/app/**/*.js']
    },

    csslint: {
      options: {
        csslintrc: '.csslintrc',
        import: false
      },
      lax: {
        src: ['build/assets/css/**/*.css']
      }
    },

    accessibility: {
      options : {
        accessibilityLevel: 'WCAG2<%= WCAG2 %>',
        accessibilityrc: true,
        domElement: true,
        reportLevels: {
          notice: false,
          warning: true,
          error: true
        }
      },
      development : {
        files: [{
          expand  : true,
          cwd     : 'build/',
          src     : ['*.html']
        }]
      }
    },

    clean: {
      css: {
        src: ['build/assets/css/**/*.css']
      },
      build: {
        src: ['build']
      }
    },

    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:10000/qunit/qunit-test-suite.html'
          ]
        }
      }
    },

    connect: {
      server: {
        options: {
          port: 10000,
          base: '.'
        }
      }
    },

    sync: {
      webfonts: {
        files: [{
          flatten: true,
          expand: true,
          cwd: 'components/app',
          src: ['**/font/*.{ttf,eot,woff,svg}'],
          dest: 'build/assets/font'
        }],
        verbose: true
      },
      json: {
        files: [{
          flatten: true,
          expand: true,
          cwd: 'components/app',
          src: ['**/*.json'],
          dest: 'build/assets/json'
        }],
        verbose: true
      },
      favicon: {
        files: [{
          flatten: true,
          expand: true,
          cwd: '.',
          src: ['favicon.ico', 'apple-touch-icon.png', 'windows-tile-icon.png'],
          dest: 'build/assets/img'
        }],
        verbose: true
      }
    },

    modernizr: {
      dist: {
        'devFile' : 'components/libs/modernizr/modernizr.js',
        'outputFile' : 'build/assets/js/libs/modernizr.js',
        'extra' : {
          'shiv' : <% if (oldIE) { %>true<% } else { %>false<% } %>,
          'printshiv' : <% if (oldIE) { %>true<% } else { %>false<% } %>,
          'load' : false,
          'mq' : false,
          'cssclasses' : true
        },
        'files' : {
          'src': ['components/app/**/*.js', 'build/**/*.css']
        }
      }
    },

    jsdoc : {
      dist : {
        src: ['components/app/**/*.js'],
        options: {
          destination: 'documentation'
        }
      }
    },

    scsslint: {
      options: {
        bundleExec: true,
        colorizeOutput: true,
        compact: true,
        config: '.scsslintrc',
        reporterOutput: null
      },
      scss: [
        'components/app/**/*.scss',
      ]
    }

  });

  grunt.loadNpmTasks('grunt-accessibility');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-csslint');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-modernizr');
  grunt.loadNpmTasks('grunt-newer');
  grunt.loadNpmTasks('grunt-replace');
  grunt.loadNpmTasks('grunt-scss-lint');
  grunt.loadNpmTasks('grunt-sync');

  grunt.registerTask('default', [
    'clean:build',
    'replace',
    'imagemin',
    'sync',
    'compass:development',
    'requirejs:development',
    'uglify:deferred_development',
    'uglify:external',
    'modernizr'
  ]);

  grunt.registerTask('production', [
    'clean:build',
    'replace',
    'imagemin',
    'sync',
    'compass:production',
    'requirejs:production',
    'uglify:deferred_production',
    'uglify:external',
    'modernizr'
   ]);

  grunt.registerTask('test', [
    'csslint',
    'scsslint',
    'jshint',
    'accessibility',
    'connect',
    'qunit:all'
  ]);

  grunt.registerTask('doc', [
    'jsdoc'
  ]);

};

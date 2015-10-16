var Builder = require('systemjs-builder');
var Rsvp = require('rsvp');

module.exports = function(grunt) {
    require('jit-grunt')(grunt, {
        replace: 'grunt-text-replace'
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            releaseDirectory: '',
            buildVersion: ''
        },

        babel: {
            options: {
                modules: 'system',
                sourceMap: true
            },
            compiled: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: [
                        '**/*.js',
                        '!**/main.js',
                        '!**/lib/**',
                    ],
                    dest: 'compiled'
                }]
            }
        },
        copy: {
            options: {
                mtimeUpdate: true,
                timestamp: true
            },
            compiled: {
                expand: true,
                cwd: 'src/',
                src: [
                    '**/*',
                    'css/*',
                    '!**/background/**',
                    '!**/common/**',
                    '!**/content_scripts/**',
                    '!**/options/**',
                    '!**/popup/**',
                    '!**/test/**',
                    '**/main.js'
                ],
                dest: 'compiled/'
            },
            release: {
                expand: true,
                cwd: 'dist/',
                src: '**/*',
                dest: '<%= meta.releaseDirectory %>'
            },
            dist: {
                expand: true,
                cwd: 'src/',
                src: [
                    '_locales/**',
                    'css/**',
                    'img/**',
                    'manifest.json',
                    'options.html',
                    'popup.html'
                ],
                dest: 'dist/'
            }
        },
        watch: {
            copyCompiled: {
                options: {
                    event: ['added', 'changed'],
                    cwd: 'src/js'
                },
                files: [
                    'background/**/*',
                    'common/**/*',
                    'content_scripts/**/*',
                    'options/**/*',
                    'popup/**/*',
                    'test/**/*',
                    '!**/main.js'
                ],
                tasks: ['newer:babel:compiled']
            },
            copyUncompiled: {
                options: {
                    event: ['added', 'changed'],
                    cwd: 'src'
                },
                files: [
                    '**/*',
                    'css/*',
                    '!**/background/**',
                    '!**/common/**',
                    '!**/content_scripts/**',
                    '!**/options/**',
                    '!**/popup/**',
                    '!**/test/**',
                    '**/main.js'
                ],
                tasks: ['newer:copy:compiled']
            },
            js: {
                files: [
                    'src/js/**/*.js',
                    '!src/js/lib/**/*.js'
                ],
                tasks: [
                    // 'jscs',
                    'jshint'
                ]
            }
        },

        jscs: {
            src: [
                'src/js/**/*.js',
                '!src/js/lib/**/*.js'
            ],
            options: {
                config: '.jscsrc',
                verbose: true,
                fix: true
            }
        },
        jshint: {
            options: {
                'node': true,
                'esnext': true,
                'bitwise': false,
                'curly': false,
                'eqeqeq': true,
                'eqnull': true,
                'immed': true,
                'latedef': true,
                'maxparams': 5,
                'maxdepth': 4,
                'maxstatements': 35,
                'maxcomplexity': 10,
                'newcap': true,
                'nonew': true,
                'noarg': true,
                'undef': true,
                'strict': false,
                'predef': [
                    'document',
                    'window',
                    'chrome',
                    'System',
                    'mocha',
                    'describe',
                    'it'
                ],
                'ignores': ['src/js/lib/**/*.js']
            },
            files: [
                'src/js/**/*.js'
            ]
        },
        connect: {
            server: {
                options: {
                    port: 4044,
                    base: './src'
                }
            }
        },
        mocha: {
            tests: {
                options: {
                    log: true,
                    logErrors: true,
                    run: false,
                    inject: '',
                    urls: ['http://localhost:4044/test.html']
                }
            }
        },

        htmlmin: {
            options: {
                removeComments: true,
                collapseWhitespace: true,
                collapseBooleanAttributes: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeScriptTypeAttributes: true,
                removeStyleLinkTypeAttributes: true,
                removeOptionalTags: true
            },
            dist: {
                files: {
                    'dist/options.html': 'dist/options.html',
                    'dist/popup.html': 'dist/popup.html'
                }
            }
        },
        imagemin: {
            files: {
                expand: true,
                cwd: 'dist/img',
                src: ['**/*.{png,jpg,gif}'],
                dest: 'dist/img/'
            }
        },
        replace: {
            htmlBundle: {
                src: ['dist/*.html'],
                overwrite: true,
                replacements: [
                    {
                        from: '<script src=\'js/lib/jspm_packages/system.js\'></script>',
                        to: ''
                    },
                    {
                        from: '<script src=\'js/lib/jspm.config.js\'></script>',
                        to: ''
                    }
                ]
            }
        },
        clean: {
            compiledFile: {
                expand: true,
                cwd: 'compiled',
                src: ''
            }
        },
        compress: {
            release: {
                options: {
                    archive: 'packages/TweetNowBrowsing v<%= meta.buildVersion %>.zip'
                },
                files: [{
                    expand: true,
                    cwd: '<%= meta.releaseDirectory %>',
                    src: ['**']
                }]
            }
        }
    });

    grunt.registerTask('compile', ['copy:compiled', 'babel:compiled', 'watch']);
    grunt.registerTask('test', ['jshint', 'jscs', 'connect', 'mocha']);

    grunt.registerTask('buildDist', function() {
        grunt.task.run('copy:dist');

        var backgroundBuilder = new Builder('src/', 'src/js/lib/jspm.config.js');
        var contentScriptsBuilder = new Builder('src/', 'src/js/lib/jspm.config.js');
        var optionsBuilder = new Builder('src/', 'src/js/lib/jspm.config.js');
        var popupBuilder = new Builder('src/', 'src/js/lib/jspm.config.js');

        var done = this.async();
        var options = {
            runtime: false,
            sourceMaps: false,
            minify: true
        };

        Rsvp.Promise.all([
            backgroundBuilder.buildStatic('js/background/app.js', 'dist/js/background/main.js', options),
            contentScriptsBuilder.buildStatic('js/content_scripts/say_hello/app.js', 'dist/js/content_scripts/say_hello/main.js', options),
            optionsBuilder.buildStatic('js/options/app.js', 'dist/js/options/main.js', options),
            popupBuilder.buildStatic('js/popup/app.js', 'dist/js/popup/main.js', options),
        ]).then(function() {
            grunt.task.run('replace:htmlBundle');
            done();
        }).catch(function(error) {
            console.log('buildStatic error:', error);
            done();
        });
    });

    grunt.registerTask('buildManifestJSON', function(buildFlag){
        var isRelease = false;
        if (buildFlag === 'release') {
            isRelease = true;
        }

        // load json
        var manifestJSON = grunt.file.readJSON('dist/manifest.json');

        // background script
        manifestJSON['background']['scripts'] = ['js/background/main.js'];

        // content scripts
        var contentScripts = manifestJSON['content_scripts'];
        for(var i=0; i<contentScripts.length; i++) {
            if ('js' in contentScripts[i]) {
                for(var j=0; j<contentScripts[i].js.length; j++) {
                    if (contentScripts[i].js[j].includes('/main.js')) {
                        contentScripts[i].js = [contentScripts[i].js[j]];
                        break;
                    }
                }
            }
        }

        // key
        if (isRelease) {
            delete manifestJSON['key'];
        }

        // save json
        var strJSON = JSON.stringify(manifestJSON, null, '  ');
        grunt.file.write('dist/manifest.json', strJSON);
    });

    grunt.registerTask('compressRelease', function(releaseDirectory) {
        grunt.config.set('meta.releaseDirectory', releaseDirectory);

        var manifestJSON = grunt.file.readJSON('dist/manifest.json');
        grunt.config.set('meta.buildVersion', manifestJSON.version);

        grunt.task.run('copy:release');
        grunt.task.run('compress:release');
    });

    grunt.registerTask('build', function(buildFlag) {
        var isRelease = buildFlag === 'release';

        grunt.task.run('buildDist');
        grunt.task.run('buildManifestJSON:' + buildFlag);
        grunt.task.run('imagemin', 'htmlmin');
        grunt.task.run('compressRelease:' + 'release/');
    });
};

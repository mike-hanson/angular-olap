module.exports = function (grunt) {
    grunt.initConfig({
            pkg:    grunt.file.readJSON('package.json'),
            uglify: {
                build: {
                    options: {
                        compress: false,
                        mangle:   false,
                        beautify: true
                    },
                    src:     [
                        'src/module/components/*.js',
                        'src/module/module.js'
                    ],
                    dest:    'build/angular-olap.js'
                },
                dist:  {
                    options: {
                        compress: true,
                        mangle:   true,
                        beautify: false
                    },
                    src:     [
                        'build/angular-olap.js'
                    ],
                    dest:    'dist/angular-olap.min.js'
                },
                lib:   {
                    options: {
                        compress: true,
                        mangle:   false,
                        beautify: false
                    },
                    src:     [
                        'bower_components/jquery/dist/jquery.js',
                        'bower_components/angular/angular.js',
                        'bower_components/bootstrap/dist/bootstrap.js',
                        'bower_components/angular-ui-tree/dist/angular-ui-tree.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.js'
                    ],
                    dest:    'app/js/lib.js'
                },
                app:   {
                    options: {
                        compress: false,
                        mangle:   false,
                        beautify: true
                    },
                    src:     [
                        'src/app/module.js',
                        'src/app/services/*.js',
                        'src/app/controllers/*.js',
                        'src/app/directives/*.js'
                    ],
                    dest:    'app/js/app.js'
                }
            },
            cssmin: {
                libcss: {
                    files: {
                        'app/css/lib.css': [
                            'bower_components/bootstrap/dist/css/bootstrap.css',
                            'bower_components/bootstrap/dist/css/bootstrap.theme.css',
                            'bower_components/angular-ui-tree/dist/angular-ui-tree.css',
                            'bower_components/font-awesome/css/font-awesome.css'
                        ]
                    }
                },
                appcss: {
                    files: {
                        'app/css/app.css': [
                            'build/css/app/tree.sprites.css',
                            'src/css/app.css'
                        ]
                    }
                }
            },
            copy:   {
                dist: {
                    files: [
                        {
                            expand:  true,
                            src:     ['build/angular-olap.js'],
                            dest:    'dist',
                            filter:  'isFile',
                            flatten: true
                        }
                    ]
                },
                pcg:  {
                    files: [
                        {
                            expand:  true,
                            src:     ['build/angular-olap.js'],
                            dest:    'C:/_shields/pcg/src/__client/build/js/lib',
                            filter:  'isFile',
                            flatten: true
                        }
                    ]
                },
                appjs:  {
                    files: [
                        {
                            expand:  true,
                            src:     ['build/angular-olap.js'],
                            dest:    'app/js',
                            filter:  'isFile',
                            flatten: true
                        }
                    ]
                },
                assets: {
                    files: [
                        {
                            expand:  true,
                            cwd:     'bower_components/font-awesome/fonts',
                            src:     ['*'],
                            dest:    'app/fonts/',
                            filter:  'isFile',
                            flatten: true
                        },
                        {
                            expand:  true,
                            cwd:     'bower_components/bootstrap/dist/fonts',
                            src:     ['*'],
                            dest:    'app/fonts/',
                            filter:  'isFile',
                            flatten: true
                        }
                    ]
                }
            }
            ,
            karma:  {
                unit: {
                    configFile: 'karma.conf.js',
                    background: false,
                    autoWatch:  false,
                    singleRun:  true
                }
            },
            sprity: {
                options: {
                    processor: 'css',
                    out:       'build/css/app/',
                    base64:    true
                },
                tree:    {
                    options: {
                        prefix: 'tree-icon',
                        style:  'tree.sprites.css',
                        margin: 1
                    },
                    src:     ['src/css/treesprites/*.png'],
                    dest:    'build/css/app/tree.sprites'
                }
            },
            watch:  {
                js: {
                    files: [
                        'src/**/*.js',
                        'specs//**/*.js'
                    ],
                    tasks: [
                        'uglify',
                        'copy'
                    ]
                },
                css: {
                    files: [
                        'src/**/*.css'
                    ],
                    tasks: [
                        'cssmin'
                    ]
                },
                grunt: {
                    files: ['gruntfile.js']
                }
            }
        }
    );
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
    grunt.registerTask('default', [
        'uglify',
        'cssmin',
        'copy',
        'watch'
    ]);
    grunt.registerTask('test', ['karma']);
};

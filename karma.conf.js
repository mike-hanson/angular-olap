module.exports = function(config){
    config.set({
        basePath: __dirname,
        files: [
            'bower_components/jssubstitute/jssubstitute.js',
            'bower_components/jsbuilder/jsBuilder.js',
            'src/module/**/*.js',
            'specs/helpers/*.js',
            'specs/*.js'
        ],
        exclude: ['src/module/module.js'],
        preprocessors: {
            'src/components/*.js': 'coverage'
        },
        reporters: ['story', 'coverage'],
        coverageReporter: {
            type: 'html',
            dir: __dirname + '/karma/coverage'
        },
        browsers: ['PhantomJS'],
        frameworks: ['jasmine'],
        logLevel: config.LOG_INFO
    });
};
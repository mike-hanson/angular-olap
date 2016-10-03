module.exports = function(wallaby) {
    wallaby.defaults.files.load = false;
    wallaby.defaults.files.instrument = false;
    wallaby.defaults.files.ignore = true;
    return {
        "files": [
            {pattern: 'bower_components/jsSubstitute/jsSubstitute.js', load: true, instrument: false, ignore: false},
            {pattern: 'bower_components/jsBuilder/jsBuilder.js', load: true, instrument: false, ignore: false},
            {pattern: 'bower_components/jasmine-expect/dist/jasmine-matchers.js', load: true, instrument: false, ignore: false},
            {pattern: 'specs/helpers/*.js', load: true, instrument: false, ignore: false},
            {pattern: 'src/**/*.js', load: true, instrument: true, ignore: false},
            {pattern: 'src/**/module.js', load: false, instrument: false, ignore: true}
        ],
        "tests": ["specs/*Spec.js"]
    }
};
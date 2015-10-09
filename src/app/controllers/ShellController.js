(function (window) {
    'use strict';

    var demo = (window.demo = window.demo || {});

    demo.ShellController = function ($scope, xmlaService) {
        var knownAcronyms = ['url'];

        var data = {
            username: 'PcgXmlaUser',
            password: 'Shi3ldsEner@y',
            url:      'http://localhost:8060/olap/msmdpump.dll'
        };
        var model = {
            data:            data,
            discovered:      [],
            discoveredNames: [],
            discoveredKeys:  []
        };
        $scope.model = model;

        function processDiscoverResult(result) {
            generateNamesAndKeys(result[0]);
            $scope.model.discovered = result;
        }

        $scope.discoverDataSources = function () {
            xmlaService.discoverDataSources(getConfig()).then(function (result) {
                processDiscoverResult(result);
            });
        };

        $scope.discoverCatalogs = function () {
            xmlaService.discoverCatalogs(getConfig()).then(function (result) {
                processDiscoverResult(result)
            });
        };

        $scope.discoverCubes = function () {
            xmlaService.discoverCubes(getConfig()).then(function (result) {
                processDiscoverResult(result);
            });
        };

        function getConfig() {
            return {
                username: $scope.model.data.username,
                password: $scope.model.data.password,
                url:      $scope.model.data.url
            };
        }

        function generateNamesAndKeys(item) {
            var names = [], keys = [];

            for (var name in item) {
                if (item.hasOwnProperty(name)) {
                    keys.push(name);
                    names.push(formatName(name));
                }
            }
            $scope.model.discoveredKeys = keys;
            $scope.model.discoveredNames = names;

        }

        function formatName(name) {
            if (isAllLowerCase(name) && isAcronym(name)) {
                return name.toUpperCase();
            }

            return (name.substr(0, 1).toUpperCase() + name.substr(1)).replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
        }

        function isAcronym(name) {
            return knownAcronyms.indexOf(name) !== -1;
        }

        function isAllLowerCase(name) {
            return name.match(/^[a-z]*$/);
        }
    };

    if (demo.app) {
        demo.app.controller('ShellController', [
            '$scope',
            'xmlaService',
            demo.ShellController
        ]);
    }
})(window);
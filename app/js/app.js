(function(window, angular) {
    var demo = window.demo = window.demo || {};
    demo.app = angular.module("demoApp", [ "angular-olap", "ui.tree", "ui.router" ]).config([ "$stateProvider", "$urlRouterProvider", function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise("/");
        $stateProvider.state("home", {
            url: "/",
            templateUrl: "/home.html"
        }).state("table", {
            url: "/table",
            templateUrl: "/table.html"
        }).state("query", {
            url: "/query",
            templateUrl: "/query.html"
        }).state("error", {
            url: "/error",
            templateUrl: "/error.html"
        });
    } ]);
})(window, angular);

(function(window) {
    "use strict";
    var demo = window.demo = window.demo || {};
    demo.ShellController = function($scope, $state, xmlaService) {
        var knownAcronyms = [ "url" ];
        var data = {
            username: "pcgxmla",
            password: "Shi3ldsEner@y",
            url: "http://localhost:8060/olap/msmdpump.dll",
            mdx: "SELECT NON EMPTY { [Measures].[Average Consumption], [Measures].[Consumption] } ON COLUMNS," + " NON EMPTY { ([Account].[Account].[Account].ALLMEMBERS * [Date].[Date Hierarchy].[Day].ALLMEMBERS ) } ON ROWS " + "FROM [PCG Analytics]"
        };
        var model = {
            data: data,
            discovered: [],
            discoveredNames: [],
            discoveredKeys: [],
            queryResults: [],
            queryResultNames: [],
            queryResultKeys: [],
            treeData: [],
            selectedItem: null,
            rootNode: null,
            faultMessage: null
        };
        $scope.model = model;
        $scope.connect = function() {
            resetRootNode();
            loadDataSources();
        };
        $scope.toggleCollapsed = function(treeNode) {
            var node = treeNode.$modelValue;
            node.isCollapsed = !node.isCollapsed;
            if (!node.isCollapsed) {
                switch (node.nodeType) {
                  case "data-source":
                    loadCatalogs(node);
                    break;

                  case "database":
                    loadCubes(node);
                    break;

                  case "cube":
                    loadMeasureGroups(node);
                    loadDimensions(node);
                    break;

                  case "measure-group":
                    loadMeasures(node);
                    break;

                  case "dimension":
                    loadMembers(node);
                    break;

                  case "hierarchy":
                    loadHierarchyMembers(node);
                    break;
                }
            }
        };
        $scope.selectNode = function(treeNode) {
            var node = treeNode.$modelValue;
            if ($scope.model.selectedItem) {
                $scope.model.selectedItem.isSelected = false;
            }
            node.isSelected = true;
            $scope.model.selectedItem = node;
            switch (node.nodeType) {
              case "data-source":
              case "database":
              case "folder":
                $state.go("table");
                break;

              case "cube":
                $state.go("query");
                break;

              default:
                $state.go("home");
                break;
            }
            if (node.isCollapsible) {
                if (node.isCollapsed) {
                    $scope.toggleCollapsed(treeNode);
                } else {
                    populateDiscovered(node);
                }
            }
        };
        $scope.executeMdx = function() {
            var config = getConfig();
            config.mdx = $scope.model.data.mdx;
            config.catalogName = $scope.model.selectedItem.$localData.catalogName;
            xmlaService.executeStatement(config).then(function(result) {
                processQueryResult(result);
            }, handleRejection);
        };
        function resetRootNode() {
            $scope.model.rootNode = {
                title: $scope.model.data.url,
                nodeType: "xmla-source",
                isCollapsed: false,
                isSelected: true,
                isCollapsible: true,
                nodes: []
            };
            $scope.model.treeData = [ $scope.model.rootNode ];
            $scope.model.selectedItem = $scope.model.rootNode;
        }
        function loadDataSources() {
            xmlaService.discoverDataSources(getConfig()).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    $scope.model.rootNode.nodes.push({
                        title: item.dataSourceName,
                        nodeType: "data-source",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
                populateDiscovered($scope.model.selectedItem);
            }, handleRejection);
        }
        function loadCatalogs(node) {
            xmlaService.dataSourceName(node.$localData.dataSourceName);
            xmlaService.discoverCatalogs(getConfig()).then(function(result) {
                node.nodes = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.catalogName,
                        nodeType: "database",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
                populateDiscovered($scope.model.selectedItem);
            }, handleRejection);
        }
        function loadCubes(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            xmlaService.discoverCubes(getConfig()).then(function(result) {
                node.nodes = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.cubeName,
                        nodeType: "cube",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
                populateDiscovered($scope.model.selectedItem);
            }, handleRejection);
        }
        function loadMeasureGroups(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            var config = getConfig();
            config.cubeName = node.$localData.cubeName;
            ensureCubFolders(node);
            xmlaService.discoverMeasureGroups(config).then(function(result) {
                node.nodes[0].nodes = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes[0].nodes.push({
                        title: item.measuregroupName,
                        nodeType: "measure-group",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, handleRejection);
        }
        function loadDimensions(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            var config = getConfig();
            config.cubeName = node.$localData.cubeName;
            ensureCubFolders(node);
            xmlaService.discoverDimensions(config).then(function(result) {
                node.nodes[1].nodes = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes[1].nodes.push({
                        title: item.dimensionName,
                        nodeType: "dimension",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, handleRejection);
        }
        function loadMembers(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            var config = getConfig();
            config.dimensionUniqueName = node.$localData.dimensionUniqueName;
            node.nodes = [];
            xmlaService.discoverDimensionMembers(config).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.memberName,
                        nodeType: "member",
                        isCollapsible: false,
                        isCollapsed: false,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, handleRejection);
            xmlaService.discoverHierarchies(config).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.hierarchyName,
                        nodeType: "hierarchy",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, handleRejection);
        }
        function loadHierarchyMembers(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            var config = getConfig();
            config.hierarchyUniqueName = node.$localData.hierarchyUniqueName;
            node.nodes = [];
            xmlaService.discoverHierarchyMembers(config).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.memberName,
                        nodeType: "member",
                        isCollapsible: false,
                        isCollapsed: false,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, handleRejection);
        }
        function ensureCubFolders(node) {
            if (!node.nodes.length) {
                node.nodes.push({
                    title: "Measure Groups",
                    nodeType: "folder",
                    nodes: [],
                    isCollapsible: true,
                    isCollapsed: true,
                    isSelected: false
                });
                node.nodes.push({
                    title: "Dimensions",
                    nodeType: "folder",
                    nodes: [],
                    isCollapsible: true,
                    isCollapsed: true,
                    isSelected: false
                });
            }
        }
        function handleRejection(response) {
            if (response.faultCode) {
                $scope.model.faultMessage = response;
            }
            $state.go("error");
        }
        function loadMeasures(node) {
            xmlaService.catalogName(node.$localData.catalogName);
            var config = getConfig();
            config.measuregroupName = node.$localData.measuregroupName;
            xmlaService.discoverMeasures(config).then(function(result) {
                node.nodes = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    node.nodes.push({
                        title: item.measureName,
                        nodeType: "measure",
                        isCollapsible: true,
                        isCollapsed: true,
                        isSelected: false,
                        nodes: [],
                        $localData: item
                    });
                }
            }, function(response) {
                if (response.faultCode) {
                    $scope.model.faultMessage = response;
                }
            });
        }
        function processDiscoverResult(result) {
            generateNamesAndKeys(result[0]);
            $scope.model.discovered = result;
        }
        function populateDiscovered(node) {
            var result = [];
            for (var i = 0; i < node.nodes.length; i++) {
                var child = node.nodes[i];
                result.push(child.$localData);
            }
            processDiscoverResult(result);
        }
        function processQueryResult(result) {
            generateResultsNamesAndKeys(result[0]);
            $scope.model.queryResults = result;
        }
        function getConfig() {
            return {
                username: $scope.model.data.username,
                password: $scope.model.data.password,
                url: $scope.model.data.url
            };
        }
        function generateNamesAndKeys(item) {
            var names = [], keys = [];
            for (var name in item) {
                if (item.hasOwnProperty(name) && name.indexOf("$$") === -1) {
                    keys.push(name);
                    names.push(formatName(name));
                }
            }
            $scope.model.discoveredKeys = keys;
            $scope.model.discoveredNames = names;
        }
        function generateResultsNamesAndKeys(item) {
            var names = [], keys = [];
            for (var name in item) {
                if (item.hasOwnProperty(name) && name.indexOf("$$") === -1) {
                    keys.push(name);
                    names.push(formatName(name));
                }
            }
            $scope.model.queryResultKeys = keys;
            $scope.model.queryResultNames = names;
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
        demo.app.controller("ShellController", [ "$scope", "$state", "xmlaService", demo.ShellController ]);
    }
})(window);
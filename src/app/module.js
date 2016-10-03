(function (window, angular) {
    var demo = (window.demo = window.demo || {});
    demo.app = angular.module('demoApp', ['angular-olap', 'ui.tree', 'ui.router'])
        .config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider){

            $urlRouterProvider.otherwise('/');

            $stateProvider
                .state('home', {
                    url:         '/',
                    templateUrl: '/home.html'
                })
                .state('table', {
                    url:         '/table',
                    templateUrl: '/table.html'
                })
                .state('query', {
                    url:         '/query',
                    templateUrl: '/query.html'
                })
                .state('error', {
                    url:         '/error',
                    templateUrl: '/error.html'
                });
        }]);
})(window, angular);
(function(window, angular) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    if(typeof angular !== 'undefined') {
        angular.module('angular-olap', [])
            .provider('xmlaService', [olap.XmlaServiceProvider])
            .service('mdxService', [olap.MdxService]);
    }
})(window, angular);

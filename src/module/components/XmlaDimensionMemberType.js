(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaDimensionMemberType = {
        Unknown: 0,
        Regular: 1,
        All: 2,
        Measure: 3,
        Formula: 4
    };
})(window);
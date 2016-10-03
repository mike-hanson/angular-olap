(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaAggregator = {
        Unknown: 0,
        Sum: 1,
        Count: 2,
        Min: 3,
        Max: 4,
        Avg: 6,
        StdDev: 7,
        DistinctCount: 8,
        None: 9,
        AvgOfChildren: 10,
        FirstChild: 11,
        LastChild: 12,
        FirstNonEmpty: 13,
        LastNoneEmpty: 14,
        ByAccount: 15,
        Calculated: 127
    }
})(window);
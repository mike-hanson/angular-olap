(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaStructure = {
        FullyBalanced: 0,
        RaggedBalanced: 1,
        Unbalanced: 2,
        Network: 3
    };
})(window);
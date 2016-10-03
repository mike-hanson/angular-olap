(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.MdxService = function() {
        var self = this;
        self.new = function() {
            return new olap.MdxBuilder();
        }
    }
})(window);
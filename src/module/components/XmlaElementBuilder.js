(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaElementBuilder = function () {
        var self = this;

        self.createNew = function(name, includeNamespace){
            if(typeof includeNamespace === 'undefined')
            {
                includeNamespace = false;
            }

            var xmlBuilder = new olap.XmlElementBuilder();
            var actualNamespaceUri = includeNamespace? olap.Namespace.Analysis: '';
            return xmlBuilder.createNew(name, actualNamespaceUri);
        };
    }
})(window);
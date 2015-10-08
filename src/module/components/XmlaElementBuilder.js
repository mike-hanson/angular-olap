(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaElementBuilder = function () {
        var self = this;

        var xmlaNamespace = 'urn:schemas-microsoft-com:xml-analysis';

        self.createNew = function(name, includeNamespace){
            if(typeof includeNamespace === 'undefined')
            {
                includeNamespace = false;
            }

            var xmlBuilder = new olap.XmlElementBuilder();
            var actualNamespaceUri = includeNamespace? xmlaNamespace: '';
            return xmlBuilder.createNew(name, actualNamespaceUri);
        };
    }
})(window);
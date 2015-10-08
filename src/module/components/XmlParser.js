(function (window) {
    'use strict';
    var olap = (window.olap = window.olap || {});

    olap.XmlParser = function () {
        var self = this;

        self.parse = function (xmlString) {
            var xmlDoc, domParser, parseError;
            if (!xmlString || typeof xmlString !== "string") {
                return null;
            }
            try {
                if (window.DOMParser) {
                    domParser = new DOMParser();
                    xmlDoc = domParser.parseFromString(xmlString, "text/xml");
                } else {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xmlString);
                }
            } catch (e) {
                parseError = e;
                xmlDoc = undefined;
            }
            if (!xmlDoc || !xmlDoc.documentElement || xmlDoc.getElementsByTagName("parsererror").length) {
                var errorContent = (xmlDoc? xmlDoc.documentElement.outerHTML: (parseError ? parseError.message : xmlString));
                throw new Error('Invalid XML: ' + errorContent);
            }
            return xmlDoc;
        }
    };
})(window);
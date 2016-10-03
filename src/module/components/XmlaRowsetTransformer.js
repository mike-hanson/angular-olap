(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaRowsetTransformer = function () {

        var self = this;
        var xmlParser = new olap.XmlParser();
        var xmlaNameFormatter = new olap.XmlaNameFormatter();

        self.transform = function(message){
            var result = [];
            var xmlDoc = xmlParser.parse(message);
            var rowElements = xmlDoc.getElementsByTagNameNS(olap.Namespace.Rowset, 'row');
            for (var i = 0; i < rowElements.length; i++) {
                var rowElement = rowElements[i];
                var rowObject = {};
                for (var j = 0; j < rowElement.childNodes.length; j++) {
                    var child = rowElement.childNodes[j];
                    var fieldName = xmlaNameFormatter.format(child.nodeName);
                    if(rowElement.getElementsByTagNameNS(olap.Namespace.Rowset, child.nodeName).length === 1)
                    {
                        rowObject[fieldName] = formatValue(child);
                    }
                    else{
                        if(!rowObject[fieldName])
                        {
                            rowObject[fieldName] = [];
                        }
                        rowObject[fieldName].push(formatValue(child));
                    }
                }
                result.push(rowObject);
            }
            return result;
        };

        function formatValue(node) {
            if(node.attributes.length){
                return formatValueAsType(node);
            }
            return node.textContent;
        }

        function formatValueAsType(node) {
            for (var i = 0; i < node.attributes.length; i++) {
                var attribute = node.attributes[i];
                if(attribute.name === 'xsi:type'){
                    if(attribute.value === 'xsd:double')
                    {
                        return Math.round(parseFloat(node.textContent) * 100) / 100;
                    }

                    if(attribute.value === 'xsd:integer')
                    {
                        return parseInt(node.textContent);
                    }
                }
            }
        }
    }
})(window);
(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaRowsetTransformer = function () {

        var self = this;
        var xmlParser = new olap.XmlParser();

        self.transform = function(message){
            var result = [];
            var xmlDoc = xmlParser.parse(message);
            var rowElements = xmlDoc.getElementsByTagNameNS(olap.Namespace.Rowset, 'row');
            for (var i = 0; i < rowElements.length; i++) {
                var rowElement = rowElements[i];
                var rowObject = {};
                for (var j = 0; j < rowElement.childNodes.length; j++) {
                    var child = rowElement.childNodes[j];
                    var fieldName = formatName(child.nodeName);
                    if(rowElement.getElementsByTagNameNS(olap.Namespace.Rowset, child.nodeName).length === 1)
                    {
                        rowObject[fieldName] = child.textContent;
                    }
                    else{
                        if(!rowObject[fieldName])
                        {
                            rowObject[fieldName] = [];
                        }
                        rowObject[fieldName].push(child.textContent);
                    }
                }
                result.push(rowObject);
            }
            return result;
        };

        function formatName(name) {
            if(isAllUpperCase(name)){
                return name.toLowerCase();
            }

            if(name.indexOf('_') !== -1)
            {
                var words = name.split('_');
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    words[i] = word.substr(0,1).toUpperCase() + word.substr(1).toLowerCase()
                }
                name = words.join('');
            }

            return name.substr(0,1).toLowerCase() + name.substr(1);
        }

        function isAllUpperCase(name) {
            return name.match(/^[A-Z]*$/);
        }
    }
})(window);
(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlElementBuilder = function () {
        var self = this;
        var $current = '';

        self.createNew = function(name, namespaceUri){
            $current = '<' + name + (namespaceUri? ' xmlns="' + namespaceUri + '"': '') + '></' + name + '>';
            return self;
        };

        self.setContent = function(content){
            var openingElementLength = $current.indexOf('>') + 1;
            var endElementStart = $current.lastIndexOf('</');
            $current = $current.substr(0, openingElementLength) + content + $current.substr(endElementStart);
            return self;
        };

        self.appendContent = function(content){
            var endElementStart = $current.lastIndexOf('</');
            $current = $current.substr(0, endElementStart) + content + $current.substr(endElementStart);
            return self;
        };

        self.build = function(){
            var result = $current;
            $current = '';
            return result;
        }
    }
})(window);
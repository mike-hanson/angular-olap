(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaNameFormatter = function () {
        var self = this;

        self.format = function (name) {
            if (!name || typeof name !== 'string') {
                throw new Error('A valid name to format is required.');
            }

            if (isAllUpperCaseWord(name)) {
                return name.toLowerCase();
            }

            name = formatMemberProperty(name);
            name = formatMember(name);
            name = formatSeparatedWords(name, '_');
            name = formatSeparatedWords(name, ' ');

            return name.substr(0, 1).toLowerCase() + name.substr(1);
        };

        function formatMember(name) {
            if(name.indexOf('.')){
                var elements = name.split('.');
                return cleanXmlaEncoding(elements[elements.length - 1]);
            }
            return name;
        }

        function isAllUpperCaseWord(name) {
            return name.match(/^[A-Z]*$/);
        }

        function formatMemberProperty(name) {
            for(var property in olap.MdxMemberProperty){
                if(name.indexOf('_x005B_' + property + '_x005D_') !== -1)
                {
                    var elements = name.split('.');
                    return cleanXmlaEncoding(elements[elements.length - 2]);
                }
            }

            return name;
        }

        function formatSeparatedWords(name, separator) {
            if (name.indexOf(separator) !== -1) {
                var words = name.split(separator);
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    words[i] = word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase()
                }
                name = words.join('');
            }
            return name;
        }

        function cleanXmlaEncoding(name){
            return name.replace('_x005B_', '').replace('_x005D_', '').replace(/_x0020_/g, ' ');
        }
    }
})(window);
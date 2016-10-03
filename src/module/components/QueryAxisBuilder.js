(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.MdxAxis = {
        COLUMNS: 0,
        ROWS: 1,
        PAGES: 2,
        SECTIONS: 3,
        CHAPTERS: 4
    };

    olap.QueryAxisBuilder = function(mdxBuilder, selections){
        var self = this;
        var $selections = selections, $index;
        var queryAxisAlias = [
            'COLUMNS',
            'ROWS',
            'PAGES',
            'SECTIONS',
            'CHAPTERS'
        ];

        validateSelections(selections);

        self.on = function(index){
            validateAxis(index);
            $index = index;
            return mdxBuilder;
        };

        self.build = function () {
            var result = '{ '
            for (var i = 0; i < $selections.length; i++) {
                result += formatSelection($selections[i], i);
            }
            return result + ' } ON ' + aliasOrIndex($index);
        };

        function validateSelections(selections) {
            if (!selections || selections.length < 1) {
                throw new Error('At least one member must be specified for the axis');
            }

            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                if (typeof selection !== 'string' || selection.indexOf('.') === -1) {
                    throw new Error('Axis members must be specified as a dotted string or an array of dotted strings');
                }
            }
        }

        function aliasOrIndex(index) {
            if (index < queryAxisAlias.length) {
                return queryAxisAlias[index];
            }

            return '' + index;
        }

        function formatSelection(selection, index) {
            var elements = selection.split('.');
            return (index > 0 ? ', ': '') + '[' + elements.join('].[') + ']';
        }
    }
})(window);
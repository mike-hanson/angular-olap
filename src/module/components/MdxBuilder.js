(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.MdxBuilder = function () {
        var self = this;
        var $queryAxisBuilders = [], $cubeName, $currentAxis = -1;

        self.on = function (index) {
            validateAxis(index);
        };

        self.select = function () {
            var result = new olap.QueryAxisBuilder(self, extractSelections(arguments));
            $queryAxisBuilders.push(result);
            return result;
        };

        self.from = function (cube) {
            if (!cube || typeof cube !== 'string') {
                throw new Error('A valid name for the cube to query is required.');
            }

            $cubeName = cube;
        };

        self.build = function () {
            var result = 'SELECT ';
            var counter = 0;
            for (var i = 0; i < queryAxis.length; i++) {
                var axis = queryAxis[i];
                if (axis) {
                    result += (counter > 1 ? ', ' : '') + '{ ';
                    for (var j = 0; j < axis.length; j++) {
                        var selection = axis[j];
                        result += formatSelection(selection, j);
                    }
                    result += ' } ON ' + aliasOrIndex(i);
                    counter++;
                }
            }
            return result;
        };

        function extractSelections(args) {
            if (args.length === 1 && args instanceof Array) {
                return args;
            }

            var selections = [];
            for (var i = 0; i < args.length; i++) {
                selections[i] = args[i];
            }
            return selections;
        }

        function validateAxis(index) {
            if (typeof index !== 'number' || index < 0 || index > 127) {
                throw new Error('An index between 0 and 127 for the axis is required, ' +
                    'consider using one of the olap.MdxAxis aliases')
            }

            if(index + 1 > $queryAxisBuilders.length)
            {
                throw new Error('Axis '  + index + ' cannot be specified because axis ' + (index - 1) + ' has not been specified. Axis must be specified in sequence.')
            }
        }
    }
})(window);
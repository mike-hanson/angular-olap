(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaInstanceSelection = {
        None: 0,
        DropDown: 1,
        List: 2,
        FilteredList: 3,
        MandatoryFilter: 4
    };
})(window);
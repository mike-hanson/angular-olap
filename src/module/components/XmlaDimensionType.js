(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaDimensionType = {
        Unknown: 0,
        Time: 1,
        Measure: 2,
        Other: 3,
        Quantitative: 5,
        Accounts: 6,
        Customers: 7,
        Products: 8,
        Scenario: 9,
        Utility: 10,
        Currency: 11,
        Rates: 12,
        Channel: 13,
        Promotion: 14,
        Organization: 15,
        BillOfMaterials: 16,
        Geography: 17
    };
})(window);
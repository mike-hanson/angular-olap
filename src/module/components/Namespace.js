(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.Namespace = {
        Analysis: 'urn:schemas-microsoft-com:xml-analysis',
        Rowset: 'urn:schemas-microsoft-com:xml-analysis:rowset',
        SoapEnvelope: 'http://schemas.xmlsoap.org/soap/envelope/',
        SoapEncoding: 'http://schemas.xmlsoap.org/soap/encoding/'
    }
})(window);
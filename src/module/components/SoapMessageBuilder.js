(function (window) {
    'use strict';
    var olap = (window.olap = window.olap || {});
    olap.SoapMessageBuilder = function(){
        var self = this;
        var msgLeader = '<?xml version="1.0"?>' +
            '<soap:Envelope xmlns:soap="http://www.w3.org/2001/12/soap-envelope" ' +
            'soap:encodingStyle="http://www.w3.org/2001/12/soap-encoding">' +
            '<soap:Header>';

        var msgJoint = '</soap:Header><soap:Body>';

        var msgTail = '</soap:Body></soap:Envelope>';
        var headers = [], bodyContent = '';

        self.addHeader = function(header){
            return self;
        };

        self.setBody = function(body){
            bodyContent = body;
            return self;
        };

        self.build = function(){
            return msgLeader + msgJoint + bodyContent + msgTail;
        };
    }
})(window);
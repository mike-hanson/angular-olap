(function (window) {
    'use strict';
    var olap = (window.olap = window.olap || {});
    olap.SoapMessageBuilder = function(){
        var self = this;
        var msgLeader = '<soap:Envelope xmlns:soap="' + olap.Namespace.SoapEnvelope + '" soap:encodingStyle="' +
            olap.Namespace.SoapEncoding + '"><soap:Header>';

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
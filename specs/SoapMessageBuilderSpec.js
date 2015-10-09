(function (window, substitute) {
    describe('SoapMessageBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var arg, builder, xmlParser;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            builder = new olap.SoapMessageBuilder();
            xmlParser = new olap.XmlParser();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to add a header', function () {
            expect(builder.addHeader).toBeDefined();
            expect(typeof builder.addHeader).toBe('function');
        });

        it('Should expect a single argument to add header', function () {
            expect(builder.addHeader.length).toBe(1);
        });

        it('Should define a method to set the body of the message', function () {
            expect(builder.setBody).toBeDefined();
            expect(typeof builder.setBody).toBe('function');
        });

        it('Should expect a single argument to set body', function () {
            expect(builder.setBody.length).toBe(1);
        });

        it('Should define a method to build the message', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should define soap envelope correctly', function () {
            var xmlDoc = xmlParser.parse(builder.build());
            var documentElement = xmlDoc.documentElement;
            expect(documentElement.localName).toBe('Envelope');
            expect(documentElement.prefix).toBe('soap');
            expect(documentElement.hasAttributeNS(olap.Namespace.SoapEnvelope, 'encodingStyle')).toBeTruthy();
            expect(documentElement.getAttributeNS(olap.Namespace.SoapEnvelope, 'encodingStyle')).toBe(olap.Namespace.SoapEncoding);
        });

        it('Should define soap header correctly', function () {
            var xmlDoc = xmlParser.parse(builder.build());
            var headerElement = xmlDoc.documentElement.firstChild;
            expect(headerElement).not.toBeNull();
            expect(headerElement.localName).toBe('Header');
            expect(headerElement.prefix).toBe('soap');
        });

        it('Should define soap body correctly', function () {
            var xmlDoc = xmlParser.parse(builder.build());
            var bodyElement = xmlDoc.documentElement.firstChild.nextSibling;
            expect(bodyElement).not.toBeNull();
            expect(bodyElement.localName).toBe('Body');
            expect(bodyElement.prefix).toBe('soap');
        });

        it('Should return builder from add header request to support chaining', function () {
            expect(builder.addHeader()).toBe(builder);
        });

        it('Should return builder from set body request to support chaining', function () {
            expect(builder.setBody()).toBe(builder);
        });

        it('Should insert content into body on request', function () {
            var xmlDoc = xmlParser.parse(builder.setBody('<InsertMe></InsertMe>').build());
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            expect(bodyContent.localName).toBe('InsertMe');
        });
    });
})(window, substitute);
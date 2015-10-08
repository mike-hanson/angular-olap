(function (window, substitute) {
    describe('XmlParser', function () {
        var olap = (window.olap = window.olap || {});
        var arg, parser;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            parser = new olap.XmlParser();
        });

        it('Should be defined', function () {
            expect(parser).toBeDefined();
        });

        it('Should define a method to parse a string to an xml dom document', function () {
            expect(parser.parse).toBeDefined();
            expect(typeof parser.parse).toBe('function');
        });

        it('Should expect a single string argument to parse', function () {
            expect(parser.parse.length).toBe(1);
        });

        it('Should parse a valid string into xml dom document', function () {
            var result = parser.parse('<?xml version="1.0"?><root><nested>content</nested></root>');
            expect(result instanceof Document).toBeTruthy();
        });

        it('Should throw an error if xml is invalid', function () {
            expect(function(){
                parser.parse('root')
            }).toThrow();
        });
    });
})(window, substitute);
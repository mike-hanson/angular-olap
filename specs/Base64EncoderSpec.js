(function (window, substitute) {
    describe('Base64Encoder', function () {
        var olap = (window.olap = window.olap || {});
        var arg, encoder;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            encoder = new olap.Base64Encoder();
        });

        it('Should be defined', function () {
            expect(encoder).toBeDefined();
        });

        it('Should define a method to encode a string', function () {
            expect(encoder.encode).toBeDefined();
            expect(typeof encoder.encode).toBe('function');
        });

        it('Should expect a single string argument to encode', function () {
            expect(encoder.encode.length).toBe(1);
        });

        it('Should correctly encode a string', function () {
            var expected = btoa('mikehanson');
            expect(encoder.encode('mikehanson')).toBe(expected);
        });

        it('Should correctly encode a string even if btoa not available', function () {
            var expected = btoa('mikehanson');
            var original = window.btoa;
            window.btoa = undefined;
            expect(encoder.encode('mikehanson')).toBe(expected);
            window.btoa = original
        });

    });
})(window, substitute);
(function (window) {
    xdescribe('QueryAxisBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var builder, mdxBuilder, selections;

        beforeEach(function () {
            mdxBuilder = {};
            selections = ['Measures.Quantity'];
            builder = new olap.QueryAxisBuilder(mdxBuilder, selections);
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to specify the axis for the selection', function () {
            expect(builder.on).toBeDefined();
            expect(typeof builder.on).toBe('function');
        });

        it('Should return olap builder passed to it from on', function () {
            expect(builder.on(1)).toBe(mdxBuilder);
        });
    });
})(window);
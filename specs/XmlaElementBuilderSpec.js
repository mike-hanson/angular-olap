(function (window, substitute) {
    describe('XmlaElementBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var arg, builder;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            builder = new olap.XmlaElementBuilder();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to create a new element', function () {
            expect(builder.createNew).toBeDefined();
            expect(typeof builder.createNew).toBe('function');
        });

        it('Should expect argument for the name of the element to create and whether to include the names space', function () {
            expect(builder.createNew.length).toBe(2);
        });

        it('Should return xml element builder from create to support chaining', function () {
            expect(builder.createNew('Restriction') instanceof olap.XmlElementBuilder).toBeTruthy();
        });
    });
})(window, substitute);
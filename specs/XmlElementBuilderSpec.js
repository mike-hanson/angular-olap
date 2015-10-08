(function (window, substitute) {
    describe('XmlElementBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var arg, builder;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            builder = new olap.XmlElementBuilder();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to build the current element', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should define a method to create a new element', function () {
            expect(builder.createNew).toBeDefined();
            expect(typeof builder.createNew).toBe('function');
        });

        it('Should expect argument for the name of the element and an optional namespace uri to use', function () {
            expect(builder.createNew.length).toBe(2);
        });

        it('Should return builder from create to support chaining', function () {
            expect(builder.createNew('Restriction')).toBe(builder);
        });

        it('Should create element correctly without a namespace', function () {
            var expected = '<Restriction xmlns="urn:schemas-microsoft-com:xml-analysis"></Restriction>';
            expect(builder.createNew('Restriction', 'urn:schemas-microsoft-com:xml-analysis').build()).toBe(expected);
        });

        it('Should create element correctly without namespace when requested', function () {
            var expected = '<Restriction></Restriction>';
            expect(builder.createNew('Restriction').build()).toBe(expected);
        });

        it('Should define a method to set the content of an element', function () {
            expect(builder.setContent).toBeDefined();
            expect(typeof builder.setContent).toBe('function');
        });

        it('Should expect a single argument for the content to set', function () {
            expect(builder.setContent.length).toBe(1);
        });

        it('Should return builder from setContent to support chaining', function () {
            expect(builder.createNew('Restriction').setContent('Content')).toBe(builder);
        });

        it('Should insert content between opening and closing elements', function () {
            var expected = '<Restriction><RestrictionList></RestrictionList></Restriction>';
            var content = '<RestrictionList></RestrictionList>';
            expect(builder.createNew('Restriction', false).setContent(content).build()).toBe(expected);
        });

        it('Should replace any existing content with set content', function () {
            var expected = '<Restriction><RestrictionList></RestrictionList></Restriction>';
            var element = builder.createNew('Restriction', false).setContent('<ReplaceMe></ReplaceMe>');
            var content = '<RestrictionList></RestrictionList>';
            expect(element.setContent(content).build()).toBe(expected);
        });

        it('Should define a method to append to the content of an element', function () {
            expect(builder.appendContent).toBeDefined();
            expect(typeof builder.appendContent).toBe('function');
        });

        it('Should expect a single arguments for the content to append', function () {
            expect(builder.appendContent.length).toBe(1);
        });

        it('Should return builder from setContent to support chaining', function () {
            expect(builder.createNew('Restriction').appendContent('Content')).toBe(builder);
        });

        it('Should append content between existing content and closing tag', function () {
            var expected = '<Restriction><DoNotReplaceMe></DoNotReplaceMe><RestrictionList></RestrictionList></Restriction>';
            var element = builder.createNew('Restriction', false).setContent('<DoNotReplaceMe></DoNotReplaceMe>');
            var content = '<RestrictionList></RestrictionList>';
            expect(element.appendContent(content).build()).toBe(expected);
        });

        it('Should clear cache of current element on build', function () {
            builder.createNew('Restriction', false).build();
            expect(builder.build()).toBe('');
        });
    });
})(window, substitute);
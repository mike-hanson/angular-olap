(function (window) {

    describe('MdxBuilder', function () {

        var olap = (window.olap = window.olap || {});
        var builder;

        beforeEach(function () {
            builder = new olap.MdxBuilder();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to initialise a new query axis', function () {
            expect(builder.on).toBeDefined();
            expect(typeof builder.on).toBe('function');
        });

        it('Should expect a single axis index as an argument to on', function () {
            expect(builder.on.length).toBe(1);
        });

        it('Should define a method to specify the source cube for the query', function () {
            expect(builder.from).toBeDefined();
            expect(typeof builder.from).toBe('function');
        });

        it('Should expect a single string argument to from', function () {
            expect(builder.from.length).toBe(1);
        });

        it('Should define a method to build the query', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should throw an error if an axis index is not specified', function () {
            expect(function () {
                builder.on()
            }).toThrowError('An index between 0 and 127 for the axis is required, consider using one of the olap.MdxAxis aliases');
        });

        it('Should throw an error if an axis index is not a number', function () {
            expect(function () {
                builder.on('1');
            }).toThrowError('An index between 0 and 127 for the axis is required, consider using one of the olap.MdxAxis aliases')
        });

        it('Should throw an error if axis index is invalid', function () {
            expect(function () {
                builder.on(-1);
            }).toThrowError('An index between 0 and 127 for the axis is required, consider using one of the olap.MdxAxis aliases')
            expect(function () {
                builder.on(128);
            }).toThrowError('An index between 0 and 127 for the axis is required, consider using one of the olap.MdxAxis aliases')
        });

        it('Should throw an error if an axis is specified out of sequence', function () {
            expect(function(){
                builder.on(1);
            }).toThrowError('Axis 1 cannot be specified because axis 0 has not been specified. Axis must be specified in sequence.')
        });

        it('Should return query axis builder on select', function () {
            var result = builder.select('Measures.Quantity');
            expect(result instanceof olap.QueryAxisBuilder).toBeTruthy();
        });

        it('Should throw an error if cube name is not provided to from', function () {
            expect(function(){
                builder.from();
            }).toThrowError('A valid name for the cube to query is required.')
        });

        it('Should throw error if the cube name is not a string', function () {
            expect(function(){
                builder.from(1);
            }).toThrowError('A valid name for the cube to query is required.')
        });
    });
})(window);

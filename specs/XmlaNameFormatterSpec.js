(function (window, substitute) {
    describe('XmlaNameFormatter', function () {
        var olap = (window.olap = window.olap || {});
        var arg, formatter;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            formatter = new olap.XmlaNameFormatter();
        });

        it('Should be defined', function () {
            expect(formatter).toBeDefined();
        });

        it('Should define a method to to format a name', function () {
            expect(formatter.format).toBeDefined();
            expect(typeof formatter.format).toBe('function');
        });

        it('Should expect a single string argument to format', function () {
            expect(formatter.format.length).toBe(1);
        });

        it('Should throw an error if name to format is not provided', function () {
            expect(function(){
                formatter.format();
            }).toThrowError('A valid name to format is required.');
        });

        it('Should throw an error if name to format is not a string', function () {
            expect(function(){
                formatter.format(1);
            }).toThrowError('A valid name to format is required.');
        });

        it('Should convert simple all upper case name to lower case', function () {
            expect(formatter.format('URL')).toBe('url');
        });

        it('Should convert a simple name with underscores to camel case', function () {
            expect(formatter.format('database_name')).toBe('databaseName');
        });

        it('Should convert all upper case name with underscores to camel case', function () {
            expect(formatter.format('DATABASE_NAME')).toBe('databaseName');
        });

        it('Should convert a simple name with spaces to camel case', function () {
            expect(formatter.format('database name')).toBe('databaseName');
        });

        it('Should convert an mdx member property using penultimate element ', function () {
            expect(formatter.format('_x005B_Account_x005D_._x005B_Account_x005D_._x005B_Account_x005D_._x005B_MEMBER_CAPTION_x005D_')).toBe('account');
        });

        it('Should convert an mdx member name using last element', function () {
            expect(formatter.format('_x005B_Measures_x005D_._x005B_Consumption_x005D_')).toBe('consumption');
        });

        it('Should convert an mdx member name with spaces using last element', function () {
            expect(formatter.format('_x005B_Measures_x005D_._x005B_Average_x0020_Consumption_x005D_')).toBe('averageConsumption');
        });

        it('Should convert an mdx member name with multiple words separated by spaces using last element', function () {
            expect(formatter.format('_x005B_Measures_x005D_._x005B_Avg_x0020_Over_x0020_Time_x005D_')).toBe('avgOverTime');
        });
    });
})(window, substitute);
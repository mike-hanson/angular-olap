(function (window, substitute) {
    describe('XmlaRowsetTransformer', function () {
        var olap = (window.olap = window.olap || {});
        var arg, transformer;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            transformer = new olap.XmlaRowsetTransformer();
        });

        it('Should be defined', function () {
            expect(transformer).toBeDefined();
        });

        it('Should define a method to transform an xmla rowset message to an array of javascript objects', function () {
            expect(transformer.transform).toBeDefined();
            expect(typeof transformer.transform).toBe('function');
        });

        it('Should expect a single string argument for the message to transform', function () {
            expect(transformer.transform.length).toBe(1);
        });

        it('Should return an array from request to transform the message', function () {
            var result = assumeTransformIsRequested();
            expect(result instanceof Array).toBeTruthy();
        });

        it('Should transform two rows', function () {
            var result = assumeTransformIsRequested();
            expect(result.length).toBe(2);
        });

        it('Should transform all upper case names to all lower case', function () {
            var row = assumeTransformIsRequested()[0];
            expect(row.url).toBeDefined();
            expect(row.URL).not.toBeDefined();
        });

        it('Should transform mixed case names to camel case', function () {
            var row = assumeTransformIsRequested()[0];
            expect(row.dataSourceName).toBeDefined();
            expect(row.DataSourceName).not.toBeDefined();
        });

        it('Should transform multiple elements of the same name to an array', function () {
            var row = assumeTransformIsRequested()[0];
            expect(row.providerType).toBeDefined();
            expect(row.providerType instanceof Array).toBeTruthy();
            expect(row.providerType.length).toBe(3);
        });

        it('Should transform first row correctly', function () {
            var row = assumeTransformIsRequested()[0];
            expect(row.dataSourceName).toBe('WORKSTATION');
            expect(row.dataSourceDescription).toBe('');
            expect(row.url).toBe('');
            expect(row.dataSourceInfo).toBe('');
            expect(row.providerName).toBe('Microsoft Analysis Services');
            expect(row.providerType[0]).toBe('MDP');
            expect(row.providerType[1]).toBe('TDP');
            expect(row.providerType[2]).toBe('DMP');
            expect(row.authenticationMode).toBe('Authenticated');
        });

        it('Should transform second row correctly', function () {
            var row = assumeTransformIsRequested()[1];
            expect(row.dataSourceName).toBe('SESQL');
            expect(row.dataSourceDescription).toBe('The description');
            expect(row.url).toBe('http://sesql.cloudapp.net:5061/xmla/msmdpump.dll');
            expect(row.dataSourceInfo).toBe('Provider=MSOLAP;Data Source=local;');
            expect(row.providerName).toBe('Microsoft Analysis Services');
            expect(row.providerType[0]).toBe('MDP');
            expect(row.providerType[1]).toBe('TDP');
            expect(row.providerType[2]).toBe('DMP');
            expect(row.authenticationMode).toBe('Authenticated');
        });

        function assumeTransformIsRequested()
        {
            var message = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                '<soap:Body><DiscoverResponse xmlns="urn:schemas-microsoft-com:xml-analysis">' +
                '<return><root xmlns="urn:schemas-microsoft-com:xml-analysis:rowset"' +
                ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                ' xmlns:msxmla="http://schemas.microsoft.com/analysisservices/2003/xmla">' +
                '<row>' +
                '<DataSourceName>WORKSTATION</DataSourceName>' +
                '<DataSourceDescription/>' +
                '<URL/>' +
                '<DataSourceInfo/>' +
                '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                '<ProviderType>MDP</ProviderType>' +
                '<ProviderType>TDP</ProviderType>' +
                '<ProviderType>DMP</ProviderType>' +
                '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                '</row>' +
                '<row>' +
                '<DataSourceName>SESQL</DataSourceName>' +
                '<DataSourceDescription>The description</DataSourceDescription>' +
                '<URL>http://sesql.cloudapp.net:5061/xmla/msmdpump.dll</URL>' +
                '<DataSourceInfo>Provider=MSOLAP;Data Source=local;</DataSourceInfo>' +
                '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                '<ProviderType>MDP</ProviderType>' +
                '<ProviderType>TDP</ProviderType>' +
                '<ProviderType>DMP</ProviderType>' +
                '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                '</row>' +
                '</root></return></DiscoverResponse></soap:Body></soap:Envelope>';

            return transformer.transform(message);
        }
    });
})(window, substitute);
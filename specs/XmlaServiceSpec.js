(function (window, substitute, specAssistant) {
    describe('XmlaService', function () {
        var olap = (window.olap = window.olap || {});
        var testUrl            = 'http://somedomain.com',
            testUsername       = 'mikeh',
            testPassword       = 'p@ssword',
            testDataSourceName = 'My Data Source',
            testCatalogName    = 'My Catalog';
        var xmlParser = new olap.XmlParser();
        var arg, service, $http, postPromise, config, deferred, $q, $timeout;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            $http = substitute.for(['post']);
            postPromise = $http.returnsPromise('post');
            deferred = specAssistant.createDeferredSub();
            $q = specAssistant.createQSub(deferred)
            $timeout = substitute.forFunction(function(){});
            config = {
                url:            testUrl,
                username:       testUsername,
                password:       testPassword,
                dataSourceName: testDataSourceName,
                catalogName:    testCatalogName
            };
            service = new olap.XmlaService($http, $q, $timeout, config);
        });

        it('Should be defined', function () {
            expect(service).toBeDefined();
        });

        it('Should define a method to read any url configured through provider', function () {
            expect(service.url).toBeDefined();
            expect(typeof service.url).toBe('function');
        });

        it('Should return url set through provider', function () {
            expect(service.url()).toBe(testUrl);
        });

        it('Should define a method to read any username configured through provider', function () {
            expect(service.username).toBeDefined();
            expect(typeof service.username).toBe('function');
        });

        it('Should return username set through provider', function () {
            expect(service.username()).toBe(testUsername);
        });

        it('Should define a method to read any password configured through provider', function () {
            expect(service.password).toBeDefined();
            expect(typeof service.password).toBe('function');
        });

        it('Should return password set through provider', function () {
            expect(service.password()).toBe(testPassword);
        });

        it('Should define a method to read any dataSourceName configured through provider', function () {
            expect(service.dataSourceName).toBeDefined();
            expect(typeof service.dataSourceName).toBe('function');
        });

        it('Should return dataSourceName set through provider', function () {
            expect(service.dataSourceName()).toBe(testDataSourceName);
        });

        it('Should define a method to read any catalogName configured through provider', function () {
            expect(service.catalogName).toBeDefined();
            expect(typeof service.catalogName).toBe('function');
        });

        it('Should return catalogName set through provider', function () {
            expect(service.catalogName()).toBe(testCatalogName);
        });

        describe('discoverDataSources()', function () {
            it('Should define a method to discover data sources from the server', function () {
                expect(service.discoverDataSources).toBeDefined();
                expect(typeof service.discoverDataSources).toBe('function');
            });

            it('Should expect a single optional config object on discover data sources request', function () {
                expect(service.discoverDataSources.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover data sources request', function () {
                expect(function () {
                    service.discoverDataSources({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover data sources request', function () {
                service.discoverDataSources();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover data sources request', function () {
                expect(service.discoverDataSources().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverDataSources();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover data sources request', function () {
                assumeDiscoverDataSourcesRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverDataSourcesMessage), arg.matchUsing(hasValidDiscoverHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverDataSourcesRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverDataSourcesRequested();
                assumeSuccessfulResponseFromDiscoverDataSourcesRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverDataSourcesRequested();
                var response = {status: 401, data:{field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverDataSourcesRequested() {
                service.discoverDataSources();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverDataSourcesRequest(){
                var message = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body><DiscoverResponse xmlns="urn:schemas-microsoft-com:xml-analysis"' +
                    ' xmlns:ddl2="http://schemas.microsoft.com/analysisservices/2003/engine/2"' +
                    ' xmlns:ddl2_2="http://schemas.microsoft.com/analysisservices/2003/engine/2/2"' +
                    ' xmlns:ddl100="http://schemas.microsoft.com/analysisservices/2008/engine/100"' +
                    ' xmlns:ddl100_100="http://schemas.microsoft.com/analysisservices/2008/engine/100/100"' +
                    ' xmlns:ddl200="http://schemas.microsoft.com/analysisservices/2010/engine/200"' +
                    ' xmlns:ddl200_200="http://schemas.microsoft.com/analysisservices/2010/engine/200/200"' +
                    ' xmlns:ddl300="http://schemas.microsoft.com/analysisservices/2011/engine/300"' +
                    ' xmlns:ddl300_300="http://schemas.microsoft.com/analysisservices/2011/engine/300/300"' +
                    ' xmlns:ddl400="http://schemas.microsoft.com/analysisservices/2012/engine/400"' +
                    ' xmlns:ddl400_400="http://schemas.microsoft.com/analysisservices/2012/engine/400/400"' +
                    ' xmlns:ddl410="http://schemas.microsoft.com/analysisservices/2012/engine/410"' +
                    ' xmlns:ddl410_410="http://schemas.microsoft.com/analysisservices/2012/engine/410/410">' +
                    '<return><root xmlns="urn:schemas-microsoft-com:xml-analysis:rowset"' +
                    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                    ' xmlns:msxmla="http://schemas.microsoft.com/analysisservices/2003/xmla">' +
                    '<xsd:schema targetNamespace="urn:schemas-microsoft-com:xml-analysis:rowset" ' +
                    'xmlns:sql="urn:schemas-microsoft-com:xml-sql" elementFormDefault="qualified">' +
                    '<xsd:element name="root"><xsd:complexType><xsd:sequence minOccurs="0" maxOccurs="unbounded">' +
                    '<xsd:element name="row" type="row"/></xsd:sequence></xsd:complexType></xsd:element><xsd:simpleType' +
                    ' name="uuid"><xsd:restriction base="xsd:string"><xsd:pattern' +
                    ' value="[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}"/>' +
                    '</xsd:restriction></xsd:simpleType><xsd:complexType name="xmlDocument"><xsd:sequence>' +
                    '<xsd:any/></xsd:sequence></xsd:complexType><xsd:complexType name="row"><xsd:sequence>' +
                    '<xsd:element sql:field="DataSourceName" name="DataSourceName" type="xsd:string"/>' +
                    '<xsd:element sql:field="DataSourceDescription" name="DataSourceDescription" type="xsd:string"' +
                    ' minOccurs="0"/><xsd:element sql:field="URL" name="URL" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="DataSourceInfo" name="DataSourceInfo" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="ProviderName" name="ProviderName" type="xsd:string"/><xsd:element' +
                    ' sql:field="ProviderType" name="ProviderType" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>' +
                    '<xsd:element sql:field="AuthenticationMode" name="AuthenticationMode" type="xsd:string"' +
                    ' minOccurs="0"/></xsd:sequence></xsd:complexType></xsd:schema>' +
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverDataSourcesMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.DISCOVER_DATASOURCES;
            }
        });

        describe('discoverCatalogs()', function () {
            it('Should define a method to discover catalogs from the server', function () {
                expect(service.discoverCatalogs).toBeDefined();
                expect(typeof service.discoverCatalogs).toBe('function');
            });

            it('Should expect a single optional config object on discover catalogs request', function () {
                expect(service.discoverCatalogs.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover catalogs request', function () {
                expect(function () {
                    service.discoverCatalogs({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover catalogs request', function () {
                service.discoverCatalogs();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover catalogs request', function () {
                expect(service.discoverCatalogs().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverCatalogs();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover catalogs request', function () {
                assumeDiscoverCatalogsRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverCatalogsMessage), arg.matchUsing(hasValidDiscoverHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverCatalogsRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverCatalogsRequested();
                assumeSuccessfulResponseFromDiscoverCatalogsRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverCatalogsRequested();
                var response = {status: 401, data:{field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverCatalogsRequested() {
                service.discoverCatalogs();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverCatalogsRequest(){
                var message = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body><DiscoverResponse xmlns="urn:schemas-microsoft-com:xml-analysis"' +
                    ' xmlns:ddl2="http://schemas.microsoft.com/analysisservices/2003/engine/2"' +
                    ' xmlns:ddl2_2="http://schemas.microsoft.com/analysisservices/2003/engine/2/2"' +
                    ' xmlns:ddl100="http://schemas.microsoft.com/analysisservices/2008/engine/100"' +
                    ' xmlns:ddl100_100="http://schemas.microsoft.com/analysisservices/2008/engine/100/100"' +
                    ' xmlns:ddl200="http://schemas.microsoft.com/analysisservices/2010/engine/200"' +
                    ' xmlns:ddl200_200="http://schemas.microsoft.com/analysisservices/2010/engine/200/200"' +
                    ' xmlns:ddl300="http://schemas.microsoft.com/analysisservices/2011/engine/300"' +
                    ' xmlns:ddl300_300="http://schemas.microsoft.com/analysisservices/2011/engine/300/300"' +
                    ' xmlns:ddl400="http://schemas.microsoft.com/analysisservices/2012/engine/400"' +
                    ' xmlns:ddl400_400="http://schemas.microsoft.com/analysisservices/2012/engine/400/400"' +
                    ' xmlns:ddl410="http://schemas.microsoft.com/analysisservices/2012/engine/410"' +
                    ' xmlns:ddl410_410="http://schemas.microsoft.com/analysisservices/2012/engine/410/410">' +
                    '<return><root xmlns="urn:schemas-microsoft-com:xml-analysis:rowset"' +
                    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                    ' xmlns:msxmla="http://schemas.microsoft.com/analysisservices/2003/xmla">' +
                    '<xsd:schema targetNamespace="urn:schemas-microsoft-com:xml-analysis:rowset" ' +
                    'xmlns:sql="urn:schemas-microsoft-com:xml-sql" elementFormDefault="qualified">' +
                    '<xsd:element name="root"><xsd:complexType><xsd:sequence minOccurs="0" maxOccurs="unbounded">' +
                    '<xsd:element name="row" type="row"/></xsd:sequence></xsd:complexType></xsd:element><xsd:simpleType' +
                    ' name="uuid"><xsd:restriction base="xsd:string"><xsd:pattern' +
                    ' value="[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}"/>' +
                    '</xsd:restriction></xsd:simpleType><xsd:complexType name="xmlDocument"><xsd:sequence>' +
                    '<xsd:any/></xsd:sequence></xsd:complexType><xsd:complexType name="row"><xsd:sequence>' +
                    '<xsd:element sql:field="CatalogName" name="CatalogName" type="xsd:string"/>' +
                    '<xsd:element sql:field="CatalogDescription" name="CatalogDescription" type="xsd:string"' +
                    ' minOccurs="0"/><xsd:element sql:field="URL" name="URL" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="CatalogInfo" name="CatalogInfo" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="ProviderName" name="ProviderName" type="xsd:string"/><xsd:element' +
                    ' sql:field="ProviderType" name="ProviderType" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>' +
                    '<xsd:element sql:field="AuthenticationMode" name="AuthenticationMode" type="xsd:string"' +
                    ' minOccurs="0"/></xsd:sequence></xsd:complexType></xsd:schema>' +
                    '<row>' +
                    '<CatalogName>WORKSTATION</CatalogName>' +
                    '<CatalogDescription/>' +
                    '<URL/>' +
                    '<CatalogInfo/>' +
                    '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                    '<ProviderType>MDP</ProviderType>' +
                    '<ProviderType>TDP</ProviderType>' +
                    '<ProviderType>DMP</ProviderType>' +
                    '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                    '</row>' +
                    '<row>' +
                    '<CatalogName>SESQL</CatalogName>' +
                    '<CatalogDescription>The description</CatalogDescription>' +
                    '<URL>http://sesql.cloudapp.net:5061/xmla/msmdpump.dll</URL>' +
                    '<CatalogInfo>Provider=MSOLAP;Data Source=local;</CatalogInfo>' +
                    '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                    '<ProviderType>MDP</ProviderType>' +
                    '<ProviderType>TDP</ProviderType>' +
                    '<ProviderType>DMP</ProviderType>' +
                    '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                    '</row>' +
                    '</root></return></DiscoverResponse></soap:Body></soap:Envelope>';
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverCatalogsMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.DBSCHEMA_CATALOGS;
            }
        });

        describe('discoverCubes()', function () {
            it('Should define a method to discover cubes from the server', function () {
                expect(service.discoverCubes).toBeDefined();
                expect(typeof service.discoverCubes).toBe('function');
            });

            it('Should expect a single optional config object on discover cubes request', function () {
                expect(service.discoverCubes.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover cubes request', function () {
                expect(function () {
                    service.discoverCubes({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover cubes request', function () {
                service.discoverCubes();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover cubes request', function () {
                expect(service.discoverCubes().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverCubes();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover cubes request', function () {
                assumeDiscoverCubesRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverCubesMessage), arg.matchUsing(hasValidDiscoverHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverCubesRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverCubesRequested();
                assumeSuccessfulResponseFromDiscoverCubesRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverCubesRequested();
                var response = {status: 401, data:{field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverCubesRequested() {
                service.discoverCubes();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverCubesRequest(){
                var message = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body><DiscoverResponse xmlns="urn:schemas-microsoft-com:xml-analysis"' +
                    ' xmlns:ddl2="http://schemas.microsoft.com/analysisservices/2003/engine/2"' +
                    ' xmlns:ddl2_2="http://schemas.microsoft.com/analysisservices/2003/engine/2/2"' +
                    ' xmlns:ddl100="http://schemas.microsoft.com/analysisservices/2008/engine/100"' +
                    ' xmlns:ddl100_100="http://schemas.microsoft.com/analysisservices/2008/engine/100/100"' +
                    ' xmlns:ddl200="http://schemas.microsoft.com/analysisservices/2010/engine/200"' +
                    ' xmlns:ddl200_200="http://schemas.microsoft.com/analysisservices/2010/engine/200/200"' +
                    ' xmlns:ddl300="http://schemas.microsoft.com/analysisservices/2011/engine/300"' +
                    ' xmlns:ddl300_300="http://schemas.microsoft.com/analysisservices/2011/engine/300/300"' +
                    ' xmlns:ddl400="http://schemas.microsoft.com/analysisservices/2012/engine/400"' +
                    ' xmlns:ddl400_400="http://schemas.microsoft.com/analysisservices/2012/engine/400/400"' +
                    ' xmlns:ddl410="http://schemas.microsoft.com/analysisservices/2012/engine/410"' +
                    ' xmlns:ddl410_410="http://schemas.microsoft.com/analysisservices/2012/engine/410/410">' +
                    '<return><root xmlns="urn:schemas-microsoft-com:xml-analysis:rowset"' +
                    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                    ' xmlns:msxmla="http://schemas.microsoft.com/analysisservices/2003/xmla">' +
                    '<xsd:schema targetNamespace="urn:schemas-microsoft-com:xml-analysis:rowset" ' +
                    'xmlns:sql="urn:schemas-microsoft-com:xml-sql" elementFormDefault="qualified">' +
                    '<xsd:element name="root"><xsd:complexType><xsd:sequence minOccurs="0" maxOccurs="unbounded">' +
                    '<xsd:element name="row" type="row"/></xsd:sequence></xsd:complexType></xsd:element><xsd:simpleType' +
                    ' name="uuid"><xsd:restriction base="xsd:string"><xsd:pattern' +
                    ' value="[0-9a-zA-Z]{8}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{4}-[0-9a-zA-Z]{12}"/>' +
                    '</xsd:restriction></xsd:simpleType><xsd:complexType name="xmlDocument"><xsd:sequence>' +
                    '<xsd:any/></xsd:sequence></xsd:complexType><xsd:complexType name="row"><xsd:sequence>' +
                    '<xsd:element sql:field="CubeName" name="CubeName" type="xsd:string"/>' +
                    '<xsd:element sql:field="CubeDescription" name="CubeDescription" type="xsd:string"' +
                    ' minOccurs="0"/><xsd:element sql:field="URL" name="URL" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="CubeInfo" name="CubeInfo" type="xsd:string" minOccurs="0"/>' +
                    '<xsd:element sql:field="ProviderName" name="ProviderName" type="xsd:string"/><xsd:element' +
                    ' sql:field="ProviderType" name="ProviderType" type="xsd:string" minOccurs="0" maxOccurs="unbounded"/>' +
                    '<xsd:element sql:field="AuthenticationMode" name="AuthenticationMode" type="xsd:string"' +
                    ' minOccurs="0"/></xsd:sequence></xsd:complexType></xsd:schema>' +
                    '<row>' +
                    '<CubeName>WORKSTATION</CubeName>' +
                    '<CubeDescription/>' +
                    '<URL/>' +
                    '<CubeInfo/>' +
                    '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                    '<ProviderType>MDP</ProviderType>' +
                    '<ProviderType>TDP</ProviderType>' +
                    '<ProviderType>DMP</ProviderType>' +
                    '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                    '</row>' +
                    '<row>' +
                    '<CubeName>SESQL</CubeName>' +
                    '<CubeDescription>The description</CubeDescription>' +
                    '<URL>http://sesql.cloudapp.net:5061/xmla/msmdpump.dll</URL>' +
                    '<CubeInfo>Provider=MSOLAP;Data Source=local;</CubeInfo>' +
                    '<ProviderName>Microsoft Analysis Services</ProviderName>' +
                    '<ProviderType>MDP</ProviderType>' +
                    '<ProviderType>TDP</ProviderType>' +
                    '<ProviderType>DMP</ProviderType>' +
                    '<AuthenticationMode>Authenticated</AuthenticationMode>' +
                    '</row>' +
                    '</root></return></DiscoverResponse></soap:Body></soap:Envelope>';
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverCubesMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_CUBES;
            }
        });

        function hasValidDiscoverHeaders(arg) {
            return arg !== undefined
                && arg.headers
                && arg.headers['Content-Type'] === 'text/xml'
                && arg.headers.SOAPAction === 'urn:schemas-microsoft-com:xml-analysis:Discover'
                && arg.headers.Authorization === 'Basic ' + btoa(config.username + ':' + config.password);
        }
    });
})(window, substitute, specAssistant);
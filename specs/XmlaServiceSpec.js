(function (window, substitute, specAssistant) {
    describe('XmlaService', function () {
        var olap = (window.olap = window.olap || {});
        var testUrl = 'http://somedomain.com',
            testUsername = 'mikeh',
            testPassword = 'p@ssword',
            testDataSourceName = 'My Data Source',
            testCatalogName = 'My Catalog';
        var xmlParser = new olap.XmlParser();
        var arg, service, $http, postPromise, config, deferred, $q, $timeout;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            $http = substitute.for(['post']);
            postPromise = $http.returnsPromise('post');
            deferred = specAssistant.createDeferredSub();
            $q = specAssistant.createQSub(deferred);
            $timeout = substitute.forFunction(function () {
            });
            config = {
                url: testUrl,
                username: testUsername,
                password: testPassword,
                dataSourceName: testDataSourceName,
                catalogName: testCatalogName
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

        it('Should support setting url directly', function () {
            service.url('something else');
            expect(service.url.length).toBe(1);
            expect(service.url()).toBe('something else');
        });

        it('Should define a method to read any username configured through provider', function () {
            expect(service.username).toBeDefined();
            expect(typeof service.username).toBe('function');
        });

        it('Should return username set through provider', function () {
            expect(service.username()).toBe(testUsername);
        });

        it('Should support setting username directly', function () {
            service.username('something else');
            expect(service.username.length).toBe(1);
            expect(service.username()).toBe('something else');
        });

        it('Should define a method to read any password configured through provider', function () {
            expect(service.password).toBeDefined();
            expect(typeof service.password).toBe('function');
        });

        it('Should return password set through provider', function () {
            expect(service.password()).toBe(testPassword);
        });

        it('Should support setting password directly', function () {
            service.password('something else');
            expect(service.password.length).toBe(1);
            expect(service.password()).toBe('something else');
        });

        it('Should define a method to read any dataSourceName configured through provider', function () {
            expect(service.dataSourceName).toBeDefined();
            expect(typeof service.dataSourceName).toBe('function');
        });

        it('Should return dataSourceName set through provider', function () {
            expect(service.dataSourceName()).toBe(testDataSourceName);
        });

        it('Should support setting dataSourceName directly', function () {
            service.dataSourceName('something else');
            expect(service.dataSourceName.length).toBe(1);
            expect(service.dataSourceName()).toBe('something else');
        });

        it('Should define a method to read any catalogName configured through provider', function () {
            expect(service.catalogName).toBeDefined();
            expect(typeof service.catalogName).toBe('function');
        });

        it('Should return catalogName set through provider', function () {
            expect(service.catalogName()).toBe(testCatalogName);
        });

        it('Should support setting catalogName directly', function () {
            service.catalogName('something else');
            expect(service.catalogName.length).toBe(1);
            expect(service.catalogName()).toBe('something else');
        });

        describe('SOAP Fault Handling', function () {

            it('Should reject promise if response contains soap fault', function () {
                assumeResponseContainsSoapFault();
                expect(deferred.receivedWith('reject', arg.any('object')));
            });

            it('Should convert soap fault into a representative object', function () {
                assumeResponseContainsSoapFault();
                expect(deferred.receivedWith('reject', arg.matchUsing(function (arg) {
                    return arg !== undefined
                        && arg.faultCode === 'XMLAnalysisError.0xc10f0014'
                        && arg.faultString === 'An error occurred while parsing the RequestType element at line 1,' +
                        ' column 278 ("urn:schemas-microsoft-com:xml-analysis" namespace)' +
                        ' under Envelope/Body/Discover/RequestType.'
                })));
            });

            it('Should add detail elements from soap fault to array on object', function () {
                assumeResponseContainsSoapFault();
                expect(deferred.receivedWith('reject', arg.matchUsing(function (arg) {
                    return arg !== undefined
                        && arg.detail !== undefined
                        && (arg.detail instanceof Array)
                        && arg.detail.length === 2
                        && arg.detail[0].errorCode === '3238789153'
                        && arg.detail[0].description === 'XML for Analysis parser: The MDMSCHEMA_MEASUREGROUPS request type was not recognized by the server.'
                        && arg.detail[0].source === 'Microsoft SQL Server 2014 Analysis Services'
                        && arg.detail[0].helpFile === ''
                        && arg.detail[1].errorCode === '3238985748'
                        && arg.detail[1].description === 'An error occurred while parsing the' +
                        ' RequestType element at line 1, column 278 (\'urn:schemas-microsoft-com:xml-analysis\' namespace)' +
                        ' under Envelope/Body/Discover/RequestType.'
                        && arg.detail[1].source === 'Microsoft SQL Server 2014 Analysis Services'
                        && arg.detail[1].helpFile === ''
                })));
            });

            function assumeResponseContainsSoapFault() {
                var soapFault = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                    '<soap:Fault xmlns="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<faultcode>XMLAnalysisError.0xc10f0014</faultcode>' +
                    '<faultstring>An error occurred while parsing the RequestType element at line 1, column 278' +
                    ' ("urn:schemas-microsoft-com:xml-analysis" namespace) under Envelope/Body/Discover/RequestType.' +
                    '</faultstring>' +
                    '<detail>' +
                    '<Error ErrorCode="3238789153" Description="XML for Analysis parser: The MDMSCHEMA_MEASUREGROUPS ' +
                    'request type was not recognized by the server." Source="Microsoft SQL Server 2014 Analysis Services" ' +
                    'HelpFile=""/><Error ErrorCode="3238985748" Description="An error occurred while parsing the' +
                    ' RequestType element at line 1, column 278 (\'urn:schemas-microsoft-com:xml-analysis\' namespace)' +
                    ' under Envelope/Body/Discover/RequestType." Source="Microsoft SQL Server 2014 Analysis Services"' +
                    ' HelpFile=""/>' +
                    '</detail>' +
                    '</soap:Fault>' +
                    '</soap:Body>' +
                    '</soap:Envelope>';
                var response = {status: 200, statusText: 'OK', data: soapFault};
                service.executeStatement({
                    mdx: 'something',
                    url: config.url,
                    catalogName: config.catalogName
                });
                $timeout.invokeArgOfLastCallWith(0);
                postPromise.success(response);
            }
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
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverDataSourcesMessage), arg.matchUsing(hasValidXmlaHeaders)));
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
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverDataSourcesRequested() {
                service.discoverDataSources();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverDataSourcesRequest() {
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
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverCatalogsMessage), arg.matchUsing(hasValidXmlaHeaders)));
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
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverCatalogsRequested() {
                service.discoverCatalogs();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverCatalogsRequest() {
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
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverCubesMessage), arg.matchUsing(hasValidXmlaHeaders)));
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
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverCubesRequested() {
                service.discoverCubes();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverCubesRequest() {
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

        describe('discoverMeasureGroups()', function () {
            it('Should define a method to discover measure groups from the server', function () {
                expect(service.discoverMeasureGroups).toBeDefined();
                expect(typeof service.discoverMeasureGroups).toBe('function');
            });

            it('Should expect a single optional config object on discover measure groups request', function () {
                expect(service.discoverMeasureGroups.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover measure groups request', function () {
                expect(function () {
                    service.discoverMeasureGroups({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover measure groups request', function () {
                service.discoverMeasureGroups();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover measure groups request', function () {
                expect(service.discoverMeasureGroups().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverMeasureGroups();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover measure groups request', function () {
                assumeDiscoverMeasureGroupsRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverMeasureGroupsMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverMeasureGroupsRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverMeasureGroupsRequested();
                assumeSuccessfulResponseFromDiscoverMeasureGroupsRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverMeasureGroupsRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverMeasureGroupsRequested() {
                service.discoverMeasureGroups();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverMeasureGroupsRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverMeasureGroupsMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_MEASUREGROUPS;
            }
        });

        describe('discoverMeasures()', function () {
            it('Should define a method to discover measures from the server', function () {
                expect(service.discoverMeasures).toBeDefined();
                expect(typeof service.discoverMeasures).toBe('function');
            });

            it('Should expect a single optional config object on discover measures request', function () {
                expect(service.discoverMeasures.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover measures request', function () {
                expect(function () {
                    service.discoverMeasures({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover measures request', function () {
                service.discoverMeasures();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover measures request', function () {
                expect(service.discoverMeasures().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverMeasures();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover measures request', function () {
                assumeDiscoverMeasuresRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverMeasuresMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverMeasuresRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverMeasuresRequested();
                assumeSuccessfulResponseFromDiscoverMeasuresRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverMeasuresRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverMeasuresRequested() {
                service.discoverMeasures();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverMeasuresRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverMeasuresMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_MEASURES;
            }
        });
        
        describe('discoverDimensions()', function () {
            it('Should define a method to discover dimensions from the server', function () {
                expect(service.discoverDimensions).toBeDefined();
                expect(typeof service.discoverDimensions).toBe('function');
            });

            it('Should expect a single optional config object on discover dimensions request', function () {
                expect(service.discoverDimensions.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover dimensions request', function () {
                expect(function () {
                    service.discoverDimensions({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover dimensions request', function () {
                service.discoverDimensions();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover dimensions request', function () {
                expect(service.discoverDimensions().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverDimensions();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover dimensions request', function () {
                assumeDiscoverDimensionsRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverDimensionsMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverDimensionsRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverDimensionsRequested();
                assumeSuccessfulResponseFromDiscoverDimensionsRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverDimensionsRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverDimensionsRequested() {
                service.discoverDimensions();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverDimensionsRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverDimensionsMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_DIMENSIONS;
            }
        });

        describe('discoverDimensionMembers()', function () {
            it('Should define a method to discover dimension members from the server', function () {
                expect(service.discoverDimensionMembers).toBeDefined();
                expect(typeof service.discoverDimensionMembers).toBe('function');
            });

            it('Should expect a single optional config object on discover dimension members request', function () {
                expect(service.discoverDimensionMembers.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover dimension members request', function () {
                expect(function () {
                    service.discoverDimensionMembers({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover dimension members request', function () {
                service.discoverDimensionMembers();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover dimension members request', function () {
                expect(service.discoverDimensionMembers().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverDimensionMembers();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover dimension members request', function () {
                assumeDiscoverDimensionMembersRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverDimensionMembersMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverDimensionMembersRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverDimensionMembersRequested();
                assumeSuccessfulResponseFromDiscoverDimensionMembersRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverDimensionMembersRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverDimensionMembersRequested() {
                service.discoverDimensionMembers();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverDimensionMembersRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverDimensionMembersMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_MEMBERS;
            }
        });

        describe('discoverHierarchies()', function () {
            it('Should define a method to discover hierarchy members from the server', function () {
                expect(service.discoverHierarchies).toBeDefined();
                expect(typeof service.discoverHierarchies).toBe('function');
            });

            it('Should expect a single optional config object on discover hierarchy members request', function () {
                expect(service.discoverHierarchies.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover hierarchy members request', function () {
                expect(function () {
                    service.discoverHierarchies({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover hierarchy members request', function () {
                service.discoverHierarchies();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover hierarchy members request', function () {
                expect(service.discoverHierarchies().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverHierarchies();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover hierarchy members request', function () {
                assumeDiscoverHierarchiesRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverHierarchiesMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverHierarchiesRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverHierarchiesRequested();
                assumeSuccessfulResponseFromDiscoverHierarchiesRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverHierarchiesRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverHierarchiesRequested() {
                service.discoverHierarchies();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverHierarchiesRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverHierarchiesMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_HIERARCHIES;
            }
        });

        describe('discoverHierarchyMembers()', function () {
            it('Should define a method to discover hierarchy members from the server', function () {
                expect(service.discoverHierarchyMembers).toBeDefined();
                expect(typeof service.discoverHierarchyMembers).toBe('function');
            });

            it('Should expect a single optional config object on discover hierarchy members request', function () {
                expect(service.discoverHierarchyMembers.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on discover hierarchy members request', function () {
                expect(function () {
                    service.discoverHierarchyMembers({url: ''});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should use $q to prepare a promise on discover hierarchy members request', function () {
                service.discoverHierarchyMembers();
                expect($q.received('defer'));
            });

            it('Should return a promise on discover hierarchy members request', function () {
                expect(service.discoverHierarchyMembers().then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                service.discoverHierarchyMembers();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the discover hierarchy members request', function () {
                assumeDiscoverHierarchyMembersRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverHierarchyMembersMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeDiscoverHierarchyMembersRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeDiscoverHierarchyMembersRequested();
                assumeSuccessfulResponseFromDiscoverHierarchyMembersRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeDiscoverHierarchyMembersRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeDiscoverHierarchyMembersRequested() {
                service.discoverHierarchyMembers();
                $timeout.invokeArgOfLastCallWith(0)
            }

            function assumeSuccessfulResponseFromDiscoverHierarchyMembersRequest() {
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
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidDiscoverHierarchyMembersMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.MDSCHEMA_MEMBERS;
            }
        });

        describe('executeStatement()', function () {
            it('Should define a method to execute an mdx statement from the server', function () {
                expect(service.executeStatement).toBeDefined();
                expect(typeof service.executeStatement).toBe('function');
            });

            it('Should expect a single optional config object on execute statement request', function () {
                expect(service.executeStatement.length).toBe(1);
            });

            it('Should throw an error if there is no effective url on execute statement request', function () {
                expect(function () {
                    service.executeStatement({mdx: 'something', url: '', catalogName: config.catalogName});
                }).toThrowError('No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                    ' a method or set it once during the Angular config cycle using the xmlaService provider.');
            });

            it('Should throw an error if there is no mdx on execute statement request', function () {
                expect(function () {
                    service.executeStatement({mdx: '', url: 'something'});
                }).toThrowError('No MDX statement has been specified to execute.');
            });

            it('Should use $q to prepare a promise on execute statement request', function () {
                assumeValidExecuteStatementRequested();
                expect($q.received('defer'));
            });

            it('Should return a promise on execute statement request', function () {
                var result = assumeValidExecuteStatementRequested();
                expect(result.then).toBeDefined();
            });

            it('Should use $timeout to defer main execution so that promise is returned ASAP', function () {
                assumeValidExecuteStatementRequested();
                expect($timeout.wasInvokedWith(arg.any(Function)));
            });

            it('Should use the $http service to submit the execute statement request', function () {
                assumeValidExecuteStatementRequested();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidExecuteStatementMessage), arg.matchUsing(hasValidXmlaHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                assumeValidExecuteStatementRequested();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                assumeValidExecuteStatementRequested();
                assumeSuccessfulResponseFromExecuteStatementRequest();
                expect(deferred.receivedWith('resolve', arg.any(Array)));
            });

            it('Should reject the promise on failure response', function () {
                assumeValidExecuteStatementRequested();
                var response = {status: 401, data: {field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function assumeValidExecuteStatementRequested() {
                var result = service.executeStatement({
                    mdx: 'something',
                    url: config.url,
                    catalogName: config.catalogName,
                    params: {
                        param1: 'something',
                        param2: 'else'
                    }
                });
                $timeout.invokeArgOfLastCallWith(0);
                return result;
            }

            function assumeSuccessfulResponseFromExecuteStatementRequest() {
                var message = '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">' +
                    '<soap:Body>' +
                    '<ExecuteResponse xmlns="urn:schemas-microsoft-com:xml-analysis">' +
                    '<return>' +
                    '<root xmlns="urn:schemas-microsoft-com:xml-analysis:rowset"' +
                    ' xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"' +
                    ' xmlns:xsd="http://www.w3.org/2001/XMLSchema"' +
                    ' xmlns:msxmla="http://schemas.microsoft.com/analysisservices/2003/xmla">' +
                    '<row>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x005B_All_x005D_ xsi:type="xsd:double">9.213991E6' +
                    '</_x005B_Account_x005D_._x005B_Account_x005D_._x005B_All_x005D_>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_2_x005D_ xsi:type="xsd:double">0' +
                    '</_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_2_x005D_>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_3_x005D_ xsi:type="xsd:double">' +
                    '6.880196E6</_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_3_x005D_>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_4_x005D_ xsi:type="xsd:double">' +
                    '4.51633E5</_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_4_x005D_>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_7_x005D_ xsi:type="xsd:double">' +
                    '1.882162E6</_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_7_x005D_>' +
                    '<_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_12_x005D_ xsi:type="xsd:double">' +
                    '0</_x005B_Account_x005D_._x005B_Account_x005D_._x0026__x005B_12_x005D_>' +
                    '</row>' +
                    '</root>' +
                    '</return>' +
                    '</ExecuteResponse>' +
                    '</soap:Body>' +
                    '</soap:Envelope>';
                var response = {status: 200, statusText: 'OK', data: message};
                postPromise.success(response);
            }

            function isValidExecuteStatementMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Execute').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Command').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Statement').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Statement')[0].textContent === 'something'
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Parameters').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Parameter').length === 2
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Parameter')[0].firstChild.localName === "Name"
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'Parameter')[0].lastChild.localName === "Value";
            }
        });

        function hasValidXmlaHeaders(arg) {
            return arg !== undefined
                && arg.headers
                && arg.headers['Content-Type'] === 'text/xml'
                && (arg.headers.SOAPAction === 'urn:schemas-microsoft-com:xml-analysis:Discover'
                || arg.headers.SOAPAction === 'urn:schemas-microsoft-com:xml-analysis:Execute')
                && arg.headers.Authorization === 'Basic ' + btoa(config.username + ':' + config.password);
        }
    });
})(window, substitute, specAssistant);
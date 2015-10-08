(function (window, substitute, specAssistant) {
    describe('XmlaService', function () {
        var olap = (window.olap = window.olap || {});
        var testUrl            = 'http://somedomain.com',
            testUsername       = 'mikeh',
            testPassword       = 'p@ssword',
            testDataSourceName = 'My Data Source',
            testCatalogName    = 'My Catalog';
        var arg, service, $http, postPromise, config, deferred, $q;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            $http = substitute.for(['post']);
            postPromise = $http.returnsPromise('post');
            deferred = specAssistant.createDeferredSub();
            $q = specAssistant.createQSub(deferred)
            config = {
                url:            testUrl,
                username:       testUsername,
                password:       testPassword,
                dataSourceName: testDataSourceName,
                catalogName:    testCatalogName
            };
            service = new olap.XmlaService($http, $q, config);
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

            it('Should use the $http service to submit the discover data sources request', function () {
                service.discoverDataSources();
                expect($http.receivedWith('post', config.url, arg.matchUsing(isValidDiscoverDataSourcesMessage), arg.matchUsing(hasValidDiscoverHeaders)));
            });

            it('Should provide handlers for the promise returned by $http service', function () {
                service.discoverDataSources();
                expect(postPromise.receivedThenWithBothHandlers());
            });

            it('Should resolve the promise on success response', function () {
                service.discoverDataSources();
                var response = {status: 200, data:{field: "value"}};
                postPromise.success(response);
                expect(deferred.receivedWith('resolve', response.data))
            });

            it('Should reject the promise on failure response', function () {
                service.discoverDataSources();
                var response = {status: 401, data:{field: "value"}, statusText: 'Error'};
                postPromise.error(response);
                expect(deferred.receivedWith('reject', response))
            });

            function hasValidDiscoverHeaders(arg) {
                return arg !== undefined
                    && arg.headers
                    && arg.headers.ContentType === 'text/xml'
                    && arg.headers.SOAPAction === 'urn:schemas-microsoft-com:xml-analysis:Discover'
                    && arg.headers.Authorization === 'Basic ' + btoa(config.username + ':' + config.password);
            }

            function isValidDiscoverDataSourcesMessage(arg) {
                if (arg === undefined) {
                    return false;
                }

                var xmlParser = new olap.XmlParser();
                var xmlDoc = xmlParser.parse(arg);
                var namespaceURI = 'urn:schemas-microsoft-com:xml-analysis';
                return xmlDoc.getElementsByTagNameNS(namespaceURI, 'Discover').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType').length === 1
                    && xmlDoc.getElementsByTagNameNS(namespaceURI, 'RequestType')[0].textContent === olap.XmlaRequestType.DISCOVER_DATASOURCES;
            }
        });
    });
})(window, substitute, specAssistant);
(function (window, substitute) {
    describe('DiscoverMessageBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var xmlaNamespace = 'urn:schemas-microsoft-com:xml-analysis'
        var arg, builder, xmlParser;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            builder = new olap.DiscoverMessageBuilder();
            xmlParser = new olap.XmlParser();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to specify the request type', function () {
            expect(builder.requestType).toBeDefined();
            expect(typeof builder.requestType).toBe('function');
        });

        it('Should expect a single string argument for the request type', function () {
            expect(builder.requestType.length).toBe(1);
        });

        it('Should throw an error if request type is not provided', function () {
            expect(function () {
                builder.requestType()
            }).toThrowError('requestType requires a single string from the enum olap.XmlaRequestType.')
        });

        it('Should return builder from requestType to support chaining', function () {
            expect(builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES)).toBe(builder);
        });

        it('Should define a method to restrict discovery to specific properties', function () {
            expect(builder.restrict).toBeDefined();
            expect(typeof builder.restrict).toBe('function');
        });

        it('Should expect a single argument to restrict', function () {
            expect(builder.restrict.length).toBe(1);
        });

        it('Should throw an error if restrict is called before request type is set', function () {
            expect(function () {
                builder.restrict('Url');
            }).toThrowError('Supported restrictions are dependent on request type, call requestType before restrict.')
        });

        it('Should throw an error if argument to restrict is not an object or array of objects', function () {
            expect(function () {
                builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict(1);
            }).toThrowError('restrict requires a single object or an array of objects in the form' +
                ' {restrict: "restriction", to: "value"} where "restriction" is a value from the enum olap.XmlaRestriction.');
        });

        it('Should return builder from restrict to support chaining', function () {
            expect(builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict({
                restrict: 'URL',
                to:       'some value'
            })).toBe(builder);
        });

        it('Should define a method to build the message', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should build the correct message without restrictions', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS('http://www.w3.org/2001/12/soap-envelope', 'Body')[0].firstChild;
            expect(bodyContent.localName).toBe('Discover');
            expect(bodyContent.namespaceURI).toBe(xmlaNamespace);
            expect(bodyContent.getElementsByTagName('Restrictions').length).toBe(0);
        });

        it('Should build the correct message with restrictions', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict([
                {
                    restrict: 'DataSourceName',
                    to:       'something'
                },
                {
                    restrict: 'URL',
                    to:       'something'
                }
            ]).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS('http://www.w3.org/2001/12/soap-envelope', 'Body')[0].firstChild;
            var restrictionsElements = bodyContent.getElementsByTagName('Restrictions');
            expect(restrictionsElements.length).toBe(1);
            expect(restrictionsElements[0].namespaceURI).toBe(xmlaNamespace);
            expect(restrictionsElements[0].firstChild).not.toBeNull();
            expect(restrictionsElements[0].firstChild.localName).toBe('RestrictionList');
            expect(restrictionsElements[0].firstChild.namespaceURI).toBe(xmlaNamespace);
            expect(restrictionsElements[0].firstChild.childNodes.length).toBe(2);
            expect(restrictionsElements[0].firstChild.childNodes[0].localName).toBe('DataSourceName');
            expect(restrictionsElements[0].firstChild.childNodes[0].namespaceURI).toBe(xmlaNamespace);
            expect(restrictionsElements[0].firstChild.childNodes[0].textContent).toBe('something');
            expect(restrictionsElements[0].firstChild.childNodes[1].localName).toBe('URL');
            expect(restrictionsElements[0].firstChild.childNodes[1].namespaceURI).toBe(xmlaNamespace);
            expect(restrictionsElements[0].firstChild.childNodes[1].textContent).toBe('something');
        });

        it('Should throw an error if an unsupported restriction is specified for the request type', function () {
            expect(function () {
                builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict([
                    {
                        restrict: 'DataSourceInfo',
                        to:       'something'
                    },
                    {
                        restrict: 'URL',
                        to:       'something'
                    }
                ]);
            }).toThrowError('The request type DISCOVER_DATASOURCES does not support restriction by DataSourceInfo');
        });

        it('Should define a method to set configuration properties of the message', function () {
            expect(builder.property).toBeDefined();
            expect(typeof builder.property).toBe('function');
        });

        it('Should expect a single object argument to config', function () {
            expect(builder.property.length).toBe(1);
        });

        it('Should return builder from property to support chaining', function () {
            expect(builder.property({name: olap.XmlaDiscoverProp.Catalog, value: "value"})).toBe(builder);
        });

        it('Should throw an error if argument to properties is not an object or array of objects', function () {
            expect(function () {
                builder.property(1);
            }).toThrowError('properties requires a single object or an array of objects in the form' +
                ' {name: "name", value: "value"} where "name" is a value from the enum olap.XmlaDiscoverProperty.');
        });

        it('Should build the correct message with properties', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).property([
                {
                    name: 'DataSourceInfo',
                    value:       'something'
                },
                {
                    name: 'Catalog',
                    value:       'something'
                }
            ]).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS('http://www.w3.org/2001/12/soap-envelope', 'Body')[0].firstChild;
            var propertiesElements = bodyContent.getElementsByTagName('Properties');
            expect(propertiesElements.length).toBe(1);
            expect(propertiesElements[0].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild).not.toBeNull();
            expect(propertiesElements[0].firstChild.localName).toBe('PropertyList');
            expect(propertiesElements[0].firstChild.namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes.length).toBe(3);
            expect(propertiesElements[0].firstChild.childNodes[0].localName).toBe('DataSourceInfo');
            expect(propertiesElements[0].firstChild.childNodes[0].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes[0].textContent).toBe('something');
            expect(propertiesElements[0].firstChild.childNodes[1].localName).toBe('Catalog');
            expect(propertiesElements[0].firstChild.childNodes[1].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes[1].textContent).toBe('something');
            expect(propertiesElements[0].firstChild.childNodes[2].localName).toBe('Format');
            expect(propertiesElements[0].firstChild.childNodes[2].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes[2].textContent).toBe('Tabular');
        });

        it('Should always define the format property as tabular', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS('http://www.w3.org/2001/12/soap-envelope', 'Body')[0].firstChild;
            var propertiesElements = bodyContent.getElementsByTagName('Properties');
            expect(propertiesElements.length).toBe(1);
            expect(propertiesElements[0].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild).not.toBeNull();
            expect(propertiesElements[0].firstChild.localName).toBe('PropertyList');
            expect(propertiesElements[0].firstChild.namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes.length).toBe(1);
            expect(propertiesElements[0].firstChild.childNodes[0].localName).toBe('Format');
            expect(propertiesElements[0].firstChild.childNodes[0].namespaceURI).toBe(xmlaNamespace);
            expect(propertiesElements[0].firstChild.childNodes[0].textContent).toBe('Tabular');
        });
    });
})(window, substitute);
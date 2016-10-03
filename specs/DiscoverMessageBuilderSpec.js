(function (window, substitute) {
    describe('DiscoverMessageBuilder', function () {
        var olap = (window.olap = window.olap || {});
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
                builder.restrict({});
            }).toThrowError('Supported restrictions are dependent on request type, call requestType before restrict.')
        });

        it('Should throw an error if argument to restrict is not an object', function () {
            expect(function () {
                builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict(1);
            }).toThrowError('restrict requires a single object representing a map of restrictions in the form' +
                ' {name1: "restriction", name2: "restriction"} where field names are a value from the enum olap.XmlaRestriction.');
        });

        it('Should return builder from restrict to support chaining', function () {
            expect(builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict({URL: 'some value'
            })).toBe(builder);
        });

        it('Should define a method to build the message', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should throw an error if an unsupported restriction is specified for the request type', function () {
            expect(function () {
                builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict(
                    {
                        DataSourceInfo: 'something',
                        URL: 'something'
                    }
                );
            }).toThrowError('The request type DISCOVER_DATASOURCES does not support restriction by DataSourceInfo');
        });

        it('Should define a method to set configuration properties of the message', function () {
            expect(builder.properties).toBeDefined();
            expect(typeof builder.properties).toBe('function');
        });

        it('Should expect a single object argument to config', function () {
            expect(builder.properties.length).toBe(1);
        });

        it('Should return builder from property to support chaining', function () {
            var propertyMap = {};
            propertyMap[olap.XmlaDiscoverProp.Catalog] = "value";
            expect(builder.properties(propertyMap)).toBe(builder);
        });

        it('Should throw an error if argument to properties is not an object or array of objects', function () {
            expect(function () {
                builder.properties(1);
            }).toThrowError('properties requires a single object representing a property map in the form' +
                ' {name1: "value1", name2: "value"} where names are values from the enum olap.XmlaDiscoverProperty.');
        });

        it('Should build the correct message with minimum requirements', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            var propertiesElements = bodyContent.getElementsByTagName('Properties');
            expect(propertiesElements.length).toBe(1);
            expect(propertiesElements[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild).not.toBeNull();
            expect(propertiesElements[0].firstChild.localName).toBe('PropertyList');
            expect(propertiesElements[0].firstChild.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes.length).toBe(1);
            expect(propertiesElements[0].firstChild.childNodes[0].localName).toBe('Format');
            expect(propertiesElements[0].firstChild.childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[0].textContent).toBe('Tabular');
        });

        it('Should append additional properties to the message', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).properties(
                {
                    DataSourceInfo: 'something',
                    Catalog: 'something'
                }
            ).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            var propertiesElements = bodyContent.getElementsByTagName('Properties');
            expect(propertiesElements[0].firstChild.childNodes[0].localName).toBe('DataSourceInfo');
            expect(propertiesElements[0].firstChild.childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[0].textContent).toBe('something');
            expect(propertiesElements[0].firstChild.childNodes[1].localName).toBe('Catalog');
            expect(propertiesElements[0].firstChild.childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[1].textContent).toBe('something');
        });


        it('Should build the correct message without restrictions', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            expect(bodyContent.localName).toBe('Discover');
            expect(bodyContent.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(bodyContent.getElementsByTagName('Restrictions').length).toBe(1);
            expect(bodyContent.getElementsByTagName('RestrictionList').length).toBe(0);
        });

        it('Should append restrictions to the message', function () {
            var result = builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).restrict(
                {
                    DataSourceName: 'something',
                    URL: 'something'
                }).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            var restrictionsElements = bodyContent.getElementsByTagName('Restrictions');
            expect(restrictionsElements.length).toBe(1);
            expect(restrictionsElements[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(restrictionsElements[0].firstChild).not.toBeNull();
            expect(restrictionsElements[0].firstChild.localName).toBe('RestrictionList');
            expect(restrictionsElements[0].firstChild.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(restrictionsElements[0].firstChild.childNodes.length).toBe(2);
            expect(restrictionsElements[0].firstChild.childNodes[0].localName).toBe('DataSourceName');
            expect(restrictionsElements[0].firstChild.childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(restrictionsElements[0].firstChild.childNodes[0].textContent).toBe('something');
            expect(restrictionsElements[0].firstChild.childNodes[1].localName).toBe('URL');
            expect(restrictionsElements[0].firstChild.childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(restrictionsElements[0].firstChild.childNodes[1].textContent).toBe('something');
        });

    });
})(window, substitute);
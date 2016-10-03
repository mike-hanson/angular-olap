(function (window, substitute) {
    describe('ExecuteMessageBuilder', function () {
        var olap = (window.olap = window.olap || {});
        var arg, builder, xmlParser;

        beforeEach(function () {
            substitute.throwErrors();
            arg = substitute.arg;
            builder = new olap.ExecuteMessageBuilder();
            xmlParser = new olap.XmlParser();
        });

        it('Should be defined', function () {
            expect(builder).toBeDefined();
        });

        it('Should define a method to build the message', function () {
            expect(builder.build).toBeDefined();
            expect(typeof builder.build).toBe('function');
        });

        it('Should throw an error if build is called without a command being set', function () {
            expect(function () {
                builder.build();
            }).toThrowError('A command must be set before the message can be built,' +
                ' use one of the command methods first e.g. statement(mdx).');
        });

        it('Should throw an error if build is called without a catalog being set', function () {
            expect(function () {
                builder.statement('something').build();
            }).toThrowError('A current catalog must be set before the message can be built,' +
                ' use the catalog method before calling build.');
        });

        it('Should define a method to set the catalog to execute against', function () {
            expect(builder.catalog).toBeDefined();
            expect(typeof builder.catalog).toBe('function');
        });

        it('Should expect a single string argument to catalog', function () {
            expect(builder.catalog.length).toBe(1);
        });

        it('Should throw an error if catalog name is not provided', function () {
            expect(function () {
                builder.catalog();
            }).toThrowError('A valid catalog name to execute against is required.')
        });

        it('Should throw an error if catalog name is not a string', function () {
            expect(function () {
                builder.catalog(1);
            }).toThrowError('A valid catalog name to execute against is required.')
        });

        it('Should return builder from catalog to support chaining', function () {
            expect(builder.catalog('something')).toBe(builder);
        });

        it('Should define a method to set an mdx statement to execute', function () {
            expect(builder.statement).toBeDefined();
            expect(typeof builder.statement).toBe('function');
        });

        it('Should expect a single string argument for the statement to execute', function () {
            expect(builder.statement.length).toBe(1);
        });

        it('Should return builder from statement to support chaining', function () {
            expect(builder.statement('something')).toBe(builder);
        });

        it('Should throw an error if mdx statement is not provided', function () {
            expect(function () {
                builder.statement();
            }).toThrowError('A valid MDX statement to execute is required.')
        });

        it('Should throw an error if mdx statement is not a string', function () {
            expect(function () {
                builder.statement(1);
            }).toThrowError('A valid MDX statement to execute is required.')
        });

        it('Should define a method to set configuration properties of the message', function () {
            expect(builder.properties).toBeDefined();
            expect(typeof builder.properties).toBe('function');
        });

        it('Should expect a single object argument to properties', function () {
            expect(builder.properties.length).toBe(1);
        });

        it('Should return builder from properties to support chaining', function () {
            var propertyMap = {};
            propertyMap[olap.XmlaDiscoverProp.Catalog] = "value";
            expect(builder.properties(propertyMap)).toBe(builder);
        });

        it('Should throw an error if argument to properties is not an object', function () {
            expect(function () {
                builder.properties(1);
            }).toThrowError('properties requires a single object representing a map of property names and values' +
                ' in the form {name1: "value", name2: "value2"} where names are values' +
                ' from the enum olap.XmlaExecuteProperty.');
        });

        it('Should throw an error if an unsupported property is specified', function () {
            expect(function () {
                builder.properties(
                    {
                        BadProperty: 'something'
                    });
            }).toThrowError('The property BadProperty is not valid for Execute requests.');
        });

        it('Should define a method to set parameters to be used on execution', function () {
            expect(builder.parameters).toBeDefined();
            expect(typeof builder.parameters).toBe('function');
        });

        it('Should expect a single object argument to parameter', function () {
            expect(builder.parameters.length).toBe(1);
        });

        it('Should return builder from parameters to support chaining', function () {
            expect(builder.parameters({
                name: 'value'
            })).toBe(builder);
        });

        it('Should throw an error if argument to parameters is not an object', function () {
            expect(function () {
                builder.parameters(1);
            }).toThrowError('parameters requires a single object representing a map of parameter names and values in the form' +
                ' {name1: "value1", name2: "value2"}.');
        });

        it('Should build the correct message when only minimum requirements met', function () {
            var mdx = 'SELECT [Measures].MEMBERS ON COLUMNS FROM [My Cube]';
            var result = builder.catalog('something').statement(mdx).build();
            var xmlDoc = xmlParser.parse(result);
            var bodyContent = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0].firstChild;
            expect(bodyContent.nodeName).toBe('Execute');
            expect(bodyContent.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(bodyContent.firstChild.nodeName).toBe('Command');
            expect(bodyContent.firstChild.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(bodyContent.firstChild.firstChild.nodeName).toBe('Statement');
            expect(bodyContent.firstChild.firstChild.namespaceURI).toBe(olap.Namespace.Analysis);
            expect(bodyContent.firstChild.firstChild.textContent).toBe(mdx);

            var propertiesElements = bodyContent.getElementsByTagName('Properties');
            expect(propertiesElements.length).toBe(1);
            expect(propertiesElements[0].firstChild.childNodes[0].localName).toBe('Catalog');
            expect(propertiesElements[0].firstChild.childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[0].textContent).toBe('something');
            expect(propertiesElements[0].firstChild.childNodes[1].localName).toBe('Format');
            expect(propertiesElements[0].firstChild.childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[1].textContent).toBe('Tabular');
            expect(propertiesElements[0].firstChild.childNodes[2].localName).toBe('Content');
            expect(propertiesElements[0].firstChild.childNodes[2].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[2].textContent).toBe('Data');
        });

        it('Should append additional properties to the message', function () {
            var mdx = 'SELECT [Measures].MEMBERS ON COLUMNS FROM [My Cube]';
            var result = builder.catalog('something').statement(mdx).properties(
                {
                    DataSourceInfo: 'something'
                }
            ).build();
            var xmlDoc = xmlParser.parse(result);
            var propertiesElements = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0]
                .firstChild.getElementsByTagName('Properties');
            expect(propertiesElements[0].firstChild.childNodes[3].localName).toBe('DataSourceInfo');
            expect(propertiesElements[0].firstChild.childNodes[3].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(propertiesElements[0].firstChild.childNodes[3].textContent).toBe('something');
        });

        it('Should append parameters to the message', function () {
            var mdx = 'SELECT [Measures].MEMBERS ON COLUMNS FROM [My Cube]';
            var result = builder.catalog('something').statement(mdx).parameters(
                {
                    param1: 'something',
                    param2: 'something else'
                }
            ).build();
            var xmlDoc = xmlParser.parse(result);
            var parametersElements = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Body')[0]
                .firstChild.getElementsByTagName('Parameters');
            expect(parametersElements.length).toBe(1);
            expect(parametersElements[0].childNodes.length).toBe(2);
            expect(parametersElements[0].childNodes[0].localName).toBe('Parameter');
            expect(parametersElements[0].childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[0].childNodes[0].localName).toBe('Name');
            expect(parametersElements[0].childNodes[0].childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[0].childNodes[0].textContent).toBe('param1');
            expect(parametersElements[0].childNodes[0].childNodes[1].localName).toBe('Value');
            expect(parametersElements[0].childNodes[0].childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[0].childNodes[1].textContent).toBe('something');
            expect(parametersElements[0].childNodes[1].localName).toBe('Parameter');
            expect(parametersElements[0].childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[1].childNodes[0].localName).toBe('Name');
            expect(parametersElements[0].childNodes[1].childNodes[0].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[1].childNodes[0].textContent).toBe('param2');
            expect(parametersElements[0].childNodes[1].childNodes[1].localName).toBe('Value');
            expect(parametersElements[0].childNodes[1].childNodes[1].namespaceURI).toBe(olap.Namespace.Analysis);
            expect(parametersElements[0].childNodes[1].childNodes[1].textContent).toBe('something else');
        });
    });
})(window, substitute);
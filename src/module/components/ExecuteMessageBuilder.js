(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.ExecuteMessageBuilder = function () {
        var self = this;
        var $propertyMaps = [], $statement, $command, $catalogName, $parameterMaps = [];

        self.catalog = function (catalogName) {
            throwIfInvalidCatalogName(catalogName);
            $catalogName = catalogName;
            return self;
        };

        self.statement = function (mdx) {
            throwIfInvalidMdx(mdx);
            $command = olap.XmlaCommand.Statement;
            $statement = mdx;
            return self;
        };

        self.properties = function (propertyMap) {
            throwIfInvalidProperty(propertyMap);
            $propertyMaps.push(propertyMap)
            return self;
        };

        self.parameters = function(parameterMap){
            throwIfInvalidParameterMap(parameterMap);
            $parameterMaps.push(parameterMap);
            return self;
        };

        self.build = function () {
            throwIfNoCommand();
            throwIfNoCatalog();
            var builder = new olap.SoapMessageBuilder();
            var xmlBuilder = new olap.XmlaElementBuilder();
            var messageBuilder = xmlBuilder.createNew('Execute', true);

            appendCommand(xmlBuilder, messageBuilder);
            appendProperties(xmlBuilder, messageBuilder);
            appendParameters(xmlBuilder, messageBuilder);

            builder.setBody(messageBuilder.build());
            return builder.build();
        };

        function appendCommand(xmlBuilder, messageBuilder) {
            var command = xmlBuilder.createNew('Command');
            var commandContent = xmlBuilder.createNew($command).setContent(buildCommandContent()).build();
            command.setContent(commandContent);
            messageBuilder.setContent(command.build());
        }

        function appendProperties(xmlBuilder, messageBuilder) {
            var properties = xmlBuilder.createNew('Properties');
            var propertiesList = xmlBuilder.createNew('PropertyList');

            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Catalog).setContent($catalogName).build());
            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Format).setContent(olap.XmlaFormat.Tabular).build());
            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Content).setContent('Data').build());

            if ($propertyMaps.length) {
                for (var j = 0; j < $propertyMaps.length; j++) {
                    var map = $propertyMaps[j];
                    for(var name in map)
                    {
                        if(map.hasOwnProperty(name)){
                            if (name !== olap.XmlaExecuteProp.Format) {
                                propertiesList.appendContent(xmlBuilder.createNew(name).setContent(map[name]).build());
                            }
                        }
                    }
                }
            }

            properties.setContent(propertiesList.build());
            messageBuilder.appendContent(properties.build());
        }

        function appendParameters(xmlBuilder, messageBuilder) {
            var parameters = xmlBuilder.createNew('Parameters');
            var parameterElement, nameElement, valueElement;
            for (var i = 0; i < $parameterMaps.length; i++) {
                var map = $parameterMaps[i];
                for(var name in map){
                    if(map.hasOwnProperty(name)){
                        parameterElement = xmlBuilder.createNew('Parameter');
                        nameElement = xmlBuilder.createNew('Name').setContent(name);
                        parameterElement.setContent(nameElement.build());
                        valueElement = xmlBuilder.createNew('Value').setContent(map[name]);
                        parameterElement.appendContent(valueElement.build());
                        parameters.appendContent(parameterElement.build());
                    }
                }
            }
            messageBuilder.appendContent(parameters.build());
        }

        function throwIfInvalidCatalogName(catalogName) {
            var msg = 'A valid catalog name to execute against is required.'
            if (!catalogName || typeof catalogName !== 'string') {
                throw new Error(msg);
            }
        }

        function throwIfNoCatalog() {
            var msg = 'A current catalog must be set before the message can be built,' +
                ' use the catalog method before calling build.';
            if (!$catalogName) {
                throw new Error(msg);
            }
        }

        function throwIfNoCommand() {
            var msg = 'A command must be set before the message can be built, use one of the command methods' +
                ' first e.g. statement(mdx).';
            if (!$command || !olap.XmlaCommand[$command]) {
                throw new Error(msg);
            }
        }

        function throwIfUnsupportedProperty(property) {
            var msg = 'The property ' + property + ' is not valid for Execute requests.'
            if (!olap.XmlaExecuteProp[property]) {
                throw new Error(msg);
            }
        }

        function throwIfInvalidMdx(mdx) {
            var msg = 'A valid MDX statement to execute is required.'
            if (!mdx || typeof mdx !== 'string') {
                throw new Error(msg);
            }
        }

        function throwIfInvalidProperty(propertyMap) {
            var msg = 'properties requires a single object representing a map of property names and values' +
                ' in the form {name1: "value", name2: "value2"} where names are values' +
                ' from the enum olap.XmlaExecuteProperty.';
            if (!propertyMap || typeof propertyMap !== 'object' || propertyMap instanceof Array) {
                throw new Error(msg);
            }

            for(var name in propertyMap)
            {
                if(propertyMap.hasOwnProperty(name)) {
                    throwIfUnsupportedProperty(name);
                }
            }
        }

        function throwIfInvalidParameterMap(parameterMap) {
            var msg = 'parameters requires a single object representing a map of parameter names and values in the form' +
                ' {name1: "value1", name2: "value2"}.';
            if (!parameterMap || typeof parameterMap !== 'object' || parameterMap instanceof Array) {
                throw new Error(msg);
            }
        }

        function buildCommandContent() {
            switch ($command) {
                case olap.XmlaCommand.Statement:
                    return $statement;
            }
        }
    }
})(window);
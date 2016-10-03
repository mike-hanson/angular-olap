(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.DiscoverMessageBuilder = function () {
        var self = this;
        var $requestType = '', $restrictionMaps = [], $propertyMaps = [];

        self.properties = function (propertyMap) {
            throwIfInvalidPropertyMap(propertyMap);
            $propertyMaps.push(propertyMap);
            return self;
        };

        self.requestType = function (type) {
            throwIfInvalidRequestType(type);
            $requestType = type;
            return self;
        };

        self.restrict = function (restrictionMap) {
            throwIfNoRequestType();
            throwIfInvalidRestrictionMap(restrictionMap);
            $restrictionMaps.push(restrictionMap)
            return self;
        };

        function appendRequestType(xmlBuilder, messageBuilder) {
            var requestType = xmlBuilder.createNew('RequestType').setContent($requestType).build();
            messageBuilder.setContent(requestType);
        }

        function appendRestrictions(xmlBuilder, messageBuilder) {
            var restrictions = xmlBuilder.createNew('Restrictions');
            var restrictionsList = xmlBuilder.createNew('RestrictionList');

            if ($restrictionMaps.length) {
                for (var i = 0; i < $restrictionMaps.length; i++) {
                    var map = $restrictionMaps[i];
                    for(var name in map)
                    {
                        if(map.hasOwnProperty(name))
                        {
                            restrictionsList.appendContent(xmlBuilder.createNew(name)
                                .setContent(map[name]).build());
                        }
                    }
                }
                restrictions.setContent(restrictionsList.build());
                messageBuilder.appendContent(restrictions.build());
            }
            messageBuilder.appendContent(restrictions.build());
        }

        function appendProperties(xmlBuilder, messageBuilder) {
            var properties = xmlBuilder.createNew('Properties');
            var propertiesList = xmlBuilder.createNew('PropertyList');

            if ($propertyMaps.length) {
                for (var j = 0; j < $propertyMaps.length; j++) {
                    var map = $propertyMaps[j];
                    for(var name in map)
                    {
                        if(map.hasOwnProperty(name))
                        {
                            if (name !== olap.XmlaDiscoverProp.Format) {
                                propertiesList.appendContent(xmlBuilder.createNew(name).setContent(map[name]).build());
                            }
                        }
                    }
                }
            }

            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaDiscoverProp.Format).setContent(olap.XmlaFormat.Tabular).build());
            properties.setContent(propertiesList.build());
            messageBuilder.appendContent(properties.build());
        }

        self.build = function () {
            var builder = new olap.SoapMessageBuilder();
            var xmlBuilder = new olap.XmlaElementBuilder();
            var messageBuilder = xmlBuilder.createNew('Discover', true);

            appendRequestType(xmlBuilder, messageBuilder);
            appendRestrictions(xmlBuilder, messageBuilder);
            appendProperties(xmlBuilder, messageBuilder);

            builder.setBody(messageBuilder.build());
            return builder.build();
        };

        function throwIfInvalidRequestType(type) {
            if (!type || typeof type !== 'string' || olap.XmlaRequestType[type] === undefined) {
                throw new Error('requestType requires a single string from the enum olap.XmlaRequestType.')
            }
        }

        function throwIfNoRequestType() {
            if (!$requestType) {
                throw new Error('Supported restrictions are dependent on request type, call requestType before restrict.')
            }
        }

        function throwIfInvalidRestrictionMap(restrictionMap) {
            var msg = 'restrict requires a single object representing a map of restrictions in the form' +
                ' {name1: "restriction", name2: "restriction"} where field names are a value from the enum olap.XmlaRestriction.';
            if (!restrictionMap || typeof restrictionMap !== 'object' || restrictionMap instanceof Array) {
                throw new Error(msg);
            }

            for(var name in restrictionMap){
                if(restrictionMap.hasOwnProperty(name))
                {
                    throwIfUnsupportedRestriction(name);
                }
            }
        }

        function throwIfUnsupportedRestriction(restriction) {
            var msg = 'The request type ' + $requestType + ' does not support restriction by ' + restriction;
            var schema = olap.XmlaRecordsetSchema[$requestType];
            var column = schema[restriction];
            if (!column || column.canRestrict === false) {
                throw new Error(msg);
            }
        }

        function throwIfUnsupportedProperty(property) {
            var msg = 'The property ' + property + ' is not valid for Discover requests.'
            if (!olap.XmlaDiscoverProp[property]) {
                throw new Error(msg);
            }
        }

        function throwIfInvalidPropertyMap(propertyMap) {
            var msg = 'properties requires a single object representing a property map in the form' +
                ' {name1: "value1", name2: "value"} where names are values from the enum olap.XmlaDiscoverProperty.';
            if (!propertyMap || typeof propertyMap !== 'object' || propertyMap instanceof Array) {
                throw new Error(msg);
            }

            for(var name in propertyMap){
                if(propertyMap.hasOwnProperty(name)){
                    throwIfUnsupportedProperty(name);
                }
            }
        }
    }
})(window);
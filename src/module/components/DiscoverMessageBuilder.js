(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.DiscoverMessageBuilder = function () {
        var self = this;
        var $requestType = '', $restrictions = [], $properties = [];

        self.property = function (properties) {
            throwIfInvalidProperty(properties);
            if (properties instanceof Array) {
                Array.prototype.push.apply($properties, properties);
            }
            else {
                $properties.push(properties)
            }
            return self;
        };

        self.requestType = function (type) {
            throwIfInvalidRequestType(type);
            $requestType = type;
            return self;
        };

        self.restrict = function (restrictions) {
            throwIfNoRequestType();
            throwIfInvalidRestriction(restrictions);
            if (restrictions instanceof Array) {
                Array.prototype.push.apply($restrictions, restrictions);
            }
            else {
                $restrictions.push(restrictions)
            }
            return self;
        };

        self.build = function () {
            var builder = new olap.SoapMessageBuilder();
            var xmlBuilder = new olap.XmlaElementBuilder();
            var messageBuilder = xmlBuilder.createNew('Discover', true);
            var requestType = xmlBuilder.createNew('RequestType').setContent($requestType).build();
            var properties = xmlBuilder.createNew('Properties');
            var propertiesList = xmlBuilder.createNew('PropertyList');
            var restrictions = xmlBuilder.createNew('Restrictions');
            var restrictionsList = xmlBuilder.createNew('RestrictionList');
            messageBuilder.setContent(requestType);

            if ($restrictions.length) {
                for (var i = 0; i < $restrictions.length; i++) {
                    var restriction = $restrictions[i];
                    restrictionsList.appendContent(xmlBuilder.createNew(restriction.restrict).setContent(restriction.to).build());
                }
                restrictions.setContent(restrictionsList.build());
                messageBuilder.appendContent(restrictions.build());
            }

            if ($properties.length) {
                for (var j = 0; j < $properties.length; j++) {
                    var property = $properties[j];
                    if(property.name !== olap.XmlaDiscoverProp.Format) {
                        propertiesList.appendContent(xmlBuilder.createNew(property.name).setContent(property.value).build());
                    }
                }
            }

            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaDiscoverProp.Format).setContent(olap.XmlaFormat.Tabular).build());
            properties.setContent(propertiesList.build());
            messageBuilder.appendContent(properties.build());
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

        function throwIfInvalidRestriction(restrictions) {
            var msg = 'restrict requires a single object or an array of objects in the form' +
                ' {restrict: "restriction", to: "value"} where "restriction" is a value from the enum olap.XmlaRestriction.';
            if (!restrictions || (typeof restrictions !== 'object' && !(restrictions instanceof Array))) {
                throw new Error(msg);
            }

            if (restrictions instanceof Array) {
                for (var i = 0; i < restrictions.length; i++) {
                    var restriction = restrictions[i];
                    if (!restriction.restrict || !restriction.to) {
                        throw new Error(msg);
                    }
                    else {
                        throwIfUnsupportedRestriction(restriction);
                    }
                }
            }
            else {
                if (!restrictions.restrict || !restrictions.to) {
                    throw new Error(msg);
                }
                else {
                    throwIfUnsupportedRestriction(restrictions);
                }
            }
        }

        function throwIfUnsupportedRestriction(restriction) {
            var msg = 'The request type ' + $requestType + ' does not support restriction by ' + restriction.restrict;
            var schema = olap.XmlaRecordsetSchema[$requestType];
            var column = schema[restriction.restrict];
            if (!column || column.canRestrict === false) {
                throw new Error(msg);
            }
        }

        function throwIfUnsupportedProperty(property) {
            var msg = 'The property ' + property.name + ' is not valid for Discover requests.'
            if (!olap.XmlaDiscoverProp[property.name]) {
                throw new Error(msg);
            }
        }

        function throwIfInvalidProperty(properties) {
            var msg = 'properties requires a single object or an array of objects in the form' +
                ' {name: "name", value: "value"} where "name" is a value from the enum olap.XmlaDiscoverProperty.';
            if (!properties || (typeof properties !== 'object' && !(properties instanceof Array))) {
                throw new Error(msg);
            }

            if (properties instanceof Array) {
                for (var i = 0; i < properties.length; i++) {
                    var property = properties[i];
                    if (!property.name || !property.value) {
                        throw new Error(msg);
                    }
                    else {
                        throwIfUnsupportedProperty(property);
                    }
                }
            }
            else {
                if (!properties.name || !properties.value) {
                    throw new Error(msg);
                }
                else {
                    throwIfUnsupportedProperty(properties);
                }
            }
        }
    }
})(window);
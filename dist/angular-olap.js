(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.Base64Encoder = function() {
        var self = this;
        var paddingCharacter = "=";
        var alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        self.encode = function(str) {
            if (window.btoa) {
                return window.btoa(str);
            }
            if (!str) {
                throw new Error("A string to encode is required by olap.Base64Encoder.encode.");
            }
            var byte;
            var result = [];
            str = "" + str;
            var maxLength = str.length - str.length % 3;
            if (str.length == 0) {
                return str;
            }
            for (var i = 0; i < maxLength; i += 3) {
                byte = getByte(str, i) << 16 | getByte(str, i + 1) << 8 | getByte(str, i + 2);
                result.push(alpha.charAt(byte >> 18));
                result.push(alpha.charAt(byte >> 12 & 63));
                result.push(alpha.charAt(byte >> 6 & 63));
                result.push(alpha.charAt(byte & 63));
            }
            switch (str.length - maxLength) {
              case 1:
                byte = getByte(str, i) << 16;
                result.push(alpha.charAt(byte >> 18) + alpha.charAt(byte >> 12 & 63) + paddingCharacter + paddingCharacter);
                break;

              case 2:
                byte = getByte(str, i) << 16 | getByte(str, i + 1) << 8;
                result.push(alpha.charAt(byte >> 18) + alpha.charAt(byte >> 12 & 63) + alpha.charAt(byte >> 6 & 63) + paddingCharacter);
                break;
            }
            return result.join("");
        };
        function getByte(str, index) {
            var character = str.charCodeAt(index);
            if (character > 255) {
                throw new Error("INVALID_CHARACTER_ERR: DOM Exception 5");
            }
            return character;
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.DiscoverMessageBuilder = function() {
        var self = this;
        var $requestType = "", $restrictionMaps = [], $propertyMaps = [];
        self.properties = function(propertyMap) {
            throwIfInvalidPropertyMap(propertyMap);
            $propertyMaps.push(propertyMap);
            return self;
        };
        self.requestType = function(type) {
            throwIfInvalidRequestType(type);
            $requestType = type;
            return self;
        };
        self.restrict = function(restrictionMap) {
            throwIfNoRequestType();
            throwIfInvalidRestrictionMap(restrictionMap);
            $restrictionMaps.push(restrictionMap);
            return self;
        };
        function appendRequestType(xmlBuilder, messageBuilder) {
            var requestType = xmlBuilder.createNew("RequestType").setContent($requestType).build();
            messageBuilder.setContent(requestType);
        }
        function appendRestrictions(xmlBuilder, messageBuilder) {
            var restrictions = xmlBuilder.createNew("Restrictions");
            var restrictionsList = xmlBuilder.createNew("RestrictionList");
            if ($restrictionMaps.length) {
                for (var i = 0; i < $restrictionMaps.length; i++) {
                    var map = $restrictionMaps[i];
                    for (var name in map) {
                        if (map.hasOwnProperty(name)) {
                            restrictionsList.appendContent(xmlBuilder.createNew(name).setContent(map[name]).build());
                        }
                    }
                }
                restrictions.setContent(restrictionsList.build());
                messageBuilder.appendContent(restrictions.build());
            }
            messageBuilder.appendContent(restrictions.build());
        }
        function appendProperties(xmlBuilder, messageBuilder) {
            var properties = xmlBuilder.createNew("Properties");
            var propertiesList = xmlBuilder.createNew("PropertyList");
            if ($propertyMaps.length) {
                for (var j = 0; j < $propertyMaps.length; j++) {
                    var map = $propertyMaps[j];
                    for (var name in map) {
                        if (map.hasOwnProperty(name)) {
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
        self.build = function() {
            var builder = new olap.SoapMessageBuilder();
            var xmlBuilder = new olap.XmlaElementBuilder();
            var messageBuilder = xmlBuilder.createNew("Discover", true);
            appendRequestType(xmlBuilder, messageBuilder);
            appendRestrictions(xmlBuilder, messageBuilder);
            appendProperties(xmlBuilder, messageBuilder);
            builder.setBody(messageBuilder.build());
            return builder.build();
        };
        function throwIfInvalidRequestType(type) {
            if (!type || typeof type !== "string" || olap.XmlaRequestType[type] === undefined) {
                throw new Error("requestType requires a single string from the enum olap.XmlaRequestType.");
            }
        }
        function throwIfNoRequestType() {
            if (!$requestType) {
                throw new Error("Supported restrictions are dependent on request type, call requestType before restrict.");
            }
        }
        function throwIfInvalidRestrictionMap(restrictionMap) {
            var msg = "restrict requires a single object representing a map of restrictions in the form" + ' {name1: "restriction", name2: "restriction"} where field names are a value from the enum olap.XmlaRestriction.';
            if (!restrictionMap || typeof restrictionMap !== "object" || restrictionMap instanceof Array) {
                throw new Error(msg);
            }
            for (var name in restrictionMap) {
                if (restrictionMap.hasOwnProperty(name)) {
                    throwIfUnsupportedRestriction(name);
                }
            }
        }
        function throwIfUnsupportedRestriction(restriction) {
            var msg = "The request type " + $requestType + " does not support restriction by " + restriction;
            var schema = olap.XmlaRecordsetSchema[$requestType];
            var column = schema[restriction];
            if (!column || column.canRestrict === false) {
                throw new Error(msg);
            }
        }
        function throwIfUnsupportedProperty(property) {
            var msg = "The property " + property + " is not valid for Discover requests.";
            if (!olap.XmlaDiscoverProp[property]) {
                throw new Error(msg);
            }
        }
        function throwIfInvalidPropertyMap(propertyMap) {
            var msg = "properties requires a single object representing a property map in the form" + ' {name1: "value1", name2: "value"} where names are values from the enum olap.XmlaDiscoverProperty.';
            if (!propertyMap || typeof propertyMap !== "object" || propertyMap instanceof Array) {
                throw new Error(msg);
            }
            for (var name in propertyMap) {
                if (propertyMap.hasOwnProperty(name)) {
                    throwIfUnsupportedProperty(name);
                }
            }
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.ExecuteMessageBuilder = function() {
        var self = this;
        var $propertyMaps = [], $statement, $command, $catalogName, $parameterMaps = [];
        self.catalog = function(catalogName) {
            throwIfInvalidCatalogName(catalogName);
            $catalogName = catalogName;
            return self;
        };
        self.statement = function(mdx) {
            throwIfInvalidMdx(mdx);
            $command = olap.XmlaCommand.Statement;
            $statement = mdx;
            return self;
        };
        self.properties = function(propertyMap) {
            throwIfInvalidProperty(propertyMap);
            $propertyMaps.push(propertyMap);
            return self;
        };
        self.parameters = function(parameterMap) {
            throwIfInvalidParameterMap(parameterMap);
            $parameterMaps.push(parameterMap);
            return self;
        };
        self.build = function() {
            throwIfNoCommand();
            throwIfNoCatalog();
            var builder = new olap.SoapMessageBuilder();
            var xmlBuilder = new olap.XmlaElementBuilder();
            var messageBuilder = xmlBuilder.createNew("Execute", true);
            appendCommand(xmlBuilder, messageBuilder);
            appendProperties(xmlBuilder, messageBuilder);
            appendParameters(xmlBuilder, messageBuilder);
            builder.setBody(messageBuilder.build());
            return builder.build();
        };
        function appendCommand(xmlBuilder, messageBuilder) {
            var command = xmlBuilder.createNew("Command");
            var commandContent = xmlBuilder.createNew($command).setContent(buildCommandContent()).build();
            command.setContent(commandContent);
            messageBuilder.setContent(command.build());
        }
        function appendProperties(xmlBuilder, messageBuilder) {
            var properties = xmlBuilder.createNew("Properties");
            var propertiesList = xmlBuilder.createNew("PropertyList");
            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Catalog).setContent($catalogName).build());
            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Format).setContent(olap.XmlaFormat.Tabular).build());
            propertiesList.appendContent(xmlBuilder.createNew(olap.XmlaExecuteProp.Content).setContent("Data").build());
            if ($propertyMaps.length) {
                for (var j = 0; j < $propertyMaps.length; j++) {
                    var map = $propertyMaps[j];
                    for (var name in map) {
                        if (map.hasOwnProperty(name)) {
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
            var parameters = xmlBuilder.createNew("Parameters");
            var parameterElement, nameElement, valueElement;
            for (var i = 0; i < $parameterMaps.length; i++) {
                var map = $parameterMaps[i];
                for (var name in map) {
                    if (map.hasOwnProperty(name)) {
                        parameterElement = xmlBuilder.createNew("Parameter");
                        nameElement = xmlBuilder.createNew("Name").setContent(name);
                        parameterElement.setContent(nameElement.build());
                        valueElement = xmlBuilder.createNew("Value").setContent(map[name]);
                        parameterElement.appendContent(valueElement.build());
                        parameters.appendContent(parameterElement.build());
                    }
                }
            }
            messageBuilder.appendContent(parameters.build());
        }
        function throwIfInvalidCatalogName(catalogName) {
            var msg = "A valid catalog name to execute against is required.";
            if (!catalogName || typeof catalogName !== "string") {
                throw new Error(msg);
            }
        }
        function throwIfNoCatalog() {
            var msg = "A current catalog must be set before the message can be built," + " use the catalog method before calling build.";
            if (!$catalogName) {
                throw new Error(msg);
            }
        }
        function throwIfNoCommand() {
            var msg = "A command must be set before the message can be built, use one of the command methods" + " first e.g. statement(mdx).";
            if (!$command || !olap.XmlaCommand[$command]) {
                throw new Error(msg);
            }
        }
        function throwIfUnsupportedProperty(property) {
            var msg = "The property " + property + " is not valid for Execute requests.";
            if (!olap.XmlaExecuteProp[property]) {
                throw new Error(msg);
            }
        }
        function throwIfInvalidMdx(mdx) {
            var msg = "A valid MDX statement to execute is required.";
            if (!mdx || typeof mdx !== "string") {
                throw new Error(msg);
            }
        }
        function throwIfInvalidProperty(propertyMap) {
            var msg = "properties requires a single object representing a map of property names and values" + ' in the form {name1: "value", name2: "value2"} where names are values' + " from the enum olap.XmlaExecuteProperty.";
            if (!propertyMap || typeof propertyMap !== "object" || propertyMap instanceof Array) {
                throw new Error(msg);
            }
            for (var name in propertyMap) {
                if (propertyMap.hasOwnProperty(name)) {
                    throwIfUnsupportedProperty(name);
                }
            }
        }
        function throwIfInvalidParameterMap(parameterMap) {
            var msg = "parameters requires a single object representing a map of parameter names and values in the form" + ' {name1: "value1", name2: "value2"}.';
            if (!parameterMap || typeof parameterMap !== "object" || parameterMap instanceof Array) {
                throw new Error(msg);
            }
        }
        function buildCommandContent() {
            switch ($command) {
              case olap.XmlaCommand.Statement:
                return $statement;
            }
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.MdxBuilder = function() {
        var self = this;
        var $queryAxisBuilders = [], $cubeName, $currentAxis = -1;
        self.on = function(index) {
            validateAxis(index);
        };
        self.select = function() {
            var result = new olap.QueryAxisBuilder(self, extractSelections(arguments));
            $queryAxisBuilders.push(result);
            return result;
        };
        self.from = function(cube) {
            if (!cube || typeof cube !== "string") {
                throw new Error("A valid name for the cube to query is required.");
            }
            $cubeName = cube;
        };
        self.build = function() {
            var result = "SELECT ";
            var counter = 0;
            for (var i = 0; i < queryAxis.length; i++) {
                var axis = queryAxis[i];
                if (axis) {
                    result += (counter > 1 ? ", " : "") + "{ ";
                    for (var j = 0; j < axis.length; j++) {
                        var selection = axis[j];
                        result += formatSelection(selection, j);
                    }
                    result += " } ON " + aliasOrIndex(i);
                    counter++;
                }
            }
            return result;
        };
        function extractSelections(args) {
            if (args.length === 1 && args instanceof Array) {
                return args;
            }
            var selections = [];
            for (var i = 0; i < args.length; i++) {
                selections[i] = args[i];
            }
            return selections;
        }
        function validateAxis(index) {
            if (typeof index !== "number" || index < 0 || index > 127) {
                throw new Error("An index between 0 and 127 for the axis is required, " + "consider using one of the olap.MdxAxis aliases");
            }
            if (index + 1 > $queryAxisBuilders.length) {
                throw new Error("Axis " + index + " cannot be specified because axis " + (index - 1) + " has not been specified. Axis must be specified in sequence.");
            }
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.MdxMemberProperty = {
        ID: "ID",
        Key: "Key",
        KEY0: "KEY0",
        KEY1: "KEY1",
        KEY2: "KEY2",
        KEY3: "KEY3",
        KEY4: "KEY4",
        KEY5: "KEY5",
        KEY6: "KEY6",
        KEY7: "KEY7",
        KEY8: "KEY8",
        KEY9: "KEY9",
        Name: "Name",
        CATALOG_NAME: "CATALOG_NAME",
        CHILDREN_CARDINALITY: "CHILDREN_CARDINALITY",
        CUSTOM_ROLLUP: "CUSTOM_ROLLUP",
        CUSTOM_ROLLUP_PROPERTIES: "CUSTOM_ROLLUP_PROPERTIES",
        DESCRIPTION: "DESCRIPTION",
        DIMENSION_UNIQUE_NAME: "DIMENSION_UNIQUE_NAME",
        HIERARCHY_UNIQUE_NAME: "HIERARCHY_UNIQUE_NAME",
        IS_DATAMEMBER: "IS_DATAMEMBER",
        IS_PLACEHOLDERMEMBER: "IS_PLACEHOLDERMEMBER",
        LEVEL_NUMBER: "LEVEL_NUMBER",
        LEVEL_UNIQUE_NAME: "LEVEL_UNIQUE_NAME",
        MEMBER_CAPTION: "MEMBER_CAPTION",
        MEMBER_KEY: "MEMBER_KEY",
        MEMBER_NAME: "MEMBER_NAME",
        MEMBER_TYPE: "MEMBER_TYPE",
        MEMBER_UNIQUE_NAME: "MEMBER_UNIQUE_NAME",
        MEMBER_VALUE: "MEMBER_VALUE",
        PARENT_COUNT: "PARENT_COUNT",
        PARENT_LEVEL: "PARENT_LEVEL",
        PARENT_UNIQUE_NAME: "PARENT_UNIQUE_NAME",
        SKIPPED_LEVELS: "SKIPPED_LEVELS",
        UNARY_OPERATOR: "UNARY_OPERATOR",
        UNIQUE_NAME: "UNIQUE_NAME"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.MdxService = function() {
        var self = this;
        self.new = function() {
            return new olap.MdxBuilder();
        };
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.Namespace = {
        Analysis: "urn:schemas-microsoft-com:xml-analysis",
        Rowset: "urn:schemas-microsoft-com:xml-analysis:rowset",
        SoapEnvelope: "http://schemas.xmlsoap.org/soap/envelope/",
        SoapEncoding: "http://schemas.xmlsoap.org/soap/encoding/"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.MdxAxis = {
        COLUMNS: 0,
        ROWS: 1,
        PAGES: 2,
        SECTIONS: 3,
        CHAPTERS: 4
    };
    olap.QueryAxisBuilder = function(mdxBuilder, selections) {
        var self = this;
        var $selections = selections, $index;
        var queryAxisAlias = [ "COLUMNS", "ROWS", "PAGES", "SECTIONS", "CHAPTERS" ];
        validateSelections(selections);
        self.on = function(index) {
            validateAxis(index);
            $index = index;
            return mdxBuilder;
        };
        self.build = function() {
            var result = "{ ";
            for (var i = 0; i < $selections.length; i++) {
                result += formatSelection($selections[i], i);
            }
            return result + " } ON " + aliasOrIndex($index);
        };
        function validateSelections(selections) {
            if (!selections || selections.length < 1) {
                throw new Error("At least one member must be specified for the axis");
            }
            for (var i = 0; i < selections.length; i++) {
                var selection = selections[i];
                if (typeof selection !== "string" || selection.indexOf(".") === -1) {
                    throw new Error("Axis members must be specified as a dotted string or an array of dotted strings");
                }
            }
        }
        function aliasOrIndex(index) {
            if (index < queryAxisAlias.length) {
                return queryAxisAlias[index];
            }
            return "" + index;
        }
        function formatSelection(selection, index) {
            var elements = selection.split(".");
            return (index > 0 ? ", " : "") + "[" + elements.join("].[") + "]";
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.SoapMessageBuilder = function() {
        var self = this;
        var msgLeader = '<soap:Envelope xmlns:soap="' + olap.Namespace.SoapEnvelope + '" soap:encodingStyle="' + olap.Namespace.SoapEncoding + '"><soap:Header>';
        var msgJoint = "</soap:Header><soap:Body>";
        var msgTail = "</soap:Body></soap:Envelope>";
        var headers = [], bodyContent = "";
        self.addHeader = function(header) {
            return self;
        };
        self.setBody = function(body) {
            bodyContent = body;
            return self;
        };
        self.build = function() {
            return msgLeader + msgJoint + bodyContent + msgTail;
        };
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlElementBuilder = function() {
        var self = this;
        var $current = "";
        self.createNew = function(name, namespaceUri) {
            $current = "<" + name + (namespaceUri ? ' xmlns="' + namespaceUri + '"' : "") + "></" + name + ">";
            return self;
        };
        self.setContent = function(content) {
            var openingElementLength = $current.indexOf(">") + 1;
            var endElementStart = $current.lastIndexOf("</");
            $current = $current.substr(0, openingElementLength) + content + $current.substr(endElementStart);
            return self;
        };
        self.appendContent = function(content) {
            var endElementStart = $current.lastIndexOf("</");
            $current = $current.substr(0, endElementStart) + content + $current.substr(endElementStart);
            return self;
        };
        self.build = function() {
            var result = $current;
            $current = "";
            return result;
        };
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlParser = function() {
        var self = this;
        self.parse = function(xmlString) {
            var xmlDoc, domParser, parseError;
            if (!xmlString || typeof xmlString !== "string") {
                return null;
            }
            try {
                if (window.DOMParser) {
                    domParser = new DOMParser();
                    xmlDoc = domParser.parseFromString(xmlString, "text/xml");
                } else {
                    xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                    xmlDoc.async = "false";
                    xmlDoc.loadXML(xmlString);
                }
            } catch (e) {
                parseError = e;
                xmlDoc = undefined;
            }
            if (!xmlDoc || !xmlDoc.documentElement || xmlDoc.getElementsByTagName("parsererror").length) {
                var errorContent = xmlDoc ? xmlDoc.documentElement.outerHTML : parseError ? parseError.message : xmlString;
                throw new Error("Invalid XML: " + errorContent);
            }
            return xmlDoc;
        };
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaAggregator = {
        Unknown: 0,
        Sum: 1,
        Count: 2,
        Min: 3,
        Max: 4,
        Avg: 6,
        StdDev: 7,
        DistinctCount: 8,
        None: 9,
        AvgOfChildren: 10,
        FirstChild: 11,
        LastChild: 12,
        FirstNonEmpty: 13,
        LastNoneEmpty: 14,
        ByAccount: 15,
        Calculated: 127
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaCommand = {
        Alter: "Alter",
        Backup: "Backup",
        Batch: "Batch",
        BeginTransaction: "BeginTransaction",
        Cancel: "Cancel",
        ClearCache: "ClearCache",
        CommitTransaction: "CommitTransaction",
        Create: "Create",
        Delete: "Delete",
        DesignAggregations: "DesignAggregations",
        Drop: "Drop",
        Insert: "Insert",
        Lock: "Lock",
        MergePartitions: "MergePartitions",
        NotifyTableChange: "NotifyTableChange",
        Process: "Process",
        RollbackTransaction: "RollbackTransaction",
        SetPasswordEncryptionKey: "SetPasswordEncryptionKey",
        Statement: "Statement",
        Subscribe: "Subscribe",
        Synchronize: "Synchronize",
        Unlock: "Unlock",
        Update: "Update",
        UpdateCells: "UpdateCells"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaDimensionMemberType = {
        Unknown: 0,
        Regular: 1,
        All: 2,
        Measure: 3,
        Formula: 4
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaDimensionType = {
        Unknown: 0,
        Time: 1,
        Measure: 2,
        Other: 3,
        Quantitative: 5,
        Accounts: 6,
        Customers: 7,
        Products: 8,
        Scenario: 9,
        Utility: 10,
        Currency: 11,
        Rates: 12,
        Channel: 13,
        Promotion: 14,
        Organization: 15,
        BillOfMaterials: 16,
        Geography: 17
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaDiscoverProp = {
        Catalog: "Catalog",
        CatalogLocation: "CatalogLocation",
        ClientProcessID: "ClientProcessID",
        CommitTimeout: "CommitTimeout",
        Content: "Content",
        Cube: "Cube",
        DataSourceInfo: "DataSourceInfo",
        Dialect: "Dialect",
        EffectiveRoles: "EffectiveRoles",
        EffectiveUserName: "EffectiveUserName",
        ExecutionMode: "ExecutionMode",
        ForceCommitTimeout: "ForceCommitTimeout",
        Format: "Format",
        ImpactAnalysis: "ImpactAnalysis",
        LocaleIdentifier: "LocaleIdentifier",
        MaximumRows: "MaximumRows",
        MDXSupport: "MDXSupport",
        NonEmptyThreshold: "NonEmptyThreshold",
        ProviderName: "ProviderName",
        ProviderType: "ProviderType",
        ProviderVersion: "ProviderVersion",
        RealTimeOlap: "RealTimeOlap",
        ReturnCellProperties: "ReturnCellProperties",
        Roles: "Roles",
        SafetyOptions: "SafetyOptions",
        SecuredCellValue: "SecuredCellValue",
        ServerName: "ServerName",
        ShowHiddenCubes: "ShowHiddenCubes",
        SQLQueryMode: "SQLQueryMode",
        SQLSupport: "SQLSupport",
        StateSupport: "StateSupport",
        Timeout: "Timeout",
        TransactionDDL: "TransactionDDL",
        VisualMode: "VisualMode"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaElementBuilder = function() {
        var self = this;
        self.createNew = function(name, includeNamespace) {
            if (typeof includeNamespace === "undefined") {
                includeNamespace = false;
            }
            var xmlBuilder = new olap.XmlElementBuilder();
            var actualNamespaceUri = includeNamespace ? olap.Namespace.Analysis : "";
            return xmlBuilder.createNew(name, actualNamespaceUri);
        };
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaExecuteProp = {
        AxisFormat: "AxisFormat",
        BeginRange: "BeginRange",
        Catalog: "Catalog",
        CatalogLocation: "CatalogLocation",
        ClientProcessID: "ClientProcessID",
        CommitTimeout: "CommitTimeout",
        Content: "Content",
        Cube: "Cube",
        DataSourceInfo: "DataSourceInfo",
        Dialect: "Dialect",
        EffectiveRoles: "EffectiveRoles",
        EffectiveUserName: "EffectiveUserName",
        EndRange: "EndRange",
        ExecutionMode: "ExecutionMode",
        ForceCommitTimeout: "ForceCommitTimeout",
        Format: "Format",
        ImpactAnalysis: "ImpactAnalysis",
        LocaleIdentifier: "LocaleIdentifier",
        MaximumRows: "MaximumRows",
        NonEmptyThreshold: "NonEmptyThreshold",
        ProviderType: "ProviderType",
        RealTimeOlap: "RealTimeOlap",
        ReturnCellProperties: "ReturnCellProperties",
        Roles: "Roles",
        SafetyOptions: "SafetyOptions",
        SecuredCellValue: "SecuredCellValue",
        ServerName: "ServerName",
        ShowHiddenCubes: "ShowHiddenCubes",
        SQLQueryMode: "SQLQueryMode",
        SQLSupport: "SQLSupport",
        Timeout: "Timeout",
        TransactionDDL: "TransactionDDL",
        VisualMode: "VisualMode"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaFormat = {
        Tabular: "Tabular",
        Multidimensional: "Multidimensional"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaInstanceSelection = {
        None: 0,
        DropDown: 1,
        List: 2,
        FilteredList: 3,
        MandatoryFilter: 4
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaNameFormatter = function() {
        var self = this;
        self.format = function(name) {
            if (!name || typeof name !== "string") {
                throw new Error("A valid name to format is required.");
            }
            if (isAllUpperCaseWord(name)) {
                return name.toLowerCase();
            }
            name = formatMemberProperty(name);
            name = formatMember(name);
            name = formatSeparatedWords(name, "_");
            name = formatSeparatedWords(name, " ");
            return name.substr(0, 1).toLowerCase() + name.substr(1);
        };
        function formatMember(name) {
            if (name.indexOf(".")) {
                var elements = name.split(".");
                return cleanXmlaEncoding(elements[elements.length - 1]);
            }
            return name;
        }
        function isAllUpperCaseWord(name) {
            return name.match(/^[A-Z]*$/);
        }
        function formatMemberProperty(name) {
            for (var property in olap.MdxMemberProperty) {
                if (name.indexOf("_x005B_" + property + "_x005D_") !== -1) {
                    var elements = name.split(".");
                    return cleanXmlaEncoding(elements[elements.length - 2]);
                }
            }
            return name;
        }
        function formatSeparatedWords(name, separator) {
            if (name.indexOf(separator) !== -1) {
                var words = name.split(separator);
                for (var i = 0; i < words.length; i++) {
                    var word = words[i];
                    words[i] = word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase();
                }
                name = words.join("");
            }
            return name;
        }
        function cleanXmlaEncoding(name) {
            return name.replace("_x005B_", "").replace("_x005D_", "").replace(/_x0020_/g, " ");
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaRecordsetSchema = {
        DISCOVER_DATASOURCES: {
            DataSourceName: {
                name: "DataSourceName",
                type: "string",
                isArray: false,
                description: "Name that identifies the data source",
                canRestrict: true,
                alwaysPresent: true
            },
            DataSourceDescription: {
                name: "DataSourceDescription",
                type: "string",
                isArray: false,
                description: "Friendly description of the data source",
                canRestrict: false,
                alwaysPresent: false
            },
            URL: {
                name: "URL",
                type: "string",
                isArray: false,
                description: "Url to which requests should be submitted",
                canRestrict: true,
                alwaysPresent: false
            },
            DataSourceInfo: {
                name: "DataSourceInfo",
                type: "string",
                isArray: false,
                description: "Connection information that must be included with requests",
                canRestrict: false,
                alwaysPresent: false
            },
            ProviderName: {
                name: "ProviderName",
                type: "string",
                isArray: false,
                description: "Name of the XML/A implementation provider",
                canRestrict: true,
                alwaysPresent: false
            },
            ProviderType: {
                name: "ProviderType",
                type: "string",
                isArray: true,
                description: "The type of result sets supported by the provider",
                canRestrict: true,
                alwaysPresent: true,
                possibleValues: [ "TDP", "MDP", "DMP" ]
            },
            AuthenticationMode: {
                name: "AuthenticationMode",
                type: "string",
                isArray: false,
                description: "The type of result sets supported by the provider",
                canRestrict: true,
                alwaysPresent: true,
                possibleValues: [ "Unauthenticated", "Authenticated", "Integrated" ]
            }
        },
        MDSCHEMA_MEASUREGROUPS: {
            CATALOG_NAME: {
                name: "CATALOG_NAME",
                type: "string",
                isArray: false,
                description: "Name of the catalog to which the measure group belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: "SCHEMA_NAME",
                type: "string",
                isArray: false,
                description: "Name of the schema to which the measure group belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: "CUBE_NAME",
                type: "string",
                isArray: false,
                description: "Name of the cube to which the measure group belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            MEASUREGROUP_NAME: {
                name: "MEASUREGROUP_NAME",
                type: "string",
                isArray: false,
                description: "The name of the measure group",
                canRestrict: true,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: "DESCRIPTION",
                type: "string",
                isArray: false,
                description: "A friendly description of the measure group",
                canRestrict: false,
                alwaysPresent: false
            },
            IS_WRITE_ENABLED: {
                name: "MEASURE_IS_VISIBLE",
                type: "boolean",
                isArray: false,
                description: "Indicates whether the measure group is write enabled",
                canRestrict: false,
                alwaysPresent: true
            },
            MEASUREGROUP_CAPTION: {
                name: "MEASUREGROUP_CAPTION",
                type: "string",
                isArray: false,
                description: "A label or caption associated with the measure group",
                canRestrict: false,
                alwaysPresent: false
            }
        },
        MDSCHEMA_MEASURES: {
            CATALOG_NAME: {
                name: "CATALOG_NAME",
                type: "string",
                isArray: false,
                description: "Name of the catalog to which the measure belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: "SCHEMA_NAME",
                type: "string",
                isArray: false,
                description: "Name of the schema to which the measure belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: "CUBE_NAME",
                type: "string",
                isArray: false,
                description: "Name of the cube to which the measure belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            MEASURE_NAME: {
                name: "MEASURE_NAME",
                type: "string",
                isArray: false,
                description: "The name of the measure",
                canRestrict: true,
                alwaysPresent: true
            },
            MEASURE_UNIQUE_NAME: {
                name: "MEASURE_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the measure",
                canRestrict: true,
                alwaysPresent: false
            },
            MEASURE_CAPTION: {
                name: "MEASURE_CAPTION",
                type: "string",
                isArray: false,
                description: "A label or caption associated with the measure",
                canRestrict: false,
                alwaysPresent: false
            },
            MEASURE_AGGREGATOR: {
                name: "MEASURE_AGGREGATOR",
                type: "number",
                isArray: false,
                description: "A member of olap.XmlaAggregator enumeration indicating the aggregation" + " function used to derive the measure ",
                canRestrict: false,
                alwaysPresent: true
            },
            DATA_TYPE: {
                name: "DATA_TYPE",
                type: "number",
                isArray: false,
                description: "The data type of the measure",
                canRestrict: false,
                alwaysPresent: true
            },
            NUMERIC_PRECISION: {
                name: "NUMERIC_PRECISION",
                type: "number",
                isArray: false,
                description: "The maximum precision of the property if DATA_TYPE is exact numeric",
                canRestrict: false,
                alwaysPresent: false
            },
            NUMERIC_SCALE: {
                name: "NUMERIC_SCALE",
                type: "number",
                isArray: false,
                description: "The number of digits to the right of the decimal place of the property if DATA_TYPE is exact numeric",
                canRestrict: false,
                alwaysPresent: false
            },
            DESCRIPTION: {
                name: "DESCRIPTION",
                type: "string",
                isArray: false,
                description: "A friendly description of the measure",
                canRestrict: false,
                alwaysPresent: false
            },
            EXPRESSION: {
                name: "EXPRESSION",
                type: "string",
                isArray: false,
                description: "An expression for the measure",
                canRestrict: false,
                alwaysPresent: true
            },
            MEASURE_IS_VISIBLE: {
                name: "MEASURE_IS_VISIBLE",
                type: "boolean",
                isArray: false,
                description: "Always returns true as measures that are not visible are not included in the rowset",
                canRestrict: false,
                alwaysPresent: true
            },
            LEVELS_LIST: {
                name: "LEVELS_LIST",
                type: "string",
                isArray: false,
                description: "Always null",
                canRestrict: false,
                alwaysPresent: true
            },
            MEASURE_NAME_SQL_COLUMN_NAME: {
                name: "MEASURE_NAME_SQL_COLUMN_NAME",
                type: "string",
                isArray: false,
                description: "The name of the column in the SQL query that corresponds to the measure name",
                canRestrict: false,
                alwaysPresent: true
            },
            MEASURE_UNQUALIFIED_CAPTION: {
                name: "MEASURE_UNQUALIFIED_CAPTION",
                type: "string",
                isArray: false,
                description: "The name of the measure, not qualified with the measure group name",
                canRestrict: false,
                alwaysPresent: false
            },
            MEASUREGROUP_NAME: {
                name: "MEASUREGROUP_NAME",
                type: "string",
                isArray: false,
                description: "The name of the measure group to which the measure belongs",
                canRestrict: true,
                alwaysPresent: true
            },
            MEASURE_DISPLAY_FOLDER: {
                name: "MEASURE_DISPLAY_FOLDER",
                type: "string",
                isArray: false,
                description: "The path to be used for display the meaasure in the user interface",
                canRestrict: false,
                alwaysPresent: true
            },
            DEFAULT_FORMAT_STRING: {
                name: "DEFAULT_FORMAT_STRING",
                type: "string",
                isArray: false,
                description: "The default format string for the measure",
                canRestrict: false,
                alwaysPresent: true
            }
        },
        MDSCHEMA_DIMENSIONS: {
            CATALOG_NAME: {
                name: "CATALOG_NAME",
                type: "string",
                isArray: false,
                description: "Name of the catalog to which the dimension belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: "SCHEMA_NAME",
                type: "string",
                isArray: false,
                description: "Name of the schema to which the dimension belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: "CUBE_NAME",
                type: "string",
                isArray: false,
                description: "Name of the cube to which the dimension belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_NAME: {
                name: "DIMENSION_NAME",
                type: "string",
                isArray: false,
                description: "The name of the dimension",
                canRestrict: true,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_NAME: {
                name: "DIMENSION_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the dimension",
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_CAPTION: {
                name: "DIMENSION_CAPTION",
                type: "string",
                isArray: false,
                description: "A label or caption associated with the dimension",
                canRestrict: false,
                alwaysPresent: false
            },
            DIMENSION_ORDINAL: {
                name: "DIMENSION_ORDINAL",
                type: "number",
                isArray: false,
                description: "The position of the dimension in the cube",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_TYPE: {
                name: "DIMENSION_TYPE",
                type: "number",
                isArray: false,
                description: "A member of olap.XmlaDimensionType enumeration indicating the type of the dimension",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_CARDINALITY: {
                name: "DIMENSION_CARDINALITY",
                type: "number",
                isArray: false,
                description: "The number of members in the key attribute",
                canRestrict: false,
                alwaysPresent: false
            },
            DEFAULT_HIERARCHY: {
                name: "DEFAULT_HIERARCHY",
                type: "string",
                isArray: false,
                description: "A hierarchy from the dimension, Preserved for backwards compatibility",
                canRestrict: false,
                alwaysPresent: false
            },
            DESCRIPTION: {
                name: "DESCRIPTION",
                type: "string",
                isArray: false,
                description: "A friendly description of the dimension",
                canRestrict: false,
                alwaysPresent: false
            },
            IS_VIRTUAL: {
                name: "IS_VIRTUAL",
                type: "boolean",
                isArray: false,
                description: "Always returns false",
                canRestrict: false,
                alwaysPresent: true
            },
            IS_READWRITE: {
                name: "IS_READWRITE",
                type: "boolean",
                isArray: false,
                description: "Indicates whether the dimension is write enabled",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_SETTINGS: {
                name: "DIMENSION_UNIQUE_SETTINGS",
                type: "number",
                isArray: false,
                description: "A bitmap that specifies which columns contain unique values if the dimension contains" + "only members with unique names.",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_MASTER_UNIQUE_NAME: {
                name: "DIMENSION_UNIQUE_SETTINGS",
                type: "string",
                isArray: false,
                description: "Always null",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_IS_VISIBLE: {
                name: "DIMENSION_IS_VISIBLE",
                type: "boolean",
                isArray: false,
                description: "Always true. A dimension is not visible unless one or more hierarchies in the" + " dimension are visible.  The dimension is not included in the rowset if it is not visible",
                canRestrict: false,
                alwaysPresent: true
            }
        },
        MDSCHEMA_MEMBERS: {
            CATALOG_NAME: {
                name: "CATALOG_NAME",
                type: "string",
                isArray: false,
                description: "Name of the catalog to which the member belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: "SCHEMA_NAME",
                type: "string",
                isArray: false,
                description: "Name of the schema to which the member belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: "CUBE_NAME",
                type: "string",
                isArray: false,
                description: "Name of the cube to which the memeber belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_UNIQUE_NAME: {
                name: "DIMENSION_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the dimension the member belongs to",
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_UNIQUE_NAME: {
                name: "HIERARCHY_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the hierarchy the member belongs to",
                canRestrict: true,
                alwaysPresent: false
            },
            LEVEL_UNIQUE_NAME: {
                name: "LEVEL_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the level the member belongs to",
                canRestrict: true,
                alwaysPresent: false
            },
            LEVEL_NUMBER: {
                name: "LEVEL_NUMBER",
                type: "number",
                isArray: false,
                description: "The distance of the member from the root of the hierarchy",
                canRestrict: true,
                alwaysPresent: false
            },
            MEMBER_ORDINAL: {
                name: "MEMBER_ORDINAL",
                type: "number",
                isArray: false,
                description: "Deprecated always returns 0",
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_NAME: {
                name: "MEMBER_NAME",
                type: "string",
                isArray: false,
                description: "The name of the member",
                canRestrict: true,
                alwaysPresent: true
            },
            MEMBER_UNIQUE_NAME: {
                name: "MEMBER_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the member",
                canRestrict: true,
                alwaysPresent: true
            },
            MEMBER_TYPE: {
                name: "MEMBER_TYPE",
                type: "number",
                isArray: false,
                description: "A member of the olap.XmlaDimensionMemberType enum indicating the type " + "of the member",
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_GUID: {
                name: "MEMBER_GUID",
                type: "string",
                isArray: false,
                description: "The GUID of the member, null of no guid exists",
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_CAPTION: {
                name: "MEMBER_CAPTION",
                type: "string",
                isArray: false,
                description: "A label or caption associated with the member",
                canRestrict: false,
                alwaysPresent: true
            },
            CHILDREN_CARDINALITY: {
                name: "CHILDREN_CARDINALITY",
                type: "number",
                isArray: false,
                description: "The number of children the member has",
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_LEVEL: {
                name: "PARENT_LEVEL",
                type: "number",
                isArray: false,
                description: "The distance of the members parent from the root level of the hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_UNIQUE_NAME: {
                name: "PARENT_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the members parent",
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_COUNT: {
                name: "PARENT_COUNT",
                type: "number",
                isArray: false,
                description: "The number of parents this member has",
                canRestrict: false,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: "DESCRIPTION",
                type: "string",
                isArray: false,
                description: "Always returns null, exists to maintain backward compatibility",
                canRestrict: false,
                alwaysPresent: true
            },
            EXPRESSION: {
                name: "EXPRESSION",
                type: "string",
                isArray: false,
                description: "The expression for calculations, if the member type is Formula",
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_KEY: {
                name: "MEMBER_KEY",
                type: "string",
                isArray: false,
                description: "The value of the members key column, returns null if the member has a " + "composite key",
                canRestrict: false,
                alwaysPresent: true
            },
            IS_PLACEHOLDERMEMBER: {
                name: "IS_PLACEHOLDERMEMBER",
                type: "boolean",
                isArray: false,
                description: "Indic" + "ates whether a member is a placeholder member for an empty position in" + " a dimension hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            IS_DATAMEMBER: {
                name: "IS_DATAMEMBER",
                type: "boolean",
                isArray: false,
                description: "Indicates whether the member is a data member",
                canRestrict: false,
                alwaysPresent: true
            },
            SCOPE: {
                name: "SCOPE",
                type: "number",
                isArray: false,
                description: "The scope of the member.  The member can be a session calculated member or a" + " global calculated member",
                canRestrict: false,
                alwaysPresent: true,
                possibleValues: [ 1, 2 ]
            }
        },
        MDSCHEMA_HIERARCHIES: {
            CATALOG_NAME: {
                name: "CATALOG_NAME",
                type: "string",
                isArray: false,
                description: "Name of the catalog to which the hierarchy belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: "SCHEMA_NAME",
                type: "string",
                isArray: false,
                description: "Name of the schema to which the hierarchy belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: "CUBE_NAME",
                type: "string",
                isArray: false,
                description: "Name of the cube to which the hierarchy belongs",
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_UNIQUE_NAME: {
                name: "DIMENSION_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the dimension the hierarchy belongs to",
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_NAME: {
                name: "HIERARCHY_NAME",
                type: "string",
                isArray: false,
                description: "The name of the hierarchy",
                canRestrict: true,
                alwaysPresent: true
            },
            HIERARCHY_UNIQUE_NAME: {
                name: "HIERARCHY_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "The unique name of the hierarchy the hierarchy belongs to",
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_GUID: {
                name: "HIERARCHY_GUID",
                type: "string",
                isArray: false,
                description: "Not supported",
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_CAPTION: {
                name: "HIERARCHY_CAPTION",
                type: "string",
                isArray: false,
                description: "A label or caption associated with the hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_TYPE: {
                name: "DIMENSION_TYPE",
                type: "number",
                isArray: false,
                description: "A member of the olap.XmlaDimensionType enum indicating the type " + "of the dimension",
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_CARDINALITY: {
                name: "HIERARCHY_CARDINALITY",
                type: "number",
                isArray: false,
                description: "The number of members in the hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            DEFAULT_MEMBER: {
                name: "DEFAULT_MEMBER",
                type: "string",
                isArray: false,
                description: "The unique name of default member for this hierarchy.",
                canRestrict: false,
                alwaysPresent: true
            },
            ALL_MEMBER: {
                name: "ALL_MEMBER",
                type: "string",
                isArray: false,
                description: "The member at the highest level of the rollup",
                canRestrict: false,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: "DESCRIPTION",
                type: "string",
                isArray: false,
                description: "A friendly desicription of the hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            STRUCTURE: {
                name: "STRUCTURE",
                type: "number",
                isArray: false,
                description: "A member of the olap.XmlaStructure enum indicating the structure" + " of the hierarchy",
                canRestrict: false,
                alwaysPresent: true
            },
            IS_VIRTUAL: {
                name: "IS_VIRTUAL",
                type: "boolean",
                isArray: false,
                description: "Always returns false",
                canRestrict: false,
                alwaysPresent: true
            },
            IS_READWRITE: {
                name: "IS_READWRITE",
                type: "boolean",
                isArray: false,
                description: "Indicates whether the write back is enabled on the dimension column",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_SETTINGS: {
                name: "DIMENSION_UNIQUE_SETTINGS",
                type: "string",
                isArray: false,
                description: "Always returns 1 indicating unique",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_MASTER_UNIQUE_NAME: {
                name: "DIMENSION_MASTER_UNIQUE_NAME",
                type: "string",
                isArray: false,
                description: "Always returns null",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_IS_VISIBLE: {
                name: "DIMENSION_IS_VISIBLE",
                type: "boolean",
                isArray: false,
                description: "Always returns true.  If the dimension is not visible it will not" + " appear in the rowset",
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_ORDINAL: {
                name: "HIERARCHY_ORDINAL",
                type: "number",
                isArray: false,
                description: "The ordinal number of the hierarchy across all hierarchies in the cube",
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_IS_SHARED: {
                name: "DIMENSION_IS_SHARED",
                type: "boolean",
                isArray: false,
                description: "Always returns true",
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_IS_VISIBLE: {
                name: "HIERARCHY_IS_VISIBLE",
                type: "boolean",
                isArray: false,
                description: "Indicates wither the hierarhcy is visible",
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_ORIGIN: {
                name: "HIERARCHY_ORIGIN",
                type: "number",
                isArray: false,
                description: "A bit mask that determines the source of the hierarchy",
                canRestrict: true,
                alwaysPresent: true
            },
            HIERARCHY_DISPLAY_FOLDER: {
                name: "HIERARCHY_DISPLAY_FOLDER",
                type: "string",
                isArray: false,
                description: "The path to be used when displaying the hierarchy in the user interface",
                canRestrict: false,
                alwaysPresent: true
            },
            INSTANCE_SELECTION: {
                name: "INSTANCE_SELECTION",
                type: "number",
                isArray: false,
                description: "A member of the olap.XmlaInstanceSelection enum indicating how a hierarchy " + "should be presented for selection in the user interface",
                canRestrict: false,
                alwaysPresent: true
            },
            GROUPING_BEHAVIOR: {
                name: "GROUPING_BEHAVIOR",
                type: "number",
                isArray: false,
                description: "Indicates whether grouping is encouraged (1) or discouraged (2)",
                canRestrict: false,
                alwaysPresent: true,
                possibleValues: [ 1, 2 ]
            },
            STRUCTURE_TYPE: {
                name: "STRUCTURE_TYPE",
                type: "string",
                isArray: false,
                description: "A member of the olap.XmlaStructureType enum indicating the type of hierarchy",
                canRestrict: false,
                alwaysPresent: true
            }
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaRequestType = {
        DISCOVER_CALC_DEPENDENCY: "DISCOVER_CALC_DEPENDENCY",
        DISCOVER_CONNECTIONS: "DISCOVER_CONNECTIONS",
        DISCOVER_COMMAND_OBJECTS: "DISCOVER_COMMAND_OBJECTS",
        DISCOVER_COMMANDS: "DISCOVER_COMMANDS",
        DISCOVER_CSDL_METADATA: "DISCOVER_CSDL_METADATA",
        DISCOVER_DATASOURCES: "DISCOVER_DATASOURCES",
        DISCOVER_DB_CONNECTIONS: "DISCOVER_DB_CONNECTIONS",
        DISCOVER_DIMENSION_STAT: "DISCOVER_DIMENSION_STAT",
        DISCOVER_ENUMERATORS: "DISCOVER_ENUMERATORS",
        DISCOVER_JOBS: "DISCOVER_JOBS",
        DISCOVER_KEYWORDS: "DISCOVER_KEYWORDS",
        DISCOVER_LITERALS: "DISCOVER_LITERALS",
        DISCOVER_LOCATIONS: "DISCOVER_LOCATIONS",
        DISCOVER_LOCKS: "DISCOVER_LOCKS",
        DISCOVER_MEMORYGRANT: "DISCOVER_MEMORYGRANT",
        DISCOVER_MEMORYUSAGE: "DISCOVER_MEMORYUSAGE",
        DISCOVER_OBJECT_ACTIVITY: "DISCOVER_OBJECT_ACTIVITY",
        DISCOVER_OBJECT_MEMORY_USAGE: "DISCOVER_OBJECT_MEMORY_USAGE",
        DISCOVER_PARTITION_DIMENSION_STAT: "DISCOVER_PARTITION_DIMENSION_STAT",
        DISCOVER_PARTITION_STAT: "DISCOVER_PARTITION_STAT",
        DISCOVER_PERFORMANCE_COUNTERS: "DISCOVER_PERFORMANCE_COUNTERS",
        DISCOVER_PROPERTIES: "DISCOVER_PROPERTIES",
        DISCOVER_SCHEMA_ROWSETS: "DISCOVER_SCHEMA_ROWSETS",
        DISCOVER_SESSIONS: "DISCOVER_SESSIONS",
        DISCOVER_STORAGE_TABLE_COLUMN_SEGMENTS: "DISCOVER_STORAGE_TABLE_COLUMN_SEGMENTS",
        DISCOVER_STORAGE_TABLE_COLUMNS: "DISCOVER_STORAGE_TABLE_COLUMNS",
        DISCOVER_STORAGE_TABLES: "DISCOVER_STORAGE_TABLES",
        DISCOVER_TRACE_COLUMNS: "DISCOVER_TRACE_COLUMNS",
        DISCOVER_TRACE_DEFINITION_PROVIDER_INFO: "DISCOVER_TRACE_DEFINITION_PROVIDER_INFO",
        DISCOVER_TRACE_EVENT_CATEGORIES: "DISCOVER_TRACE_EVENT_CATEGORIES",
        DISCOVER_TRACES: "DISCOVER_TRACES",
        DISCOVER_TRANSACTIONS: "DISCOVER_TRANSACTIONS",
        DISCOVER_XML_METADATA: "DISCOVER_XML_METADATA",
        DBSCHEMA_CATALOGS: "DBSCHEMA_CATALOGS",
        MDSCHEMA_CUBES: "MDSCHEMA_CUBES",
        MDSCHEMA_MEASUREGROUPS: "MDSCHEMA_MEASUREGROUPS",
        MDSCHEMA_MEASURES: "MDSCHEMA_MEASURES",
        MDSCHEMA_DIMENSIONS: "MDSCHEMA_DIMENSIONS",
        MDSCHEMA_MEMBERS: "MDSCHEMA_MEMBERS",
        MDSCHEMA_HIERARCHIES: "MDSCHEMA_HIERARCHIES"
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaRowsetTransformer = function() {
        var self = this;
        var xmlParser = new olap.XmlParser();
        var xmlaNameFormatter = new olap.XmlaNameFormatter();
        self.transform = function(message) {
            var result = [];
            var xmlDoc = xmlParser.parse(message);
            var rowElements = xmlDoc.getElementsByTagNameNS(olap.Namespace.Rowset, "row");
            for (var i = 0; i < rowElements.length; i++) {
                var rowElement = rowElements[i];
                var rowObject = {};
                for (var j = 0; j < rowElement.childNodes.length; j++) {
                    var child = rowElement.childNodes[j];
                    var fieldName = xmlaNameFormatter.format(child.nodeName);
                    if (rowElement.getElementsByTagNameNS(olap.Namespace.Rowset, child.nodeName).length === 1) {
                        rowObject[fieldName] = formatValue(child);
                    } else {
                        if (!rowObject[fieldName]) {
                            rowObject[fieldName] = [];
                        }
                        rowObject[fieldName].push(formatValue(child));
                    }
                }
                result.push(rowObject);
            }
            return result;
        };
        function formatValue(node) {
            if (node.attributes.length) {
                return formatValueAsType(node);
            }
            return node.textContent;
        }
        function formatValueAsType(node) {
            for (var i = 0; i < node.attributes.length; i++) {
                var attribute = node.attributes[i];
                if (attribute.name === "xsi:type") {
                    if (attribute.value === "xsd:double") {
                        return Math.round(parseFloat(node.textContent) * 100) / 100;
                    }
                    if (attribute.value === "xsd:integer") {
                        return parseInt(node.textContent);
                    }
                }
            }
        }
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaService = function($http, $q, $timeout, config) {
        var self = this;
        var $config = {
            url: "",
            username: "",
            password: "",
            dataSourceName: "",
            catalogName: ""
        };
        var discoverSoapAction = "urn:schemas-microsoft-com:xml-analysis:Discover";
        var executeSoapAction = "urn:schemas-microsoft-com:xml-analysis:Execute";
        var rowsetTransformer = new olap.XmlaRowsetTransformer();
        var xmlParser = new olap.XmlParser();
        mergeProperties(config, $config);
        self.url = function(url) {
            if (url && typeof url === "string") {
                $config.url = url;
            }
            return $config.url;
        };
        self.username = function(username) {
            if (username && typeof username === "string") {
                $config.username = username;
            }
            return $config.username;
        };
        self.password = function(password) {
            if (password && typeof password === "string") {
                $config.password = password;
            }
            return $config.password;
        };
        self.dataSourceName = function(dataSourceName) {
            if (dataSourceName && typeof dataSourceName === "string") {
                $config.dataSourceName = dataSourceName;
            }
            return $config.dataSourceName;
        };
        self.catalogName = function(catalogName) {
            if (catalogName && typeof catalogName === "string") {
                $config.catalogName = catalogName;
            }
            return $config.catalogName;
        };
        self.discoverDataSources = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build());
        };
        self.discoverCatalogs = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DBSCHEMA_CATALOGS).build());
        };
        self.discoverCubes = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_CUBES).build());
        };
        self.discoverMeasureGroups = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEASUREGROUPS);
            if (config && config.cubeName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEASUREGROUPS.CUBE_NAME.name] = config.cubeName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.discoverMeasures = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEASURES);
            if (config && config.measuregroupName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEASURES.MEASUREGROUP_NAME.name] = config.measuregroupName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.discoverDimensions = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_DIMENSIONS);
            if (config && config.cubeName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_DIMENSIONS.CUBE_NAME.name] = config.cubeName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.discoverDimensionMembers = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEMBERS);
            if (config && config.dimensionUniqueName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.DIMENSION_UNIQUE_NAME.name] = config.dimensionUniqueName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.discoverHierarchies = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_HIERARCHIES);
            if (config && config.dimensionUniqueName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.DIMENSION_UNIQUE_NAME.name] = config.dimensionUniqueName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.discoverHierarchyMembers = function(config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEMBERS);
            if (config && config.hierarchyUniqueName) {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.HIERARCHY_UNIQUE_NAME.name] = config.hierarchyUniqueName;
                discoverMessageBuilder.restrict(map);
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };
        self.executeStatement = function(config) {
            throwIfNoMdx(config);
            var effectiveConfig = mergeConfig(config);
            var executeMessageBuilder = new olap.ExecuteMessageBuilder();
            executeMessageBuilder.catalog(effectiveConfig.catalogName);
            if (effectiveConfig.params) {
                executeMessageBuilder.parameters(effectiveConfig.params);
            }
            return submitRequest(effectiveConfig, executeSoapAction, executeMessageBuilder.statement(effectiveConfig.mdx).build());
        };
        function submitDiscoverRequest(config, message) {
            return submitRequest(config, discoverSoapAction, message);
        }
        function mergeConfig(config) {
            var result = {};
            for (var field in $config) {
                if ($config.hasOwnProperty(field) && typeof $config[field] === "string") {
                    result[field] = $config[field];
                }
            }
            if (config) {
                mergeProperties(config, result);
                for (var name in config) {
                    if (config.hasOwnProperty(name) && !result.hasOwnProperty(name)) {
                        result[name] = config[name];
                    }
                }
            }
            return result;
        }
        function throwIfNoMdx(config) {
            var msg = "No MDX statement has been specified to execute.";
            if (!config.mdx || typeof config.mdx !== "string") {
                throw new Error(msg);
            }
        }
        function throwIfNoUrl(config) {
            var msg = 'No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' + " a method or set it once during the Angular config cycle using the xmlaService provider.";
            if (!config.url) {
                throw new Error(msg);
            }
        }
        function transformResponse(response, soapAction) {
            return rowsetTransformer.transform(response.data);
        }
        function submitRequest(config, soapAction, message) {
            var effectiveConfig = mergeConfig(config);
            throwIfNoUrl(effectiveConfig);
            var deferred = $q.defer();
            $timeout(function() {
                var headers = {
                    "Content-Type": "text/xml",
                    SOAPAction: soapAction
                };
                var postConfig = {
                    headers: headers
                };
                addAuthorizationIfProvided(effectiveConfig, postConfig);
                $http.post(effectiveConfig.url, message, postConfig).then(function(response) {
                    if (!processSoapFault(deferred, response)) {
                        deferred.resolve(transformResponse(response, soapAction));
                    }
                }, function(response) {
                    deferred.reject(response);
                });
            });
            return deferred.promise;
        }
        function processSoapFault(deferred, response) {
            var xmlDoc = xmlParser.parse(response.data);
            var faults = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, "Fault");
            if (!faults.length) {
                return false;
            }
            var fault = faults[0];
            var faultMessage = {
                faultCode: fault.getElementsByTagName("faultcode")[0].textContent,
                faultString: fault.getElementsByTagName("faultstring")[0].textContent,
                detail: []
            };
            var errors = fault.getElementsByTagName("Error");
            console.log(errors.length);
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                faultMessage.detail.push({
                    errorCode: error.getAttribute("ErrorCode"),
                    description: error.getAttribute("Description"),
                    source: error.getAttribute("Source"),
                    helpFile: error.getAttribute("HelpFile")
                });
            }
            deferred.reject(faultMessage);
            return true;
        }
        function addAuthorizationIfProvided(config, postConfig) {
            if (config.username) {
                var encoder = new olap.Base64Encoder();
                postConfig.headers["Authorization"] = "Basic " + encoder.encode(config.username + ":" + config.password);
                postConfig.withCredentials = true;
            }
        }
    };
    olap.XmlaServiceProvider = function() {
        var self = this;
        var $config = {
            url: "",
            username: "",
            password: "",
            dataSourceName: "",
            catalogName: ""
        };
        self.config = function(config) {
            if (!config || typeof config !== "object") {
                throw new Error("A valid object is required to configure the service with config method.");
            }
            mergeProperties(config, $config);
        };
        self.url = function(url) {
            if (url && typeof url === "string") {
                $config.url = url;
            }
            return $config.url;
        };
        self.username = function(username) {
            if (username && typeof username === "string") {
                $config.username = username;
            }
            return $config.username;
        };
        self.password = function(password) {
            if (password && typeof password === "string") {
                $config.password = password;
            }
            return $config.password;
        };
        self.dataSourceName = function(dataSourceName) {
            if (dataSourceName && typeof dataSourceName === "string") {
                $config.dataSourceName = dataSourceName;
            }
            return $config.dataSourceName;
        };
        self.catalogName = function(catalogName) {
            if (catalogName && typeof catalogName === "string") {
                $config.catalogName = catalogName;
            }
            return $config.catalogName;
        };
        self.$get = [ "$http", "$q", "$timeout", function($http, $q, $timeout) {
            return new olap.XmlaService($http, $q, $timeout, $config);
        } ];
    };
    function mergeProperties(source, target) {
        for (var field in target) {
            if (target.hasOwnProperty(field) && source.hasOwnProperty(field) && typeof source[field] === "string") {
                target[field] = source[field];
            }
        }
    }
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaStructure = {
        FullyBalanced: 0,
        RaggedBalanced: 1,
        Unbalanced: 2,
        Network: 3
    };
})(window);

(function(window) {
    "use strict";
    var olap = window.olap = window.olap || {};
    olap.XmlaStructureType = {
        Unknown: "Unknown",
        Unnatural: "Unnatural",
        Natural: "Natural"
    };
})(window);

(function(window, angular) {
    "use strict";
    var olap = window.olap = window.olap || {};
    if (typeof angular !== "undefined") {
        angular.module("angular-olap", []).provider("xmlaService", [ olap.XmlaServiceProvider ]).service("mdxService", [ olap.MdxService ]);
    }
})(window, angular);
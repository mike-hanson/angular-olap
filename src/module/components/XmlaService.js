(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaService = function ($http, $q, $timeout, config) {
        var self = this;
        var $config = {
            url:            '',
            username:       '',
            password:       '',
            dataSourceName: '',
            catalogName:    ''
        };

        var discoverSoapAction = 'urn:schemas-microsoft-com:xml-analysis:Discover';
        var executeSoapAction = 'urn:schemas-microsoft-com:xml-analysis:Execute';
        var rowsetTransformer = new olap.XmlaRowsetTransformer();
        var xmlParser = new olap.XmlParser();

        mergeProperties(config, $config);

        self.url = function (url) {
            if(url && typeof url === 'string'){
                $config.url = url;
            }
            return $config.url;
        };

        self.username = function (username) {
            if(username && typeof username === 'string'){
                $config.username = username;
            }
            return $config.username;
        };

        self.password = function (password) {
            if(password && typeof password === 'string'){
                $config.password = password;
            }
            return $config.password;
        };

        self.dataSourceName = function(dataSourceName) {
            if(dataSourceName && typeof dataSourceName === 'string'){
                $config.dataSourceName = dataSourceName;
            }
            return $config.dataSourceName;
        };

        self.catalogName = function (catalogName) {
            if(catalogName && typeof catalogName === 'string'){
                $config.catalogName = catalogName;
            }
            return $config.catalogName;
        };

        self.discoverDataSources = function (config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build());
        };

        self.discoverCatalogs = function (config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DBSCHEMA_CATALOGS).build());
        };

        self.discoverCubes = function (config) {
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_CUBES).build());
        };

        self.discoverMeasureGroups = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEASUREGROUPS);
            if(config && config.cubeName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEASUREGROUPS.CUBE_NAME.name] = config.cubeName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.discoverMeasures = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEASURES);
            if(config && config.measuregroupName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEASURES.MEASUREGROUP_NAME.name] = config.measuregroupName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.discoverDimensions = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_DIMENSIONS);
            if(config && config.cubeName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_DIMENSIONS.CUBE_NAME.name] = config.cubeName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.discoverDimensionMembers = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEMBERS);
            if(config && config.dimensionUniqueName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.DIMENSION_UNIQUE_NAME.name] = config.dimensionUniqueName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.discoverHierarchies = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_HIERARCHIES);
            if(config && config.dimensionUniqueName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.DIMENSION_UNIQUE_NAME.name] = config.dimensionUniqueName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.discoverHierarchyMembers = function(config){
            var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
            discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_MEMBERS);
            if(config && config.hierarchyUniqueName)
            {
                var map = {};
                map[olap.XmlaRecordsetSchema.MDSCHEMA_MEMBERS.HIERARCHY_UNIQUE_NAME.name] = config.hierarchyUniqueName;
                discoverMessageBuilder.restrict(map)
            }
            return submitDiscoverRequest(config, discoverMessageBuilder.build());
        };

        self.executeStatement = function(config){
            throwIfNoMdx(config);;
            var effectiveConfig = mergeConfig(config);
            var executeMessageBuilder = new olap.ExecuteMessageBuilder();
            executeMessageBuilder.catalog(effectiveConfig.catalogName);
            if(effectiveConfig.params)
            {
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
                if ($config.hasOwnProperty(field) && typeof $config[field] === 'string') {
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
            var msg = 'No MDX statement has been specified to execute.';
            if(!config.mdx || typeof config.mdx !== 'string')
            {
                throw new Error(msg);
            }
        }

        function throwIfNoUrl(config) {
            var msg = 'No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                ' a method or set it once during the Angular config cycle using the xmlaService provider.';
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
            $timeout(function () {
                var headers = {
                    "Content-Type": 'text/xml',
                    SOAPAction:     soapAction
                };
                var postConfig = {
                    headers: headers
                };
                addAuthorizationIfProvided(effectiveConfig, postConfig);
                $http.post(effectiveConfig.url, message, postConfig)
                    .then(function (response) {
                        if(!processSoapFault(deferred, response)){
                            deferred.resolve(transformResponse(response, soapAction));
                        }
                    }, function (response) {
                        deferred.reject(response);
                    });
            });
            return deferred.promise;
        }

        function processSoapFault(deferred, response) {
            var xmlDoc = xmlParser.parse(response.data);
            var faults = xmlDoc.getElementsByTagNameNS(olap.Namespace.SoapEnvelope, 'Fault');
            if(!faults.length){
                return false;
            }
            var fault = faults[0];
            var faultMessage = {
                faultCode: fault.getElementsByTagName('faultcode')[0].textContent,
                faultString: fault.getElementsByTagName('faultstring')[0].textContent,
                detail: []
            };

            var errors = fault.getElementsByTagName('Error');
            console.log(errors.length)
            for (var i = 0; i < errors.length; i++) {
                var error = errors[i];
                faultMessage.detail.push({
                    errorCode: error.getAttribute('ErrorCode'),
                    description: error.getAttribute('Description'),
                    source: error.getAttribute('Source'),
                    helpFile: error.getAttribute('HelpFile')
                });
            };

            deferred.reject(faultMessage);
            return true;
        }

        function addAuthorizationIfProvided(config, postConfig) {
            if (config.username) {
                var encoder = new olap.Base64Encoder();
                postConfig.headers['Authorization'] = 'Basic ' + encoder.encode(config.username + ':' + config.password);
                postConfig.withCredentials = true;
            }
        }
    };

    olap.XmlaServiceProvider = function () {
        var self = this;
        var $config = {
            url:            '',
            username:       '',
            password:       '',
            dataSourceName: '',
            catalogName:    ''
        };

        self.config = function (config) {
            if (!config || typeof config !== 'object') {
                throw new Error('A valid object is required to configure the service with config method.');
            }

            mergeProperties(config, $config);
        };

        self.url = function (url) {
            if (url && typeof url === 'string') {
                $config.url = url;
            }

            return $config.url;
        };

        self.username = function (username) {
            if (username && typeof username === 'string') {
                $config.username = username;
            }

            return $config.username;
        };

        self.password = function (password) {
            if (password && typeof password === 'string') {
                $config.password = password;
            }

            return $config.password;
        };

        self.dataSourceName = function (dataSourceName) {
            if (dataSourceName && typeof dataSourceName === 'string') {
                $config.dataSourceName = dataSourceName;
            }

            return $config.dataSourceName;
        };

        self.catalogName = function (catalogName) {
            if (catalogName && typeof catalogName === 'string') {
                $config.catalogName = catalogName;
            }

            return $config.catalogName;
        };

        self.$get = [
            '$http',
            '$q',
            '$timeout',
            function ($http, $q, $timeout) {
                return new olap.XmlaService($http, $q, $timeout, $config);
            }
        ];
    };

    function mergeProperties(source, target) {
        for (var field in target) {
            if (target.hasOwnProperty(field) && source.hasOwnProperty(field) && typeof source[field] === 'string') {
                target[field] = source[field];
            }
        }
    }
})(window);
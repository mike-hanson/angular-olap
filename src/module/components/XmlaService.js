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
        var discoverMessageBuilder = new olap.DiscoverMessageBuilder();
        var rowsetTransformer = new olap.XmlaRowsetTransformer();

        mergeProperties(config, $config);

        self.url = function () {
            return $config.url;
        };

        self.username = function () {
            return $config.username;
        };

        self.password = function () {
            return $config.password;
        };

        self.dataSourceName = function () {
            return $config.dataSourceName;
        };

        self.catalogName = function () {
            return $config.catalogName;
        };

        self.discoverDataSources = function (config) {
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build());
        };

        self.discoverCatalogs = function (config) {
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.DBSCHEMA_CATALOGS).build());
        };

        self.discoverCubes = function (config) {
            return submitDiscoverRequest(config, discoverMessageBuilder.requestType(olap.XmlaRequestType.MDSCHEMA_CUBES).build());
        };

        function submitDiscoverRequest(config, message) {
            var effectiveConfig = mergeConfig(config);
            throwIfNoUrl(effectiveConfig);
            return submitRequest(effectiveConfig, discoverSoapAction, message);
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
            }
            return result;
        }

        function throwIfNoUrl(config) {
            var msg = 'No URL has been specified for the XML/A server. Either specify as the "config.url" field on calling' +
                ' a method or set it once during the Angular config cycle using the xmlaService provider.';
            if (!config.url) {
                throw new Error(msg);
            }
        }

        function submitRequest(config, soapAction, message) {
            var deferred = $q.defer();
            $timeout(function () {
                var headers = {
                    "Content-Type": 'text/xml',
                    SOAPAction:     soapAction
                };
                var postConfig = {
                    headers: headers
                };
                addAuthorizationIfProvided(config, postConfig);
                $http.post(config.url, message, postConfig)
                    .then(function (response) {
                        deferred.resolve(rowsetTransformer.transform(response.data));
                    }, function (response) {
                        deferred.reject(response);
                    });
            });
            return deferred.promise;
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
(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaService = function ($http, $q, config) {
        var self = this;
        var $config = {
            url:            '',
            username:       '',
            password:       '',
            dataSourceName: '',
            catalogName:    ''
        };

        var discoverSoapAction = 'urn:schemas-microsoft-com:xml-analysis:Discover';

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
            var effectiveConfig = mergeConfig(config);
            throwIfNoUrl(effectiveConfig);
            var builder = new olap.DiscoverMessageBuilder();
            return submitDiscoverRequest(effectiveConfig, builder.requestType(olap.XmlaRequestType.DISCOVER_DATASOURCES).build());
        };

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

        function submitDiscoverRequest(config, message) {
            return submitRequest(config, discoverSoapAction, message);
        }

        function submitRequest(config, discoverSoapAction, message) {
            var deferred = $q.defer();
            var headers = {
                ContentType: 'text/xml',
                SOAPAction:  discoverSoapAction
            };
            addAuthorizationIfProvided(config, headers);
            $http.post(config.url, message, {
                    headers: headers
                })
                .then(function (response) {
                    deferred.resolve(response.data);
                }, function (response) {
                    deferred.reject(response);
                });
            return deferred.promise;
        }

        function addAuthorizationIfProvided(config, headers) {
            if (config.username !== undefined) {
                var encoder = new olap.Base64Encoder();
                headers.Authorization = 'Basic ' + encoder.encode(config.username + ':' + config.password);
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
            function ($http, $q) {
                return new olap.XmlaService($http, $q, $config);
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
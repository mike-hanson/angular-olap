(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaRecordsetSchema = {
        DISCOVER_DATASOURCES: {
            DataSourceName:        {
                type:          'string',
                isArray:       false,
                description:   'Name that identifies the data source',
                canRestrict:   true,
                alwaysPresent: true
            },
            DataSourceDescription: {
                type:          'string',
                isArray:       false,
                description:   'Friendly description of the data source',
                canRestrict:   false,
                alwaysPresent: false
            },
            URL:                   {
                type:          'string',
                isArray:       false,
                description:   'Url to which requests should be submitted',
                canRestrict:   true,
                alwaysPresent: false
            },
            DataSourceInfo:                   {
                type:          'string',
                isArray:       false,
                description:   'Connection information that must be included with requests',
                canRestrict:   false,
                alwaysPresent: false
            },
            ProviderName:                   {
                type:          'string',
                isArray:       false,
                description:   'Name of the XML/A implementation provider',
                canRestrict:   true,
                alwaysPresent: false
            },
            ProviderType:                   {
                type:          'string',
                isArray:       true,
                description:   'The type of result sets supported by the provider',
                canRestrict:   true,
                alwaysPresent: true,
                possibleValues: ['TDP', 'MDP', 'DMP']
            },
            AuthenticationMode:                   {
                type:          'string',
                isArray:       false,
                description:   'The type of result sets supported by the provider',
                canRestrict:   true,
                alwaysPresent: true,
                possibleValues: ['Unauthenticated', 'Authenticated', 'Integrated']
            }
        }
    }
})(window);
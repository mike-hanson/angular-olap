(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaRecordsetSchema = {
        DISCOVER_DATASOURCES: {
            DataSourceName: {
                name: 'DataSourceName',
                type: 'string',
                isArray: false,
                description: 'Name that identifies the data source',
                canRestrict: true,
                alwaysPresent: true
            },
            DataSourceDescription: {
                name: 'DataSourceDescription',
                type: 'string',
                isArray: false,
                description: 'Friendly description of the data source',
                canRestrict: false,
                alwaysPresent: false
            },
            URL: {
                name: 'URL',
                type: 'string',
                isArray: false,
                description: 'Url to which requests should be submitted',
                canRestrict: true,
                alwaysPresent: false
            },
            DataSourceInfo: {
                name: 'DataSourceInfo',
                type: 'string',
                isArray: false,
                description: 'Connection information that must be included with requests',
                canRestrict: false,
                alwaysPresent: false
            },
            ProviderName: {
                name: 'ProviderName',
                type: 'string',
                isArray: false,
                description: 'Name of the XML/A implementation provider',
                canRestrict: true,
                alwaysPresent: false
            },
            ProviderType: {
                name: 'ProviderType',
                type: 'string',
                isArray: true,
                description: 'The type of result sets supported by the provider',
                canRestrict: true,
                alwaysPresent: true,
                possibleValues: ['TDP', 'MDP', 'DMP']
            },
            AuthenticationMode: {
                name: 'AuthenticationMode',
                type: 'string',
                isArray: false,
                description: 'The type of result sets supported by the provider',
                canRestrict: true,
                alwaysPresent: true,
                possibleValues: ['Unauthenticated', 'Authenticated', 'Integrated']
            }
        },
        MDSCHEMA_MEASUREGROUPS: {
            CATALOG_NAME: {
                name: 'CATALOG_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the catalog to which the measure group belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: 'SCHEMA_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the schema to which the measure group belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: 'CUBE_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the cube to which the measure group belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            MEASUREGROUP_NAME: {
                name: 'MEASUREGROUP_NAME',
                type: 'string',
                isArray: false,
                description: 'The name of the measure group',
                canRestrict: true,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: 'DESCRIPTION',
                type: 'string',
                isArray: false,
                description: 'A friendly description of the measure group',
                canRestrict: false,
                alwaysPresent: false
            },
            IS_WRITE_ENABLED: {
                name: 'MEASURE_IS_VISIBLE',
                type:          'boolean',
                isArray:       false,
                description:   'Indicates whether the measure group is write enabled',
                canRestrict:   false,
                alwaysPresent: true
            },
            MEASUREGROUP_CAPTION: {
                name: 'MEASUREGROUP_CAPTION',
                type: 'string',
                isArray: false,
                description: 'A label or caption associated with the measure group',
                canRestrict: false,
                alwaysPresent: false
            }
        },
        MDSCHEMA_MEASURES: {
            CATALOG_NAME: {
                name: 'CATALOG_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the catalog to which the measure belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: 'SCHEMA_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the schema to which the measure belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: 'CUBE_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the cube to which the measure belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            MEASURE_NAME: {
                name: 'MEASURE_NAME',
                type: 'string',
                isArray: false,
                description: 'The name of the measure',
                canRestrict: true,
                alwaysPresent: true
            },
            MEASURE_UNIQUE_NAME: {
                name: 'MEASURE_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the measure',
                canRestrict: true,
                alwaysPresent: false
            },
            MEASURE_CAPTION: {
                name: 'MEASURE_CAPTION',
                type: 'string',
                isArray: false,
                description: 'A label or caption associated with the measure',
                canRestrict: false,
                alwaysPresent: false
            },
            MEASURE_AGGREGATOR: {
                name: 'MEASURE_AGGREGATOR',
                type: 'number',
                isArray: false,
                description: 'A member of olap.XmlaAggregator enumeration indicating the aggregation' +
                ' function used to derive the measure ',
                canRestrict: false,
                alwaysPresent: true
            },
            DATA_TYPE: {
                name: 'DATA_TYPE',
                type: 'number',
                isArray: false,
                description: 'The data type of the measure',
                canRestrict: false,
                alwaysPresent: true
            },
            NUMERIC_PRECISION: {
                name: 'NUMERIC_PRECISION',
                type: 'number',
                isArray: false,
                description: 'The maximum precision of the property if DATA_TYPE is exact numeric',
                canRestrict: false,
                alwaysPresent: false
            },
            NUMERIC_SCALE: {
                name: 'NUMERIC_SCALE',
                type: 'number',
                isArray: false,
                description: 'The number of digits to the right of the decimal place of the property if DATA_TYPE is exact numeric',
                canRestrict: false,
                alwaysPresent: false
            },
            DESCRIPTION: {
                name: 'DESCRIPTION',
                type: 'string',
                isArray: false,
                description: 'A friendly description of the measure',
                canRestrict: false,
                alwaysPresent: false
            },
            EXPRESSION: {
                name: 'EXPRESSION',
                type: 'string',
                isArray: false,
                description: 'An expression for the measure',
                canRestrict: false,
                alwaysPresent: true
            },
            MEASURE_IS_VISIBLE: {
                name: 'MEASURE_IS_VISIBLE',
                type:          'boolean',
                isArray:       false,
                description:   'Always returns true as measures that are not visible are not included in the rowset',
                canRestrict:   false,
                alwaysPresent: true
            },
            LEVELS_LIST: {
                name: 'LEVELS_LIST',
                type:          'string',
                isArray:       false,
                description:   'Always null',
                canRestrict:   false,
                alwaysPresent: true
            },
            MEASURE_NAME_SQL_COLUMN_NAME: {
                name: 'MEASURE_NAME_SQL_COLUMN_NAME',
                type:          'string',
                isArray:       false,
                description:   'The name of the column in the SQL query that corresponds to the measure name',
                canRestrict:   false,
                alwaysPresent: true
            },
            MEASURE_UNQUALIFIED_CAPTION: {
                name: 'MEASURE_UNQUALIFIED_CAPTION',
                type:          'string',
                isArray:       false,
                description:   'The name of the measure, not qualified with the measure group name',
                canRestrict:   false,
                alwaysPresent: false
            },
            MEASUREGROUP_NAME: {
                name: 'MEASUREGROUP_NAME',
                type:          'string',
                isArray:       false,
                description:   'The name of the measure group to which the measure belongs',
                canRestrict:   true,
                alwaysPresent: true
            },
            MEASURE_DISPLAY_FOLDER: {
                name: 'MEASURE_DISPLAY_FOLDER',
                type:          'string',
                isArray:       false,
                description:   'The path to be used for display the meaasure in the user interface',
                canRestrict:   false,
                alwaysPresent: true
            },
            DEFAULT_FORMAT_STRING: {
                name: 'DEFAULT_FORMAT_STRING',
                type:          'string',
                isArray:       false,
                description:   'The default format string for the measure',
                canRestrict:   false,
                alwaysPresent: true
            }
        },
        MDSCHEMA_DIMENSIONS: {
            CATALOG_NAME: {
                name: 'CATALOG_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the catalog to which the dimension belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: 'SCHEMA_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the schema to which the dimension belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: 'CUBE_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the cube to which the dimension belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_NAME: {
                name: 'DIMENSION_NAME',
                type: 'string',
                isArray: false,
                description: 'The name of the dimension',
                canRestrict: true,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_NAME: {
                name: 'DIMENSION_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the dimension',
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_CAPTION: {
                name: 'DIMENSION_CAPTION',
                type: 'string',
                isArray: false,
                description: 'A label or caption associated with the dimension',
                canRestrict: false,
                alwaysPresent: false
            },
            DIMENSION_ORDINAL: {
                name: 'DIMENSION_ORDINAL',
                type: 'number',
                isArray: false,
                description: 'The position of the dimension in the cube',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_TYPE: {
                name: 'DIMENSION_TYPE',
                type: 'number',
                isArray: false,
                description: 'A member of olap.XmlaDimensionType enumeration indicating the type of the dimension',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_CARDINALITY: {
                name: 'DIMENSION_CARDINALITY',
                type: 'number',
                isArray: false,
                description: 'The number of members in the key attribute',
                canRestrict: false,
                alwaysPresent: false
            },
            DEFAULT_HIERARCHY: {
                name: 'DEFAULT_HIERARCHY',
                type: 'string',
                isArray: false,
                description: 'A hierarchy from the dimension, Preserved for backwards compatibility',
                canRestrict: false,
                alwaysPresent: false
            },
            DESCRIPTION: {
                name: 'DESCRIPTION',
                type: 'string',
                isArray: false,
                description: 'A friendly description of the dimension',
                canRestrict: false,
                alwaysPresent: false
            },
            IS_VIRTUAL: {
                name: 'IS_VIRTUAL',
                type:          'boolean',
                isArray:       false,
                description:   'Always returns false',
                canRestrict:   false,
                alwaysPresent: true
            },
            IS_READWRITE: {
                name: 'IS_READWRITE',
                type:          'boolean',
                isArray:       false,
                description:   'Indicates whether the dimension is write enabled',
                canRestrict:   false,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_SETTINGS: {
                name: 'DIMENSION_UNIQUE_SETTINGS',
                type:          'number',
                isArray:       false,
                description:   'A bitmap that specifies which columns contain unique values if the dimension contains' +
                'only members with unique names.',
                canRestrict:   false,
                alwaysPresent: true
            },
            DIMENSION_MASTER_UNIQUE_NAME: {
                name: 'DIMENSION_UNIQUE_SETTINGS',
                type:          'string',
                isArray:       false,
                description:   'Always null',
                canRestrict:   false,
                alwaysPresent: true
            },
            DIMENSION_IS_VISIBLE: {
                name: 'DIMENSION_IS_VISIBLE',
                type:          'boolean',
                isArray:       false,
                description:   'Always true. A dimension is not visible unless one or more hierarchies in the' +
                ' dimension are visible.  The dimension is not included in the rowset if it is not visible',
                canRestrict:   false,
                alwaysPresent: true
            }
        },
        MDSCHEMA_MEMBERS: {
            CATALOG_NAME: {
                name: 'CATALOG_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the catalog to which the member belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: 'SCHEMA_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the schema to which the member belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: 'CUBE_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the cube to which the memeber belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_UNIQUE_NAME: {
                name: 'DIMENSION_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the dimension the member belongs to',
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_UNIQUE_NAME: {
                name: 'HIERARCHY_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the hierarchy the member belongs to',
                canRestrict: true,
                alwaysPresent: false
            },
            LEVEL_UNIQUE_NAME: {
                name: 'LEVEL_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the level the member belongs to',
                canRestrict: true,
                alwaysPresent: false
            },
            LEVEL_NUMBER: {
                name: 'LEVEL_NUMBER',
                type: 'number',
                isArray: false,
                description: 'The distance of the member from the root of the hierarchy',
                canRestrict: true,
                alwaysPresent: false
            },
            MEMBER_ORDINAL: {
                name: 'MEMBER_ORDINAL',
                type: 'number',
                isArray: false,
                description: 'Deprecated always returns 0',
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_NAME: {
                name: 'MEMBER_NAME',
                type: 'string',
                isArray: false,
                description: 'The name of the member',
                canRestrict: true,
                alwaysPresent: true
            },
            MEMBER_UNIQUE_NAME: {
                name: 'MEMBER_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the member',
                canRestrict: true,
                alwaysPresent: true
            },
            MEMBER_TYPE: {
                name: 'MEMBER_TYPE',
                type: 'number',
                isArray: false,
                description: 'A member of the olap.XmlaDimensionMemberType enum indicating the type ' +
                'of the member',
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_GUID: {
                name: 'MEMBER_GUID',
                type: 'string',
                isArray: false,
                description: 'The GUID of the member, null of no guid exists',
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_CAPTION: {
                name: 'MEMBER_CAPTION',
                type: 'string',
                isArray: false,
                description: 'A label or caption associated with the member',
                canRestrict: false,
                alwaysPresent: true
            },
            CHILDREN_CARDINALITY: {
                name: 'CHILDREN_CARDINALITY',
                type: 'number',
                isArray: false,
                description: 'The number of children the member has',
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_LEVEL: {
                name: 'PARENT_LEVEL',
                type: 'number',
                isArray: false,
                description: 'The distance of the members parent from the root level of the hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_UNIQUE_NAME: {
                name: 'PARENT_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the members parent',
                canRestrict: false,
                alwaysPresent: true
            },
            PARENT_COUNT: {
                name: 'PARENT_COUNT',
                type: 'number',
                isArray: false,
                description: 'The number of parents this member has',
                canRestrict: false,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: 'DESCRIPTION',
                type: 'string',
                isArray: false,
                description: 'Always returns null, exists to maintain backward compatibility',
                canRestrict: false,
                alwaysPresent: true
            },
            EXPRESSION: {
                name: 'EXPRESSION',
                type: 'string',
                isArray: false,
                description: 'The expression for calculations, if the member type is Formula',
                canRestrict: false,
                alwaysPresent: true
            },
            MEMBER_KEY: {
                name: 'MEMBER_KEY',
                type: 'string',
                isArray: false,
                description: 'The value of the members key column, returns null if the member has a ' +
                'composite key',
                canRestrict: false,
                alwaysPresent: true
            },
            IS_PLACEHOLDERMEMBER: {
                name: 'IS_PLACEHOLDERMEMBER',
                type: 'boolean',
                isArray: false,
                description: 'Indic' +
                'ates whether a member is a placeholder member for an empty position in' +
                ' a dimension hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            IS_DATAMEMBER: {
                name: 'IS_DATAMEMBER',
                type: 'boolean',
                isArray: false,
                description: 'Indicates whether the member is a data member',
                canRestrict: false,
                alwaysPresent: true
            },
            SCOPE: {
                name: 'SCOPE',
                type: 'number',
                isArray: false,
                description: 'The scope of the member.  The member can be a session calculated member or a' +
                ' global calculated member',
                canRestrict: false,
                alwaysPresent: true,
                possibleValues: [1, 2]
            }
        },
        MDSCHEMA_HIERARCHIES: {
            CATALOG_NAME: {
                name: 'CATALOG_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the catalog to which the hierarchy belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            SCHEMA_NAME: {
                name: 'SCHEMA_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the schema to which the hierarchy belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            CUBE_NAME: {
                name: 'CUBE_NAME',
                type: 'string',
                isArray: false,
                description: 'Name of the cube to which the hierarchy belongs',
                canRestrict: true,
                alwaysPresent: false
            },
            DIMENSION_UNIQUE_NAME: {
                name: 'DIMENSION_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the dimension the hierarchy belongs to',
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_NAME: {
                name: 'HIERARCHY_NAME',
                type: 'string',
                isArray: false,
                description: 'The name of the hierarchy',
                canRestrict: true,
                alwaysPresent: true
            },
            HIERARCHY_UNIQUE_NAME: {
                name: 'HIERARCHY_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'The unique name of the hierarchy the hierarchy belongs to',
                canRestrict: true,
                alwaysPresent: false
            },
            HIERARCHY_GUID: {
                name: 'HIERARCHY_GUID',
                type: 'string',
                isArray: false,
                description: 'Not supported',
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_CAPTION: {
                name: 'HIERARCHY_CAPTION',
                type: 'string',
                isArray: false,
                description: 'A label or caption associated with the hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_TYPE: {
                name: 'DIMENSION_TYPE',
                type: 'number',
                isArray: false,
                description: 'A member of the olap.XmlaDimensionType enum indicating the type ' +
                'of the dimension',
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_CARDINALITY: {
                name: 'HIERARCHY_CARDINALITY',
                type: 'number',
                isArray: false,
                description: 'The number of members in the hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            DEFAULT_MEMBER: {
                name: 'DEFAULT_MEMBER',
                type: 'string',
                isArray: false,
                description: 'The unique name of default member for this hierarchy.',
                canRestrict: false,
                alwaysPresent: true
            },
            ALL_MEMBER: {
                name: 'ALL_MEMBER',
                type: 'string',
                isArray: false,
                description: 'The member at the highest level of the rollup',
                canRestrict: false,
                alwaysPresent: true
            },
            DESCRIPTION: {
                name: 'DESCRIPTION',
                type: 'string',
                isArray: false,
                description: 'A friendly desicription of the hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            STRUCTURE: {
                name: 'STRUCTURE',
                type: 'number',
                isArray: false,
                description: 'A member of the olap.XmlaStructure enum indicating the structure' +
                ' of the hierarchy',
                canRestrict: false,
                alwaysPresent: true
            },
            IS_VIRTUAL: {
                name: 'IS_VIRTUAL',
                type: 'boolean',
                isArray: false,
                description: 'Always returns false',
                canRestrict: false,
                alwaysPresent: true
            },
            IS_READWRITE: {
                name: 'IS_READWRITE',
                type: 'boolean',
                isArray: false,
                description: 'Indicates whether the write back is enabled on the dimension column',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_UNIQUE_SETTINGS: {
                name: 'DIMENSION_UNIQUE_SETTINGS',
                type: 'string',
                isArray: false,
                description: 'Always returns 1 indicating unique',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_MASTER_UNIQUE_NAME: {
                name: 'DIMENSION_MASTER_UNIQUE_NAME',
                type: 'string',
                isArray: false,
                description: 'Always returns null',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_IS_VISIBLE: {
                name: 'DIMENSION_IS_VISIBLE',
                type: 'boolean',
                isArray: false,
                description: 'Always returns true.  If the dimension is not visible it will not' +
                ' appear in the rowset',
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_ORDINAL: {
                name: 'HIERARCHY_ORDINAL',
                type: 'number',
                isArray: false,
                description: 'The ordinal number of the hierarchy across all hierarchies in the cube',
                canRestrict: false,
                alwaysPresent: true
            },
            DIMENSION_IS_SHARED: {
                name: 'DIMENSION_IS_SHARED',
                type: 'boolean',
                isArray: false,
                description: 'Always returns true',
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_IS_VISIBLE: {
                name: 'HIERARCHY_IS_VISIBLE',
                type: 'boolean',
                isArray: false,
                description: 'Indicates wither the hierarhcy is visible',
                canRestrict: false,
                alwaysPresent: true
            },
            HIERARCHY_ORIGIN: {
                name: 'HIERARCHY_ORIGIN',
                type: 'number',
                isArray: false,
                description: 'A bit mask that determines the source of the hierarchy',
                canRestrict: true,
                alwaysPresent: true
            },
            HIERARCHY_DISPLAY_FOLDER: {
                name: 'HIERARCHY_DISPLAY_FOLDER',
                type: 'string',
                isArray: false,
                description: 'The path to be used when displaying the hierarchy in the user interface',
                canRestrict: false,
                alwaysPresent: true
            },
            INSTANCE_SELECTION: {
                name: 'INSTANCE_SELECTION',
                type: 'number',
                isArray: false,
                description: 'A member of the olap.XmlaInstanceSelection enum indicating how a hierarchy ' +
                'should be presented for selection in the user interface',
                canRestrict: false,
                alwaysPresent: true
            },
            GROUPING_BEHAVIOR: {
                name: 'GROUPING_BEHAVIOR',
                type: 'number',
                isArray: false,
                description: 'Indicates whether grouping is encouraged (1) or discouraged (2)',
                canRestrict: false,
                alwaysPresent: true,
                possibleValues: [1, 2]
            },
            STRUCTURE_TYPE: {
                name: 'STRUCTURE_TYPE',
                type: 'string',
                isArray: false,
                description: 'A member of the olap.XmlaStructureType enum indicating the type of hierarchy',
                canRestrict: false,
                alwaysPresent: true
            }
        }
    }
})(window);
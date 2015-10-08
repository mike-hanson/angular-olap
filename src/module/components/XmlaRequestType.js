(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});

    olap.XmlaRequestType = {
        DISCOVER_CALC_DEPENDENCY: 'DISCOVER_CALC_DEPENDENCY',
        DISCOVER_CONNECTIONS: 'DISCOVER_CONNECTIONS',
        DISCOVER_COMMAND_OBJECTS: 'DISCOVER_COMMAND_OBJECTS',
        DISCOVER_COMMANDS: 'DISCOVER_COMMANDS',
        DISCOVER_CSDL_METADATA: 'DISCOVER_CSDL_METADATA',
        DISCOVER_DATASOURCES: 'DISCOVER_DATASOURCES',
        DISCOVER_DB_CONNECTIONS: 'DISCOVER_DB_CONNECTIONS',
        DISCOVER_DIMENSION_STAT: 'DISCOVER_DIMENSION_STAT',
        DISCOVER_ENUMERATORS: 'DISCOVER_ENUMERATORS',
        DISCOVER_JOBS: 'DISCOVER_JOBS',
        DISCOVER_KEYWORDS: 'DISCOVER_KEYWORDS',
        DISCOVER_LITERALS: 'DISCOVER_LITERALS',
        DISCOVER_LOCATIONS: 'DISCOVER_LOCATIONS',
        DISCOVER_LOCKS: 'DISCOVER_LOCKS',
        DISCOVER_MEMORYGRANT: 'DISCOVER_MEMORYGRANT',
        DISCOVER_MEMORYUSAGE: 'DISCOVER_MEMORYUSAGE',
        DISCOVER_OBJECT_ACTIVITY: 'DISCOVER_OBJECT_ACTIVITY',
        DISCOVER_OBJECT_MEMORY_USAGE: 'DISCOVER_OBJECT_MEMORY_USAGE',
        DISCOVER_PARTITION_DIMENSION_STAT: 'DISCOVER_PARTITION_DIMENSION_STAT',
        DISCOVER_PARTITION_STAT: 'DISCOVER_PARTITION_STAT',
        DISCOVER_PERFORMANCE_COUNTERS: 'DISCOVER_PERFORMANCE_COUNTERS',
        DISCOVER_PROPERTIES: 'DISCOVER_PROPERTIES',
        DISCOVER_SCHEMA_ROWSETS: 'DISCOVER_SCHEMA_ROWSETS',
        DISCOVER_SESSIONS: 'DISCOVER_SESSIONS',
        DISCOVER_STORAGE_TABLE_COLUMN_SEGMENTS: 'DISCOVER_STORAGE_TABLE_COLUMN_SEGMENTS',
        DISCOVER_STORAGE_TABLE_COLUMNS: 'DISCOVER_STORAGE_TABLE_COLUMNS',
        DISCOVER_STORAGE_TABLES: 'DISCOVER_STORAGE_TABLES',
        DISCOVER_TRACE_COLUMNS: 'DISCOVER_TRACE_COLUMNS',
        DISCOVER_TRACE_DEFINITION_PROVIDER_INFO: 'DISCOVER_TRACE_DEFINITION_PROVIDER_INFO',
        DISCOVER_TRACE_EVENT_CATEGORIES: 'DISCOVER_TRACE_EVENT_CATEGORIES',
        DISCOVER_TRACES: 'DISCOVER_TRACES',
        DISCOVER_TRANSACTIONS: 'DISCOVER_TRANSACTIONS',
        DISCOVER_XML_METADATA: 'DISCOVER_XML_METADATA'
    }
})(window);
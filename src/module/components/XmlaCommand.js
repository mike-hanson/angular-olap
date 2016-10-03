(function (window) {
    'use strict';

    var olap = (window.olap = window.olap || {});
    olap.XmlaCommand = {
        Alter: 'Alter',
        Backup: 'Backup',
        Batch: 'Batch',
        BeginTransaction: 'BeginTransaction',
        Cancel: 'Cancel',
        ClearCache: 'ClearCache',
        CommitTransaction: 'CommitTransaction',
        Create: 'Create',
        Delete: 'Delete',
        DesignAggregations: 'DesignAggregations',
        Drop: 'Drop',
        Insert: 'Insert',
        Lock: 'Lock',
        MergePartitions: 'MergePartitions',
        NotifyTableChange: 'NotifyTableChange',
        Process: 'Process',
        RollbackTransaction: 'RollbackTransaction',
        SetPasswordEncryptionKey: 'SetPasswordEncryptionKey',
        Statement: 'Statement',
        Subscribe: 'Subscribe',
        Synchronize: 'Synchronize',
        Unlock: 'Unlock',
        Update: 'Update',
        UpdateCells: 'UpdateCells'
    }
})(window);
/* Iteration 51: seed the physical AppTransactionDetails fields and the
   Sales Order Detail tree node. Run after the current Field Manager migrations
   and the AppEntity/transaction-header seed scripts. Rerunnable after clearing
   AppFields, AppFieldsHistory, and AppTableFields; existing snapshots are kept. */
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.AppTransactionDetails', N'U') IS NULL
        OR OBJECT_ID(N'dbo.AppFields', N'U') IS NULL
        OR OBJECT_ID(N'dbo.AppFieldsHistory', N'U') IS NULL
        OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
        THROW 51200, 'AppTransactionDetails and the Field Manager tables are required.', 1;
    IF COL_LENGTH(N'dbo.SydObjects', N'BaseEntityId') IS NULL
        OR COL_LENGTH(N'dbo.AppFields', N'SourceAttributeId') IS NULL
        OR COL_LENGTH(N'dbo.AppFields', N'ExtraAttributes') IS NOT NULL
        OR COL_LENGTH(N'dbo.AppFieldsHistory', N'SnapshotJson') IS NOT NULL
        OR COL_LENGTH(N'dbo.AppTableFields', N'SnapshotJson') IS NOT NULL
        OR COL_LENGTH(N'dbo.AppTableFields', N'SourceAppFieldId') IS NULL
        THROW 51201, 'Apply the current typed Field Manager migrations first.', 1;

    DECLARE @transactionId bigint;
    DECLARE @appEntityId bigint;
    DECLARE @detailId bigint;
    DECLARE @fieldObjectId bigint;
    DECLARE @fieldRootId bigint;
    DECLARE @dataTypeId bigint;

    IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION'
        AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        OR (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'APPENTITY-DATA'
        AND ObjectTypeCode = N'DATA' AND IsDeleted = 0) <> 1
        OR (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'DATA'
        AND IsDeleted = 0) <> 1
        THROW 51202, 'Seed Transaction and AppEntity objects first.', 1;
    SELECT @transactionId = Id FROM dbo.SydObjects
        WHERE Code = N'TRANSACTION' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0;
    SELECT @appEntityId = Id FROM dbo.SydObjects
        WHERE Code = N'APPENTITY-DATA' AND ObjectTypeCode = N'DATA' AND IsDeleted = 0;
    SELECT @dataTypeId = Id FROM dbo.SysObjectTypes
        WHERE Code = N'DATA' AND IsDeleted = 0;

    IF EXISTS (SELECT 1 FROM dbo.SydObjects
        WHERE (Code = N'TRANSACTION-DETAIL-DATA' OR Name = N'AppTransactionDetails')
          AND NOT (Code = N'TRANSACTION-DETAIL-DATA' AND Name = N'AppTransactionDetails'
            AND ObjectTypeCode = N'DATA' AND ObjectTypeId = @dataTypeId
            AND ParentId = @transactionId AND ParentCode = N'TRANSACTION'
            AND IsDeleted = 0))
        THROW 51203, 'A conflicting AppTransactionDetails object exists.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects
        WHERE Code = N'TRANSACTION-DETAIL-DATA' AND IsDeleted = 0)
        INSERT dbo.SydObjects
            (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode,
             ObjectTypeCode, ObjectTypeId, BaseEntityId)
        VALUES (SYSUTCDATETIME(), 0, N'AppTransactionDetails',
            N'TRANSACTION-DETAIL-DATA', @transactionId, N'TRANSACTION',
            N'DATA', @dataTypeId, @appEntityId);
    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'TRANSACTION-DETAIL-DATA' AND IsDeleted = 0) <> 1
        THROW 51204, 'Expected one AppTransactionDetails object.', 1;
    SELECT @detailId = Id FROM dbo.SydObjects
        WHERE Code = N'TRANSACTION-DETAIL-DATA' AND IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM dbo.SydObjects
        WHERE Id = @detailId AND BaseEntityId IS NOT NULL AND BaseEntityId <> @appEntityId)
        THROW 51205, 'AppTransactionDetails has a different base entity.', 1;
    UPDATE dbo.SydObjects SET BaseEntityId = @appEntityId
        WHERE Id = @detailId AND BaseEntityId IS NULL;

    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE (Code = N'SALESORDERDETAIL' OR Name = N'Sales Order Detail')
          AND NOT (Code = N'SALESORDERDETAIL' AND Name = N'Sales Order Detail'
            AND ObjectId = @detailId AND ObjectCode = N'TRANSACTION-DETAIL-DATA'
            AND ParentId IS NULL AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND TenantId IS NULL
            AND IsDeleted = 0))
        THROW 51206, 'A conflicting Sales Order Detail type exists.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE Code = N'SALESORDERDETAIL' AND ObjectId = @detailId AND IsDeleted = 0)
        INSERT dbo.SycEntityObjectTypes
            (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode,
             TenantId, IsDefault)
        VALUES (SYSUTCDATETIME(), 0, N'SALESORDERDETAIL', N'Sales Order Detail',
            @detailId, N'TRANSACTION-DETAIL-DATA', NULL, 0);
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE Code = N'SALESORDERDETAIL' AND ObjectId = @detailId AND IsDeleted = 0) <> 1
        THROW 51207, 'Expected one Sales Order Detail type.', 1;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51208, 'Seed the Field object and field types first.', 1;
    SELECT @fieldObjectId = Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0;
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE Code = N'FIELD' AND ObjectId = @fieldObjectId
          AND ParentId IS NULL AND IsDeleted = 0) <> 1
        THROW 51209, 'Expected one Field type root.', 1;
    SELECT @fieldRootId = Id FROM dbo.SycEntityObjectTypes
        WHERE Code = N'FIELD' AND ObjectId = @fieldObjectId
          AND ParentId IS NULL AND IsDeleted = 0;

    CREATE TABLE #SeedFields
    (
        Ordinal int NOT NULL PRIMARY KEY,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
        TypeCode nvarchar(2) COLLATE DATABASE_DEFAULT NOT NULL,
        FieldCode nvarchar(11) COLLATE DATABASE_DEFAULT NULL,
        FieldTypeId bigint NULL,
        [Length] int NULL,
        Decimals int NULL,
        AllowNull bit NOT NULL,
        Required bit NOT NULL,
        Visible bit NOT NULL,
        Editable bit NOT NULL
    );
    -- The 15 detail properties plus the TPT primary key. AppEntity columns are
    -- seeded separately and inherited through SydObjects.BaseEntityId.
    INSERT #SeedFields
        (Ordinal, FieldName, TypeCode, [Length], Decimals, AllowNull,
         Required, Visible, Editable)
    VALUES
        ( 1, N'Id',               N'IN', NULL, 0, 0, 1, 0, 0),
        ( 2, N'TransactionId',    N'LD', NULL, NULL, 0, 1, 0, 0),
        ( 3, N'TransactionCode',  N'ST', 50, NULL, 1, 0, 1, 1),
        ( 4, N'LineNo',           N'IN', NULL, 0, 0, 1, 1, 1),
        ( 5, N'Quantity',         N'IN', NULL, 3, 0, 1, 1, 1),
        ( 6, N'GrossPrice',       N'IC', NULL, 3, 0, 1, 1, 1),
        ( 7, N'NetPrice',         N'IC', NULL, 3, 0, 1, 1, 1),
        ( 8, N'Discount',         N'IC', NULL, 3, 0, 1, 1, 1),
        ( 9, N'Amount',           N'IC', NULL, 3, 0, 1, 1, 1),
        (10, N'ItemCode',         N'ST', NULL, NULL, 1, 0, 1, 1),
        (11, N'ItemDescription',  N'ST', NULL, NULL, 1, 0, 1, 1),
        (12, N'Note',             N'ST', NULL, NULL, 1, 0, 1, 1),
        (13, N'ItemSSIN',         N'ST', 30, NULL, 1, 0, 1, 1),
        (14, N'NoOfPrePacks',     N'IN', NULL, 0, 1, 0, 1, 1),
        (15, N'ParentId',         N'LD', NULL, NULL, 1, 0, 0, 0),
        (16, N'ManufacturerCode', N'ST', 50, NULL, 1, 0, 1, 1);

    IF EXISTS (SELECT 1 FROM #SeedFields s
        WHERE NOT EXISTS (SELECT 1 FROM sys.columns c
            WHERE c.object_id = OBJECT_ID(N'dbo.AppTransactionDetails')
              AND c.name = s.FieldName))
        THROW 51210, 'A reviewed AppTransactionDetails column is missing.', 1;
    IF EXISTS (SELECT 1 FROM sys.columns c
        WHERE c.object_id = OBJECT_ID(N'dbo.AppTransactionDetails')
          AND NOT EXISTS (SELECT 1 FROM #SeedFields s WHERE s.FieldName = c.name))
        THROW 51211, 'AppTransactionDetails has a column not covered by this seed.', 1;
    IF EXISTS (SELECT 1 FROM #SeedFields s OUTER APPLY
        (SELECT COUNT(*) AS Cnt FROM dbo.SycEntityObjectTypes t
         WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
           AND t.Code = s.TypeCode AND t.IsDeleted = 0) t
        WHERE t.Cnt <> 1)
        THROW 51212, 'A required Field data type is missing or duplicated.', 1;
    UPDATE s SET FieldTypeId = t.Id
    FROM #SeedFields s JOIN dbo.SycEntityObjectTypes t
        ON t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
       AND t.Code = s.TypeCode AND t.IsDeleted = 0;

    IF EXISTS (SELECT 1 FROM #SeedFields s JOIN dbo.AppFields f
        ON f.SycObjectId = @detailId AND f.FieldName = s.FieldName
       AND f.TenantId IS NULL AND f.IsDeleted = 0
        GROUP BY s.FieldName HAVING COUNT(*) > 1)
        THROW 51213, 'Duplicate active detail field definitions exist.', 1;
    IF EXISTS (SELECT 1 FROM #SeedFields s JOIN dbo.AppFields f
        ON f.SycObjectId = @detailId AND f.FieldName = s.FieldName
       AND f.TenantId IS NULL AND f.IsDeleted = 0
        WHERE f.FieldTypeId <> s.FieldTypeId)
        THROW 51214, 'An existing detail field has a different type.', 1;
    UPDATE s SET FieldCode = f.FieldCode
    FROM #SeedFields s JOIN dbo.AppFields f
        ON f.SycObjectId = @detailId AND f.FieldName = s.FieldName
       AND f.TenantId IS NULL AND f.IsDeleted = 0;

    -- New codes follow the 2-char type + S + 4-char name + 4-digit sequence
    -- convention, with one sequence per Field type across all definitions.
    ;WITH Missing AS
    (
        SELECT s.Ordinal, s.TypeCode, s.FieldTypeId,
            ROW_NUMBER() OVER (PARTITION BY s.FieldTypeId ORDER BY s.Ordinal) AS SequenceOffset
        FROM #SeedFields s WHERE s.FieldCode IS NULL
    ), LastUsed AS
    (
        SELECT FieldTypeId,
            COALESCE(MAX(TRY_CONVERT(int, RIGHT(FieldCode, 4))), 0) AS LastSequence
        FROM dbo.AppFields
        WHERE TenantId IS NULL AND LEN(FieldCode) = 11
        GROUP BY FieldTypeId
    )
    SELECT m.Ordinal, COALESCE(l.LastSequence, 0) + m.SequenceOffset AS NextSequence
    INTO #PendingCodes
    FROM Missing m LEFT JOIN LastUsed l ON l.FieldTypeId = m.FieldTypeId;
    IF EXISTS (SELECT 1 FROM #PendingCodes WHERE NextSequence > 9999)
        THROW 51216, 'A field type exhausted its four-digit sequence.', 1;
    UPDATE s SET FieldCode = s.TypeCode + N'S'
        + LEFT(UPPER(s.FieldName) + N'____', 4)
        + RIGHT(N'0000' + CONVERT(nvarchar(10), p.NextSequence), 4)
    FROM #SeedFields s JOIN #PendingCodes p ON p.Ordinal = s.Ordinal;
    IF EXISTS (SELECT 1 FROM #SeedFields s
        WHERE LEN(s.FieldCode) <> 11 OR TRY_CONVERT(int, RIGHT(s.FieldCode, 4)) IS NULL)
        OR EXISTS (SELECT FieldCode FROM #SeedFields GROUP BY FieldCode HAVING COUNT(*) > 1)
        OR EXISTS (SELECT 1 FROM #SeedFields s JOIN dbo.AppFields f
            ON f.FieldCode = s.FieldCode AND f.TenantId IS NULL
           AND (f.SycObjectId <> @detailId OR f.FieldName <> s.FieldName))
        THROW 51215, 'Could not allocate unique detail field codes.', 1;

    INSERT dbo.AppFields
        (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode,
         FieldName, Description, FieldTypeId, WidgetTypeId, FieldLevelId,
         FieldStatusId, FieldLevelCode, FieldStatusCode, TrackingNo,
         CurrentRevisionNo, IsStandard, IsCustom, IsExtraField, IsHidden,
         AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
         AllowMultiSelect, Required, Visible, Editable, SourceAttributeId,
         SourceDataType, SourceEntityObjectTypeId, EntityObjectTypeCode,
         Usage, IsLookup, IsVariation, IsAdvancedSearch, AcceptMultipleValues,
         AllowAddNew, CreationTime, CreatorUserId, LastModificationTime,
         LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
    SELECT NULL, NULL, @detailId, @transactionId, s.FieldCode,
        s.FieldName, N'AppTransactionDetails.' + s.FieldName, s.FieldTypeId,
        NULL, NULL, NULL, N'System', N'Proposed', NULL, N'00',
        1, 0, 0, 0, s.AllowNull, s.[Length], s.Decimals, NULL, NULL, NULL,
        0, s.Required, s.Visible, s.Editable, NULL, NULL, NULL, NULL,
        NULL, NULL, NULL, NULL, NULL, NULL, SYSUTCDATETIME(), NULL,
        NULL, NULL, 0, NULL, NULL
    FROM #SeedFields s
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
        WHERE f.SycObjectId = @detailId AND f.FieldName = s.FieldName
          AND f.TenantId IS NULL AND f.IsDeleted = 0);

    -- Shared detail fields are visible for Sales Order Detail through GetFields.
    -- No sales-only detail properties are defined by AppTransactionDetails.
    INSERT dbo.AppTableFields
        (TenantId, FieldDefinitionKey, FieldCode, AppliedRevisionNo, SycObjectId,
         SycEntityObjectTypeId, SourceAppFieldId, FieldTenantId, SourceFieldId,
         DefinitionSycObjectId, EntitySycObjectId, FieldName, Description,
         FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId, FieldLevelCode,
         FieldStatusCode, TrackingNo, IsStandard, IsCustom, IsExtraField, IsHidden,
         AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
         AllowMultiSelect, Required, Visible, Editable, SourceAttributeId,
         SourceDataType, SourceEntityObjectTypeId, EntityObjectTypeCode, Usage,
         IsLookup, IsVariation, IsAdvancedSearch, AcceptMultipleValues,
         AllowAddNew, FieldCreationTime, FieldCreatorUserId,
         FieldLastModificationTime, FieldLastModifierUserId, FieldIsDeleted,
         FieldDeleterUserId, FieldDeletionTime, CreationTime, CreatorUserId)
    SELECT f.TenantId, f.FieldDefinitionKey, f.FieldCode, f.CurrentRevisionNo,
        @detailId, NULL, f.Id, f.TenantId, f.SourceFieldId, f.SycObjectId,
        f.EntitySycObjectId, f.FieldName, f.Description, f.FieldTypeId,
        f.WidgetTypeId, f.FieldLevelId, f.FieldStatusId, f.FieldLevelCode,
        f.FieldStatusCode, f.TrackingNo, f.IsStandard, f.IsCustom,
        f.IsExtraField, f.IsHidden, f.AllowNull, f.[Length], f.Decimals,
        f.DefaultValue, f.DateFormat, f.TimeFormat, f.AllowMultiSelect,
        f.Required, f.Visible, f.Editable, f.SourceAttributeId,
        f.SourceDataType, f.SourceEntityObjectTypeId, f.EntityObjectTypeCode,
        f.Usage, f.IsLookup, f.IsVariation, f.IsAdvancedSearch,
        f.AcceptMultipleValues, f.AllowAddNew, f.CreationTime,
        f.CreatorUserId, f.LastModificationTime, f.LastModifierUserId,
        f.IsDeleted, f.DeleterUserId, f.DeletionTime, SYSUTCDATETIME(), NULL
    FROM #SeedFields s JOIN dbo.AppFields f
        ON f.FieldName = s.FieldName AND f.SycObjectId = @detailId
       AND f.TenantId IS NULL AND f.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.FieldDefinitionKey = f.FieldDefinitionKey
          AND a.SycObjectId = @detailId AND a.SycEntityObjectTypeId IS NULL);

    DECLARE @historyColumns nvarchar(max);
    DECLARE @historyValues nvarchar(max);
    DECLARE @historySql nvarchar(max);
    SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
            WITHIN GROUP (ORDER BY c.column_id),
           @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
            WITHIN GROUP (ORDER BY c.column_id)
    FROM sys.columns c
    JOIN sys.columns h ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory')
        AND h.name = c.name
    WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';
    SET @historySql = N'INSERT dbo.AppFieldsHistory
        (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
    SELECT f.Id, f.CurrentRevisionNo, N''Create'', SYSUTCDATETIME(), '
        + @historyValues + N'
    FROM dbo.AppFields f JOIN #SeedFields s ON s.FieldName = f.FieldName
    WHERE f.SycObjectId = @objectId AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
          WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
    EXEC sys.sp_executesql @historySql, N'@objectId bigint', @objectId = @detailId;

    SELECT @detailId AS DetailObjectId,
        (SELECT Id FROM dbo.SycEntityObjectTypes
         WHERE Code = N'SALESORDERDETAIL' AND ObjectId = @detailId AND IsDeleted = 0)
            AS SalesOrderDetailTypeId,
        (SELECT COUNT(*) FROM dbo.AppFields
         WHERE SycObjectId = @detailId AND TenantId IS NULL AND IsDeleted = 0)
            AS DetailDefinitions,
        (SELECT COUNT(*) FROM dbo.AppTableFields
         WHERE SycObjectId = @detailId AND TenantId IS NULL
           AND SycEntityObjectTypeId IS NULL) AS SharedDetailAssignments;
    DROP TABLE #PendingCodes;
    DROP TABLE #SeedFields;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

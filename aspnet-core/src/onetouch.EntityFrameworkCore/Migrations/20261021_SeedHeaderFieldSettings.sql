-- Optional String--Textbox settings and reviewed AppTransactionHeaders values.
-- Values are child rows; legacy IsLookup/EntityObjectTypeCode/ValidEntries columns are untouched.
-- Resolve identities from object/type codes and assignments, never database-specific IDs.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF COL_LENGTH(N'dbo.AppFieldSettingValues', N'Value') IS NULL
        OR COL_LENGTH(N'dbo.AppFieldHistorySettingValues', N'Value') IS NULL
        OR COL_LENGTH(N'dbo.AppTableFieldSettingValues', N'Value') IS NULL
        THROW 51720, 'Apply the single setting Value migration before seeding header settings.', 1;

    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    DECLARE @headerId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0);
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL
          AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @stringTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId AND Code = N'ST'
          AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @booleanTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId AND Code = N'BOOLEAN'
          AND TenantId IS NULL AND IsDeleted = 0);
    IF @headerId IS NULL OR @stringTypeId IS NULL OR @booleanTypeId IS NULL
        THROW 51721, 'Header, String--Textbox and Boolean--Checkbox metadata are required.', 1;

    CREATE TABLE #SettingSpecs
    (
        Ordinal int NOT NULL,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY,
        TypeCode nvarchar(20) COLLATE DATABASE_DEFAULT NOT NULL,
        FieldTypeId bigint NOT NULL
    );
    INSERT #SettingSpecs VALUES
        (1, N'IsLookup', N'BOOLEAN', @booleanTypeId),
        (2, N'EntityObjectTypeCode', N'ST', @stringTypeId),
        (3, N'ValidEntries', N'ST', @stringTypeId),
        (4, N'DataSourceService', N'ST', @stringTypeId),
        (5, N'DataSourceApi', N'ST', @stringTypeId),
        (6, N'DataSourceParameter', N'ST', @stringTypeId),
        (7, N'DataSourceValueParameter', N'ST', @stringTypeId);

    IF EXISTS (SELECT 1 FROM dbo.AppFields f JOIN #SettingSpecs s ON s.FieldName = f.FieldName
        WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @stringTypeId
          AND f.TenantId IS NULL AND f.IsDeleted = 0
          AND (f.FieldTypeId <> s.FieldTypeId OR f.IsStandard <> 1
            OR f.IsExtraField <> 0 OR f.FieldLevelCode <> N'System' OR f.Required <> 0))
        THROW 51722, 'An existing String--Textbox setting conflicts with the header settings seed.', 1;

    ;WITH Missing AS
    (
        SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.FieldTypeId ORDER BY s.Ordinal) AS NewOrdinal
        FROM #SettingSpecs s
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @stringTypeId
              AND f.TenantId IS NULL AND f.IsDeleted = 0 AND f.FieldName = s.FieldName)
    )
    SELECT m.*, COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
        FROM dbo.AppFields f WITH (UPDLOCK, HOLDLOCK)
        WHERE f.FieldTypeId = m.FieldTypeId AND LEN(f.FieldCode) = 11), 0) + m.NewOrdinal AS NextSequence
    INTO #MissingSettings FROM Missing m;
    IF EXISTS (SELECT 1 FROM #MissingSettings WHERE NextSequence > 9999)
        THROW 51723, 'A setting field type has exhausted its four-digit code sequence.', 1;

    INSERT dbo.AppFields
        (TenantId, SycObjectId, EntitySycObjectId, FieldCode, FieldName, Description,
         FieldTypeId, FieldLevelCode, FieldStatusCode, CurrentRevisionNo,
         IsStandard, IsExtraField, IsHidden, AllowNull, AllowMultiSelect,
         Required, Visible, Editable, Usage, CreationTime, IsDeleted)
    SELECT NULL, @fieldObjectId, @stringTypeId,
        LEFT(TypeCode, 2) + N'S' + LEFT(UPPER(FieldName) + N'____', 4)
            + RIGHT(N'0000' + CONVERT(nvarchar(10), NextSequence), 4),
        FieldName, N'Field Manager String--Textbox ExtraAttributes setting',
        FieldTypeId, N'System', N'Active', N'00',
        1, 0, 0, 1, 0, 0, 1, 1, N'FieldManager.ExtraAttributes', SYSUTCDATETIME(), 0
    FROM #MissingSettings;

    IF EXISTS (SELECT 1 FROM #SettingSpecs s
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @stringTypeId
              AND f.TenantId IS NULL AND f.IsDeleted = 0 AND f.FieldName = s.FieldName) matches
        WHERE matches.Cnt <> 1)
        THROW 51724, 'Expected one active definition per new String--Textbox setting.', 1;

    SELECT f.Id, f.FieldDefinitionKey, f.FieldCode, f.FieldName
    INTO #Settings FROM dbo.AppFields f JOIN #SettingSpecs s ON s.FieldName = f.FieldName
    WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @stringTypeId
      AND f.TenantId IS NULL AND f.IsDeleted = 0;

    IF EXISTS (SELECT 1 FROM dbo.AppTableFields a JOIN #Settings s ON s.FieldName = a.FieldName
        WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
          AND a.SycEntityObjectTypeId = @stringTypeId
          AND (a.FieldDefinitionKey <> s.FieldDefinitionKey OR a.SourceAppFieldId <> s.Id))
        THROW 51725, 'A type setting snapshot points to a different field definition.', 1;

    -- Copy the shared definition columns generically, with explicit assignment/audit mappings.
    DECLARE @snapshotColumns nvarchar(max), @snapshotValues nvarchar(max),
        @snapshotUpdates nvarchar(max), @sql nvarchar(max);
    SELECT @snapshotColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id),
           @snapshotValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id),
           @snapshotUpdates = STRING_AGG(CAST(N'a.' + QUOTENAME(c.name) + N'=f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id)
    FROM sys.columns c JOIN sys.columns a
      ON a.object_id = OBJECT_ID(N'dbo.AppTableFields') AND a.name = c.name
    WHERE c.object_id = OBJECT_ID(N'dbo.AppFields')
      AND c.name NOT IN (N'Id', N'TenantId', N'SycObjectId', N'CreationTime', N'CreatorUserId');

    SET @sql = N'INSERT dbo.AppTableFields
        (TenantId, SycObjectId, SycEntityObjectTypeId, SourceAppFieldId, FieldTenantId,
         DefinitionSycObjectId, AppliedRevisionNo, FieldCreationTime, FieldCreatorUserId,
         FieldLastModificationTime, FieldLastModifierUserId, FieldIsDeleted, FieldDeleterUserId,
         FieldDeletionTime, CreationTime, CreatorUserId, ' + @snapshotColumns + N')
        SELECT NULL, @objectId, @typeId, f.Id, f.TenantId, f.SycObjectId, f.CurrentRevisionNo,
            f.CreationTime, f.CreatorUserId, f.LastModificationTime, f.LastModifierUserId,
            f.IsDeleted, f.DeleterUserId, f.DeletionTime, SYSUTCDATETIME(), NULL, ' + @snapshotValues + N'
        FROM dbo.AppFields f JOIN #Settings s ON s.Id = f.Id
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
            WHERE a.TenantId IS NULL AND a.SycObjectId = @objectId
              AND a.SycEntityObjectTypeId = @typeId AND a.FieldDefinitionKey = f.FieldDefinitionKey);';
    EXEC sys.sp_executesql @sql, N'@objectId bigint, @typeId bigint', @fieldObjectId, @stringTypeId;

    CREATE TABLE #HeaderNames (FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY);
    INSERT #HeaderNames VALUES (N'ShipViaCode'), (N'PriceLevel'), (N'BuyerCompanySSIN');
    SELECT f.Id, f.FieldName, f.CurrentRevisionNo, f.FieldTypeId
    INTO #HeaderFields FROM dbo.AppFields f WITH (UPDLOCK, HOLDLOCK)
    JOIN #HeaderNames n ON n.FieldName = f.FieldName
    WHERE f.TenantId IS NULL AND f.SycObjectId IS NULL AND f.IsDeleted = 0
      AND EXISTS (SELECT 1 FROM dbo.AppTableFields a
          WHERE a.SourceAppFieldId = f.Id AND a.FieldDefinitionKey = f.FieldDefinitionKey
            AND a.SycObjectId = @headerId AND a.TenantId IS NULL);
    IF EXISTS (SELECT 1 FROM #HeaderNames n
        WHERE (SELECT COUNT(*) FROM #HeaderFields f WHERE f.FieldName = n.FieldName) <> 1)
        OR EXISTS (SELECT 1 FROM #HeaderFields WHERE FieldTypeId <> @stringTypeId)
        THROW 51726, 'Expected one host String--Textbox field per configured header field.', 1;

    SELECT f.Id AS AppFieldId, s.Id AS SettingFieldId, s.FieldCode AS SettingFieldCode,
        s.FieldName AS SettingFieldName, v.[Value]
    INTO #DesiredValues
    FROM (VALUES (N'ShipViaCode', N'IsLookup', N'true'),
                 (N'ShipViaCode', N'EntityObjectTypeCode', N'SHIPVIA'),
                 (N'PriceLevel', N'ValidEntries', N'MSRP|A|B|C|D'),
                 (N'BuyerCompanySSIN', N'DataSourceService', N'MarketplaceAccounts'),
                 (N'BuyerCompanySSIN', N'DataSourceApi', N'getAll'),
                 (N'BuyerCompanySSIN', N'DataSourceParameter', N'account.name'),
                 (N'BuyerCompanySSIN', N'DataSourceValueParameter', N'account.ssin')) v(FieldName, SettingName, [Value])
    JOIN #HeaderFields f ON f.FieldName = v.FieldName
    JOIN #Settings s ON s.FieldName = v.SettingName;
    IF EXISTS (SELECT 1 FROM #DesiredValues d JOIN dbo.AppFieldSettingValues v
        ON v.AppFieldId = d.AppFieldId AND v.SettingFieldId = d.SettingFieldId
        GROUP BY d.AppFieldId, d.SettingFieldId HAVING COUNT(*) > 1)
        THROW 51727, 'A single-value header setting has duplicate rows.', 1;

    SELECT f.Id, f.CurrentRevisionNo AS OldRevisionNo,
        CAST(CASE WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0' ELSE N'' END
            + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1) AS nvarchar(10)) AS NewRevisionNo
    INTO #ChangedFields FROM #HeaderFields f
    WHERE EXISTS (SELECT 1 FROM #DesiredValues d WHERE d.AppFieldId = f.Id
        AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues v
            WHERE v.AppFieldId = d.AppFieldId AND v.SettingFieldId = d.SettingFieldId
              AND v.[Value] = d.[Value] AND v.SettingFieldCode = d.SettingFieldCode
              AND v.SettingFieldName = d.SettingFieldName));
    IF EXISTS (SELECT 1 FROM #ChangedFields
        WHERE TRY_CONVERT(int, OldRevisionNo) IS NULL OR TRY_CONVERT(int, OldRevisionNo) < 0
          OR TRY_CONVERT(int, OldRevisionNo) >= 999999999)
        THROW 51728, 'A header field has an invalid or exhausted revision number.', 1;
    IF EXISTS (SELECT 1 FROM #ChangedFields f JOIN dbo.AppFieldsHistory h
        ON h.AppFieldId = f.Id AND h.RevisionNo = f.NewRevisionNo)
        THROW 51729, 'The next header field revision already exists.', 1;

    CREATE TABLE #HistoryFields (Id bigint NOT NULL PRIMARY KEY);
    INSERT #HistoryFields SELECT Id FROM #Settings UNION SELECT Id FROM #ChangedFields;
    CREATE TABLE #CreatedHistory (Id bigint NOT NULL, AppFieldId bigint NOT NULL);
    DECLARE @historyColumns nvarchar(max), @historyValues nvarchar(max), @historySql nvarchar(max);
    SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id),
           @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id)
    FROM sys.columns c JOIN sys.columns h
      ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
    WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';
    SET @historySql = N'TRUNCATE TABLE #CreatedHistory;
        INSERT dbo.AppFieldsHistory (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
        OUTPUT inserted.Id, inserted.AppFieldId INTO #CreatedHistory
        SELECT f.Id, f.CurrentRevisionNo,
            CASE WHEN f.CurrentRevisionNo = N''00'' THEN N''Create'' ELSE N''Edit'' END,
            SYSUTCDATETIME(), ' + @historyValues + N'
        FROM dbo.AppFields f JOIN #HistoryFields target ON target.Id = f.Id
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
            WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);
        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #CreatedHistory h JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = h.AppFieldId;';
    -- Preserve missing current history before changing any setting values.
    EXEC sys.sp_executesql @historySql;

    UPDATE v SET [Value] = d.[Value], SettingFieldCode = d.SettingFieldCode,
        SettingFieldName = d.SettingFieldName
    FROM dbo.AppFieldSettingValues v JOIN #DesiredValues d
      ON d.AppFieldId = v.AppFieldId AND d.SettingFieldId = v.SettingFieldId
    JOIN #ChangedFields f ON f.Id = v.AppFieldId;
    INSERT dbo.AppFieldSettingValues
        (TenantId, AppFieldId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
    SELECT NULL, d.AppFieldId, d.SettingFieldId, d.SettingFieldCode, d.SettingFieldName, d.[Value]
    FROM #DesiredValues d WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues v
        WHERE v.AppFieldId = d.AppFieldId AND v.SettingFieldId = d.SettingFieldId);
    UPDATE f SET CurrentRevisionNo = c.NewRevisionNo, LastModificationTime = SYSUTCDATETIME()
    FROM dbo.AppFields f JOIN #ChangedFields c ON c.Id = f.Id;
    DELETE FROM #HistoryFields;
    INSERT #HistoryFields SELECT Id FROM #ChangedFields;
    EXEC sys.sp_executesql @historySql;

    -- Refresh the selected header assignments, retaining every current setting value.
    -- A rerun leaves snapshots alone once the requested values are present.
    SELECT a.Id INTO #SyncSnapshots
    FROM dbo.AppTableFields a JOIN #HeaderFields f ON f.Id = a.SourceAppFieldId
    JOIN dbo.AppFields definition ON definition.Id = f.Id AND definition.FieldDefinitionKey = a.FieldDefinitionKey
    WHERE a.TenantId IS NULL AND a.SycObjectId = @headerId
      AND (EXISTS (SELECT 1 FROM #ChangedFields c WHERE c.Id = f.Id)
        OR EXISTS (SELECT 1 FROM #DesiredValues d WHERE d.AppFieldId = f.Id
            AND (SELECT COUNT(*) FROM dbo.AppTableFieldSettingValues v
                WHERE v.AppTableFieldId = a.Id AND v.SettingFieldId = d.SettingFieldId) <> 1)
        OR EXISTS (SELECT 1 FROM #DesiredValues d WHERE d.AppFieldId = f.Id
            AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFieldSettingValues v
                WHERE v.AppTableFieldId = a.Id AND v.SettingFieldId = d.SettingFieldId
                  AND v.[Value] = d.[Value] AND v.SettingFieldCode = d.SettingFieldCode
                  AND v.SettingFieldName = d.SettingFieldName)));
    SET @sql = N'UPDATE a SET ' + @snapshotUpdates + N',
        AppliedRevisionNo = f.CurrentRevisionNo, FieldTenantId = f.TenantId,
        DefinitionSycObjectId = f.SycObjectId, FieldCreationTime = f.CreationTime,
        FieldCreatorUserId = f.CreatorUserId, FieldLastModificationTime = f.LastModificationTime,
        FieldLastModifierUserId = f.LastModifierUserId, FieldIsDeleted = f.IsDeleted,
        FieldDeleterUserId = f.DeleterUserId, FieldDeletionTime = f.DeletionTime
        FROM dbo.AppTableFields a JOIN #SyncSnapshots target ON target.Id = a.Id
        JOIN dbo.AppFields f ON f.Id = a.SourceAppFieldId;';
    EXEC sys.sp_executesql @sql;
    DELETE v FROM dbo.AppTableFieldSettingValues v JOIN #SyncSnapshots a ON a.Id = v.AppTableFieldId;
    INSERT dbo.AppTableFieldSettingValues
        (AppTableFieldId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
    SELECT a.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
    FROM dbo.AppTableFields a JOIN #SyncSnapshots target ON target.Id = a.Id
    JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = a.SourceAppFieldId;

    DROP TABLE #SyncSnapshots;
    DROP TABLE #CreatedHistory;
    DROP TABLE #HistoryFields;
    DROP TABLE #ChangedFields;
    DROP TABLE #DesiredValues;
    DROP TABLE #HeaderFields;
    DROP TABLE #HeaderNames;
    DROP TABLE #Settings;
    DROP TABLE #MissingSettings;
    DROP TABLE #SettingSpecs;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

-- Field Manager metadata for the Date--Date picker field type.
-- Five Date picker-owned definitions and five AppTableFields snapshots.
-- Ordinary field values are backfilled into AppFieldSettingValues by the dynamic settings migration/seed.
-- Rerunnable: existing definitions, revisions, and applied snapshots are preserved.
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

    IF OBJECT_ID(N'dbo.AppFields', N'U') IS NULL
        OR OBJECT_ID(N'dbo.AppFieldsHistory', N'U') IS NULL
        OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
        OR COL_LENGTH(N'dbo.AppFields', N'FieldDefinitionKey') IS NULL
        OR COL_LENGTH(N'dbo.AppTableFields', N'SourceAppFieldId') IS NULL
        OR COL_LENGTH(N'dbo.AppFieldsHistory', N'FieldDefinitionKey') IS NULL
        THROW 51300, 'Apply the current Field Manager schema before seeding Date--Date picker settings.', 1;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51301, 'Expected one active Field object.', 1;
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0) <> 1
        THROW 51302, 'Expected one Field type root.', 1;
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'DP' AND Name = N'Date--Date picker' AND IsDeleted = 0) <> 1
        THROW 51303, 'Expected one Date--Date picker field type.', 1;
    DECLARE @dateTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'DP' AND Name = N'Date--Date picker' AND IsDeleted = 0);

    -- DateFormat and the date-typed DefaultValue were previously seeded with
    -- no owning type. The Boolean settings were shared with String--Textbox;
    -- those receive independent Date picker definitions below.
    UPDATE f SET EntitySycObjectId = @dateTypeId
    FROM dbo.AppFields AS f
    JOIN dbo.AppTableFields AS a ON a.SourceAppFieldId = f.Id
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @dateTypeId
      AND a.FieldName IN (N'DateFormat', N'DefaultValue')
      AND f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
      AND f.EntitySycObjectId IS NULL AND f.IsDeleted = 0;

    UPDATE h SET EntitySycObjectId = @dateTypeId
    FROM dbo.AppFieldsHistory AS h
    JOIN dbo.AppFields AS f ON f.Id = h.AppFieldId
    WHERE f.SycObjectId = @fieldObjectId
      AND f.EntitySycObjectId = @dateTypeId
      AND f.FieldName IN (N'DateFormat', N'DefaultValue')
      AND h.EntitySycObjectId IS NULL;

    UPDATE a SET EntitySycObjectId = @dateTypeId
    FROM dbo.AppTableFields AS a
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @dateTypeId
      AND a.FieldName IN (N'DateFormat', N'DefaultValue')
      AND a.EntitySycObjectId IS NULL;

    CREATE TABLE #SeedDatePickerSettings
    (
        Ordinal int NOT NULL PRIMARY KEY,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
        TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        [Section] nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        AllowNull bit NOT NULL,
        Required bit NOT NULL,
        DefaultValue nvarchar(2000) COLLATE DATABASE_DEFAULT NULL
    );
    INSERT #SeedDatePickerSettings (Ordinal, FieldName, TypeCode, [Section], AllowNull, Required, DefaultValue)
    VALUES
        (1, N'AllowNull',    N'BOOLEAN', N'AdvancedInformation', 0, 1, N'false'),
        (2, N'DateFormat',   N'SD',      N'AdvancedInformation', 1, 0, NULL),
        (3, N'DefaultValue', N'DP',      N'AdvancedInformation', 1, 0, NULL),
        (4, N'Required',     N'BOOLEAN', N'AdvancedInformation', 0, 1, N'false'),
        (5, N'Visible',      N'BOOLEAN', N'ExtraAttributes',     0, 1, N'true');

    IF EXISTS (SELECT 1 FROM #SeedDatePickerSettings s
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.SycEntityObjectTypes t
            WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
              AND t.Code = s.TypeCode AND t.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51304, 'A setting field data type is missing or duplicated.', 1;

    IF EXISTS (SELECT 1 FROM #SeedDatePickerSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
            AND f.TenantId IS NULL AND f.FieldName = s.FieldName
            AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @dateTypeId
            AND f.IsDeleted = 0
        WHERE f.FieldLevelCode <> N'System'
           OR f.IsStandard <> 1 OR f.IsExtraField <> 0)
        THROW 51305, 'An existing Field Manager setting definition conflicts with the seed.', 1;

    ;WITH Missing AS
    (
        SELECT s.Ordinal, s.FieldName, s.TypeCode, s.[Section],
               s.AllowNull, s.Required, s.DefaultValue, t.Id AS FieldTypeId,
               ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY s.Ordinal) AS NewOrdinal
        FROM #SeedDatePickerSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
              AND f.FieldName = s.FieldName AND f.FieldTypeId = t.Id
              AND f.EntitySycObjectId = @dateTypeId AND f.IsDeleted = 0)
    )
    SELECT m.*,
           COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
               FROM dbo.AppFields f WHERE f.FieldTypeId = m.FieldTypeId
                 AND LEN(f.FieldCode) = 11
                 AND SUBSTRING(f.FieldCode, 3, 1) IN (N'S', N'A', N'T')), 0)
               + m.NewOrdinal AS NextSequence
    INTO #MissingDatePickerSettings
    FROM Missing m;

    IF EXISTS (SELECT 1 FROM #MissingDatePickerSettings WHERE NextSequence > 9999)
        THROW 51306, 'A setting field type has exhausted its four-digit code sequence.', 1;

    INSERT dbo.AppFields
        (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
         Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId,
         FieldLevelCode, FieldStatusCode, TrackingNo, CurrentRevisionNo,
         IsStandard, IsExtraField, IsHidden, AllowNull, [Length], Decimals,
         DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required, Visible,
         Editable, SourceDataType, Usage, CreationTime, CreatorUserId, LastModificationTime,
         LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
    SELECT NULL, NULL, @fieldObjectId, @dateTypeId,
           LEFT(m.TypeCode, 2) + N'S' + LEFT(UPPER(m.FieldName) + N'____', 4)
               + RIGHT(N'0000' + CONVERT(nvarchar(10), m.NextSequence), 4),
           m.FieldName, N'Field Manager Date--Date picker ' + m.[Section] + N' setting',
           m.FieldTypeId, NULL, NULL, NULL, N'System', N'Active', NULL, N'00',
           1, 0, 0, m.AllowNull, NULL, NULL, m.DefaultValue,
           NULL, NULL, 0, m.Required, 1, 1,
           CASE WHEN m.FieldName = N'DateFormat' THEN N'dropDownList' ELSE NULL END,
           N'FieldManager.' + m.[Section],
           SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
    FROM #MissingDatePickerSettings m;

    IF EXISTS (SELECT 1 FROM #SeedDatePickerSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
              AND f.FieldName = s.FieldName AND f.FieldTypeId = t.Id
              AND f.EntitySycObjectId = @dateTypeId AND f.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51307, 'Expected one active Field Manager definition per Date--Date picker setting.', 1;

    -- Move only the Date picker assignments away from the old shared Boolean
    -- definitions. String--Textbox keeps its original fields and snapshots.
    UPDATE a SET
        FieldDefinitionKey = f.FieldDefinitionKey,
        FieldCode = f.FieldCode,
        AppliedRevisionNo = f.CurrentRevisionNo,
        SourceAppFieldId = f.Id,
        FieldTenantId = f.TenantId,
        SourceFieldId = f.SourceFieldId,
        DefinitionSycObjectId = f.SycObjectId,
        EntitySycObjectId = f.EntitySycObjectId,
        Description = f.Description,
        FieldCreationTime = f.CreationTime,
        FieldCreatorUserId = f.CreatorUserId,
        FieldLastModificationTime = f.LastModificationTime,
        FieldLastModifierUserId = f.LastModifierUserId,
        FieldIsDeleted = f.IsDeleted,
        FieldDeleterUserId = f.DeleterUserId,
        FieldDeletionTime = f.DeletionTime
    FROM dbo.AppTableFields AS a
    JOIN #SeedDatePickerSettings AS s ON s.FieldName = a.FieldName
    JOIN dbo.SycEntityObjectTypes AS t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
    JOIN dbo.AppFields AS f ON f.SycObjectId = @fieldObjectId
        AND f.EntitySycObjectId = @dateTypeId AND f.TenantId IS NULL
        AND f.FieldName = s.FieldName AND f.FieldTypeId = t.Id AND f.IsDeleted = 0
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @dateTypeId AND a.TenantId IS NULL
      AND a.FieldDefinitionKey <> f.FieldDefinitionKey;

    IF EXISTS (SELECT 1 FROM #SeedDatePickerSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
            AND f.TenantId IS NULL AND f.FieldName = s.FieldName
            AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @dateTypeId
            AND f.IsDeleted = 0
        JOIN dbo.AppTableFields a ON a.SycObjectId = @fieldObjectId
            AND a.SycEntityObjectTypeId = @dateTypeId AND a.TenantId IS NULL
            AND a.FieldName = s.FieldName
        WHERE a.FieldDefinitionKey <> f.FieldDefinitionKey)
        THROW 51308, 'A Date--Date picker setting is linked to a different field definition.', 1;

    INSERT dbo.AppTableFields
        (TenantId, FieldDefinitionKey, FieldCode, AppliedRevisionNo, SycObjectId,
         SycEntityObjectTypeId, SourceAppFieldId, FieldTenantId, SourceFieldId,
         DefinitionSycObjectId, EntitySycObjectId, FieldName, Description,
         FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId, FieldLevelCode,
         FieldStatusCode, TrackingNo, IsStandard, IsExtraField, IsHidden,
         AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
         AllowMultiSelect, Required, Visible, Editable, SourceAttributeId,
         SourceDataType, SourceEntityObjectTypeId, EntityObjectTypeCode, Usage,
         IsLookup, IsVariation, IsAdvancedSearch, AcceptMultipleValues, AllowAddNew,
         FieldCreationTime, FieldCreatorUserId, FieldLastModificationTime,
         FieldLastModifierUserId, FieldIsDeleted, FieldDeleterUserId,
         FieldDeletionTime, CreationTime, CreatorUserId)
    SELECT f.TenantId, f.FieldDefinitionKey, f.FieldCode, f.CurrentRevisionNo,
           @fieldObjectId, @dateTypeId, f.Id, f.TenantId, f.SourceFieldId,
           f.SycObjectId, f.EntitySycObjectId, f.FieldName, f.Description,
           f.FieldTypeId, f.WidgetTypeId, f.FieldLevelId, f.FieldStatusId,
           f.FieldLevelCode, f.FieldStatusCode, f.TrackingNo, f.IsStandard,
           f.IsExtraField, f.IsHidden, f.AllowNull, f.[Length],
           f.Decimals, f.DefaultValue, f.DateFormat, f.TimeFormat,
           f.AllowMultiSelect, f.Required, f.Visible, f.Editable,
           f.SourceAttributeId, f.SourceDataType, f.SourceEntityObjectTypeId,
           f.EntityObjectTypeCode, f.Usage, f.IsLookup, f.IsVariation,
           f.IsAdvancedSearch, f.AcceptMultipleValues, f.AllowAddNew,
           f.CreationTime, f.CreatorUserId, f.LastModificationTime,
           f.LastModifierUserId, f.IsDeleted, f.DeleterUserId, f.DeletionTime,
           SYSUTCDATETIME(), NULL
    FROM #SeedDatePickerSettings s
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
    JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
        AND f.TenantId IS NULL AND f.FieldName = s.FieldName
        AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @dateTypeId
        AND f.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.FieldDefinitionKey = f.FieldDefinitionKey
          AND a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @dateTypeId);

    IF EXISTS (SELECT 1 FROM #SeedDatePickerSettings s
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppTableFields a
            WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
              AND a.SycEntityObjectTypeId = @dateTypeId
              AND a.FieldName = s.FieldName) matches
        WHERE matches.Cnt <> 1)
        THROW 51309, 'Expected one Date--Date picker assignment per setting.', 1;

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
    FROM dbo.AppFields f JOIN #SeedDatePickerSettings s ON s.FieldName = f.FieldName
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @objectId
        AND t.Code = s.TypeCode AND t.Id = f.FieldTypeId AND t.IsDeleted = 0
    WHERE f.SycObjectId = @objectId AND f.EntitySycObjectId = @typeId
      AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
          WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
    EXEC sys.sp_executesql @historySql,
        N'@objectId bigint, @typeId bigint',
        @objectId = @fieldObjectId, @typeId = @dateTypeId;

    DROP TABLE #MissingDatePickerSettings;
    DROP TABLE #SeedDatePickerSettings;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT (SELECT COUNT(*) FROM dbo.AppFields f
        JOIN dbo.SydObjects o ON o.Id = f.SycObjectId
        JOIN dbo.SycEntityObjectTypes t ON t.Id = f.FieldTypeId
        JOIN (VALUES (N'AllowNull',N'BOOLEAN'), (N'DateFormat',N'SD'),
                     (N'DefaultValue',N'DP'), (N'Required',N'BOOLEAN'),
                     (N'Visible',N'BOOLEAN')) s(FieldName,TypeCode)
          ON s.FieldName = f.FieldName AND s.TypeCode = t.Code
        WHERE o.Code = N'FIELD' AND f.EntitySycObjectId =
            (SELECT Id FROM dbo.SycEntityObjectTypes WHERE ObjectId = o.Id
             AND Code = N'DP' AND Name = N'Date--Date picker' AND IsDeleted = 0)
          AND f.TenantId IS NULL AND f.IsDeleted = 0)
          AS SettingDefinitions,
       (SELECT COUNT(*) FROM dbo.AppTableFields a
        JOIN dbo.SydObjects o ON o.Id = a.SycObjectId
        JOIN dbo.SycEntityObjectTypes t ON t.Id = a.SycEntityObjectTypeId
        WHERE o.Code = N'FIELD' AND t.Code = N'DP' AND a.TenantId IS NULL
          AND a.FieldName IN (N'AllowNull', N'DateFormat', N'DefaultValue', N'Required', N'Visible'))
          AS DatePickerAssignments;

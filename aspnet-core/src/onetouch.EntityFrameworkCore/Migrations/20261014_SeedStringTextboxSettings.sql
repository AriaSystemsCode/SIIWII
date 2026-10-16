-- Field Manager metadata for the String--Textbox field type.
-- Six type-owned AppFields definitions and six AppTableFields snapshots.
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
        THROW 51200, 'Apply the current Field Manager schema before seeding String--Textbox settings.', 1;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51201, 'Expected one active Field object.', 1;
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0) <> 1
        THROW 51202, 'Expected one Field type root.', 1;
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND Name = N'String--Textbox' AND IsDeleted = 0) <> 1
        THROW 51203, 'Expected one String--Textbox field type.', 1;
    DECLARE @stringTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND Name = N'String--Textbox' AND IsDeleted = 0);

    -- Older seeds left these definitions unowned while assigning them to ST.
    UPDATE f SET EntitySycObjectId = @stringTypeId
    FROM dbo.AppFields AS f
    JOIN dbo.AppTableFields AS a ON a.SourceAppFieldId = f.Id
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @stringTypeId
      AND f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
      AND f.EntitySycObjectId IS NULL AND f.IsDeleted = 0;

    UPDATE h SET EntitySycObjectId = @stringTypeId
    FROM dbo.AppFieldsHistory AS h
    JOIN dbo.AppFields AS f ON f.Id = h.AppFieldId
    JOIN dbo.AppTableFields AS a ON a.SourceAppFieldId = f.Id
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @stringTypeId
      AND f.EntitySycObjectId = @stringTypeId
      AND h.EntitySycObjectId IS NULL;

    UPDATE a SET EntitySycObjectId = @stringTypeId
    FROM dbo.AppTableFields AS a
    JOIN dbo.AppFields AS f ON f.Id = a.SourceAppFieldId
    WHERE a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @stringTypeId
      AND f.EntitySycObjectId = @stringTypeId
      AND a.EntitySycObjectId IS NULL;

    CREATE TABLE #SeedStringTextboxSettings
    (
        Ordinal int NOT NULL PRIMARY KEY,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
        TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        [Section] nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        AllowNull bit NOT NULL,
        Required bit NOT NULL,
        DefaultValue nvarchar(2000) COLLATE DATABASE_DEFAULT NULL
    );
    INSERT #SeedStringTextboxSettings (Ordinal, FieldName, TypeCode, [Section], AllowNull, Required, DefaultValue)
    VALUES
        (1, N'AllowNull',    N'BOOLEAN', N'AdvancedInformation', 0, 1, N'false'),
        (2, N'Length',       N'IN',      N'AdvancedInformation', 1, 0, NULL),
        (3, N'DefaultValue', N'ST',      N'AdvancedInformation', 1, 0, NULL),
        (4, N'Required',     N'BOOLEAN', N'AdvancedInformation', 0, 1, N'false'),
        (5, N'Visible',      N'BOOLEAN', N'ExtraAttributes',     0, 1, N'true'),
        (6, N'Editable',     N'BOOLEAN', N'ExtraAttributes',     0, 1, N'true');

    IF EXISTS (SELECT 1 FROM #SeedStringTextboxSettings s
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.SycEntityObjectTypes t
            WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
              AND t.Code = s.TypeCode AND t.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51204, 'A setting field data type is missing or duplicated.', 1;

    IF EXISTS (SELECT 1 FROM #SeedStringTextboxSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
            AND f.TenantId IS NULL AND f.FieldName = s.FieldName
            AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @stringTypeId
            AND f.IsDeleted = 0
        WHERE f.FieldLevelCode <> N'System'
           OR f.IsStandard <> 1 OR f.IsExtraField <> 0)
        THROW 51205, 'An existing Field Manager setting definition conflicts with the seed.', 1;

    ;WITH Missing AS
    (
        SELECT s.Ordinal, s.FieldName, s.TypeCode, s.[Section],
               s.AllowNull, s.Required, s.DefaultValue, t.Id AS FieldTypeId,
               ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY s.Ordinal) AS NewOrdinal
        FROM #SeedStringTextboxSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
              AND f.FieldName = s.FieldName AND f.FieldTypeId = t.Id
              AND f.EntitySycObjectId = @stringTypeId AND f.IsDeleted = 0)
    )
    SELECT m.*,
           COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
               FROM dbo.AppFields f WHERE f.FieldTypeId = m.FieldTypeId
                 AND LEN(f.FieldCode) = 11
                 AND SUBSTRING(f.FieldCode, 3, 1) IN (N'S', N'A', N'T')), 0)
               + m.NewOrdinal AS NextSequence
    INTO #MissingStringTextboxSettings
    FROM Missing m;

    IF EXISTS (SELECT 1 FROM #MissingStringTextboxSettings WHERE NextSequence > 9999)
        THROW 51206, 'A setting field type has exhausted its four-digit code sequence.', 1;

    INSERT dbo.AppFields
        (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
         Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId,
         FieldLevelCode, FieldStatusCode, TrackingNo, CurrentRevisionNo,
         IsStandard, IsExtraField, IsHidden, AllowNull, [Length], Decimals,
         DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required, Visible,
         Editable, Usage, CreationTime, CreatorUserId, LastModificationTime,
         LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
    SELECT NULL, NULL, @fieldObjectId, @stringTypeId,
           LEFT(m.TypeCode, 2) + N'S' + LEFT(UPPER(m.FieldName) + N'____', 4)
               + RIGHT(N'0000' + CONVERT(nvarchar(10), m.NextSequence), 4),
           m.FieldName, N'Field Manager String--Textbox ' + m.[Section] + N' setting',
           m.FieldTypeId, NULL, NULL, NULL, N'System', N'Active', NULL, N'00',
           1, 0, 0, m.AllowNull, NULL, NULL, m.DefaultValue,
           NULL, NULL, 0, m.Required, 1, 1, N'FieldManager.' + m.[Section],
           SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
    FROM #MissingStringTextboxSettings m;

    IF EXISTS (SELECT 1 FROM #SeedStringTextboxSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.TenantId IS NULL
              AND f.FieldName = s.FieldName AND f.FieldTypeId = t.Id
              AND f.EntitySycObjectId = @stringTypeId AND f.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51207, 'Expected one active Field Manager definition per String--Textbox setting.', 1;

    IF EXISTS (SELECT 1 FROM #SeedStringTextboxSettings s
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
            AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
        JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
            AND f.TenantId IS NULL AND f.FieldName = s.FieldName
            AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @stringTypeId
            AND f.IsDeleted = 0
        JOIN dbo.AppTableFields a ON a.SycObjectId = @fieldObjectId
            AND a.SycEntityObjectTypeId = @stringTypeId AND a.TenantId IS NULL
            AND a.FieldName = s.FieldName
        WHERE a.FieldDefinitionKey <> f.FieldDefinitionKey)
        THROW 51208, 'A String--Textbox setting is linked to a different field definition.', 1;

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
           @fieldObjectId, @stringTypeId, f.Id, f.TenantId, f.SourceFieldId,
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
    FROM #SeedStringTextboxSettings s
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
    JOIN dbo.AppFields f ON f.SycObjectId = @fieldObjectId
        AND f.TenantId IS NULL AND f.FieldName = s.FieldName
        AND f.FieldTypeId = t.Id AND f.EntitySycObjectId = @stringTypeId
        AND f.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.FieldDefinitionKey = f.FieldDefinitionKey
          AND a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @stringTypeId);

    IF EXISTS (SELECT 1 FROM #SeedStringTextboxSettings s
        OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppTableFields a
            WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
              AND a.SycEntityObjectTypeId = @stringTypeId
              AND a.FieldName = s.FieldName) matches
        WHERE matches.Cnt <> 1)
        THROW 51209, 'Expected one String--Textbox assignment per setting.', 1;

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
    FROM dbo.AppFields f JOIN #SeedStringTextboxSettings s ON s.FieldName = f.FieldName
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @objectId
        AND t.Code = s.TypeCode AND t.Id = f.FieldTypeId AND t.IsDeleted = 0
    WHERE f.SycObjectId = @objectId AND f.EntitySycObjectId = @typeId
      AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
          WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
    EXEC sys.sp_executesql @historySql,
        N'@objectId bigint, @typeId bigint',
        @objectId = @fieldObjectId, @typeId = @stringTypeId;

    DROP TABLE #MissingStringTextboxSettings;
    DROP TABLE #SeedStringTextboxSettings;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

SELECT (SELECT COUNT(*) FROM dbo.AppFields f
        JOIN dbo.SydObjects o ON o.Id = f.SycObjectId
        JOIN dbo.SycEntityObjectTypes t ON t.Id = f.FieldTypeId
        JOIN (VALUES (N'AllowNull',N'BOOLEAN'), (N'Length',N'IN'),
                     (N'DefaultValue',N'ST'), (N'Required',N'BOOLEAN'),
                     (N'Visible',N'BOOLEAN'), (N'Editable',N'BOOLEAN')) s(FieldName,TypeCode)
          ON s.FieldName = f.FieldName AND s.TypeCode = t.Code
        WHERE o.Code = N'FIELD' AND f.EntitySycObjectId =
            (SELECT Id FROM dbo.SycEntityObjectTypes WHERE ObjectId = o.Id
             AND Code = N'ST' AND Name = N'String--Textbox' AND IsDeleted = 0)
          AND f.TenantId IS NULL AND f.IsDeleted = 0)
          AS SettingDefinitions,
       (SELECT COUNT(*) FROM dbo.AppTableFields a JOIN dbo.SydObjects o ON o.Id = a.SycObjectId
        JOIN dbo.SycEntityObjectTypes t ON t.Id = a.SycEntityObjectTypeId
        WHERE o.Code = N'FIELD' AND t.Code = N'ST' AND a.TenantId IS NULL
          AND a.FieldName IN (N'AllowNull', N'Length', N'DefaultValue', N'Required', N'Visible', N'Editable'))
          AS StringTextboxAssignments;

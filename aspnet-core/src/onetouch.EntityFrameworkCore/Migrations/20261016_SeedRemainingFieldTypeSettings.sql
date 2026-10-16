-- Field Manager settings for Numeric input, Currency, Dropdown and Checkbox.
-- Each field type owns independent AppFields definitions and AppTableFields snapshots.
-- The type XML is replaced with the settings in the Iteration 51 design.
-- Safe to rerun: existing definitions, revisions and matching snapshots are kept.
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
        OR COL_LENGTH(N'dbo.AppFields', N'EntitySycObjectId') IS NULL
        OR COL_LENGTH(N'dbo.AppTableFields', N'SourceAppFieldId') IS NULL
        OR COL_LENGTH(N'dbo.AppFieldsHistory', N'FieldDefinitionKey') IS NULL
        THROW 51400, 'Apply the current Field Manager schema before seeding field type settings.', 1;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51401, 'Expected one active Field object.', 1;
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0) <> 1
        THROW 51402, 'Expected one active Field type root.', 1;
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0);

    CREATE TABLE #OwnerTypes
    (
        TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY,
        TypeName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL,
        TypeId bigint NULL
    );
    INSERT #OwnerTypes (TypeCode, TypeName) VALUES
        (N'IN', N'Integer--Numeric input'),
        (N'IC', N'Integer--Currency'),
        (N'LD', N'List--Dropdown'),
        (N'BOOLEAN', N'Boolean--Checkbox');

    UPDATE o SET TypeId = t.Id
    FROM #OwnerTypes AS o
    JOIN dbo.SycEntityObjectTypes AS t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = o.TypeCode
        AND t.Name = o.TypeName AND t.IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM #OwnerTypes WHERE TypeId IS NULL)
       OR EXISTS (SELECT 1 FROM #OwnerTypes o JOIN dbo.SycEntityObjectTypes t
          ON t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
         AND t.Code = o.TypeCode AND t.Name = o.TypeName AND t.IsDeleted = 0
          GROUP BY o.TypeCode HAVING COUNT(*) <> 1)
        THROW 51403, 'A required Field Manager field type is missing or duplicated.', 1;

    CREATE TABLE #Settings
    (
        OwnerCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        Ordinal int NOT NULL,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL,
        XmlName nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        SettingTypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        XmlDataType nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        [Section] nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        DefaultValue nvarchar(2000) COLLATE DATABASE_DEFAULT NULL,
        AllowNull bit NOT NULL,
        Required bit NOT NULL,
        OwnerTypeId bigint NULL,
        FieldTypeId bigint NULL,
        AttributeId bigint NULL,
        CONSTRAINT PK_SeedRemainingSettings PRIMARY KEY (OwnerCode, Ordinal),
        CONSTRAINT UQ_SeedRemainingSettings UNIQUE (OwnerCode, FieldName)
    );
    INSERT #Settings (OwnerCode, Ordinal, FieldName, XmlName,
        SettingTypeCode, XmlDataType, [Section], DefaultValue, AllowNull, Required)
    VALUES
        (N'IN', 1, N'AllowNull', N'Allow Null', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'IN', 2, N'Decimals', N'Decimals', N'IN', N'Numeric', N'AdvancedInformation', N'0', 1, 0),
        (N'IN', 3, N'DefaultValue', N'Default Value', N'IN', N'Numeric', N'AdvancedInformation', NULL, 1, 0),
        (N'IN', 4, N'Required', N'Required', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'IN', 5, N'Visible', N'Visible', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1),
        (N'IN', 6, N'Editable', N'Editable', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1),
        (N'IC', 1, N'AllowNull', N'Allow Null', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'IC', 2, N'Decimals', N'Decimals', N'IN', N'Numeric', N'AdvancedInformation', N'2', 1, 0),
        (N'IC', 3, N'DefaultValue', N'Default Value', N'IC', N'Numeric', N'AdvancedInformation', NULL, 1, 0),
        (N'IC', 4, N'Required', N'Required', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'IC', 5, N'Visible', N'Visible', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1),
        (N'IC', 6, N'Editable', N'Editable', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1),
        (N'LD', 1, N'AllowNull', N'Allow Null', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'LD', 2, N'AllowMultiSelect', N'Multi-Select', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'LD', 3, N'DropdownOptions', N'Dropdown Options', N'LD', N'dropDownList', N'AdvancedInformation', NULL, 1, 0),
        (N'LD', 4, N'Required', N'Required', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'LD', 5, N'Visible', N'Visible', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1),
        (N'BOOLEAN', 1, N'DefaultValue', N'Default Value', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 1, 0),
        (N'BOOLEAN', 2, N'Required', N'Required', N'BOOLEAN', N'boolean', N'AdvancedInformation', N'false', 0, 1),
        (N'BOOLEAN', 3, N'Visible', N'Visible', N'BOOLEAN', N'boolean', N'ExtraAttributes', N'true', 0, 1);

    UPDATE s SET OwnerTypeId = o.TypeId, FieldTypeId = t.Id
    FROM #Settings AS s
    JOIN #OwnerTypes AS o ON o.TypeCode = s.OwnerCode
    LEFT JOIN dbo.SycEntityObjectTypes AS t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.SettingTypeCode
        AND t.IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM #Settings WHERE FieldTypeId IS NULL)
       OR EXISTS (SELECT 1 FROM #Settings s JOIN dbo.SycEntityObjectTypes t
          ON t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
         AND t.Code = s.SettingTypeCode AND t.IsDeleted = 0
          GROUP BY s.OwnerCode, s.Ordinal HAVING COUNT(*) <> 1)
        THROW 51404, 'A setting value type is missing or duplicated.', 1;

    IF EXISTS (SELECT 1 FROM #Settings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = s.OwnerTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        WHERE f.FieldTypeId <> s.FieldTypeId OR f.FieldLevelCode <> N'System'
           OR f.IsStandard <> 1 OR f.IsExtraField <> 0)
        THROW 51405, 'An existing setting definition conflicts with the seed.', 1;
    IF EXISTS (SELECT 1 FROM #Settings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = s.OwnerTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        GROUP BY s.OwnerCode, s.FieldName HAVING COUNT(*) > 1)
        THROW 51406, 'A field type has duplicate active setting definitions.', 1;

    ;WITH Missing AS
    (
        SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.FieldTypeId
            ORDER BY s.OwnerCode, s.Ordinal) AS NewOrdinal
        FROM #Settings AS s
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = s.OwnerTypeId
              AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0)
    )
    SELECT m.OwnerCode, m.Ordinal, m.FieldName, m.SettingTypeCode,
           m.[Section], m.DefaultValue, m.AllowNull, m.Required,
           m.OwnerTypeId, m.FieldTypeId,
           COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
               FROM dbo.AppFields f WHERE f.FieldTypeId = m.FieldTypeId
                 AND LEN(f.FieldCode) = 11
                 AND SUBSTRING(f.FieldCode, 3, 1) IN (N'S', N'A', N'T')), 0)
               + m.NewOrdinal AS NextSequence
    INTO #MissingSettings FROM Missing AS m;
    IF EXISTS (SELECT 1 FROM #MissingSettings WHERE NextSequence > 9999)
        THROW 51407, 'A setting value type has exhausted its four-digit code sequence.', 1;

    INSERT dbo.AppFields
        (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
         Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId,
         FieldLevelCode, FieldStatusCode, TrackingNo, CurrentRevisionNo,
         IsStandard, IsExtraField, IsHidden, AllowNull, [Length], Decimals,
         DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required, Visible,
         Editable, Usage, CreationTime, CreatorUserId, LastModificationTime,
         LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
    SELECT NULL, NULL, @fieldObjectId, m.OwnerTypeId,
           LEFT(m.SettingTypeCode, 2) + N'S' + LEFT(UPPER(m.FieldName) + N'____', 4)
               + RIGHT(N'0000' + CONVERT(nvarchar(10), m.NextSequence), 4),
           m.FieldName, N'Field Manager ' + o.TypeName + N' ' + m.[Section] + N' setting',
           m.FieldTypeId, NULL, NULL, NULL, N'System', N'Active', NULL, N'00',
           1, 0, 0, m.AllowNull, NULL, NULL, m.DefaultValue,
           NULL, NULL, 0, m.Required, 1, 1, N'FieldManager.' + m.[Section],
           SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
    FROM #MissingSettings AS m JOIN #OwnerTypes AS o ON o.TypeId = m.OwnerTypeId;

    IF EXISTS (SELECT 1 FROM #Settings s OUTER APPLY
        (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
         WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = s.OwnerTypeId
           AND f.TenantId IS NULL AND f.FieldName = s.FieldName
           AND f.FieldTypeId = s.FieldTypeId AND f.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51408, 'Expected one active definition per field type setting.', 1;

    -- Only a legacy assignment pointing at another definition is repointed.
    -- Matching snapshots retain their applied revision and values.
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
        FieldTypeId = f.FieldTypeId,
        WidgetTypeId = f.WidgetTypeId,
        FieldLevelId = f.FieldLevelId,
        FieldStatusId = f.FieldStatusId,
        FieldLevelCode = f.FieldLevelCode,
        FieldStatusCode = f.FieldStatusCode,
        TrackingNo = f.TrackingNo,
        IsStandard = f.IsStandard,
        IsExtraField = f.IsExtraField,
        IsHidden = f.IsHidden,
        AllowNull = f.AllowNull,
        [Length] = f.[Length],
        Decimals = f.Decimals,
        DefaultValue = f.DefaultValue,
        DateFormat = f.DateFormat,
        TimeFormat = f.TimeFormat,
        AllowMultiSelect = f.AllowMultiSelect,
        Required = f.Required,
        Visible = f.Visible,
        Editable = f.Editable,
        SourceAttributeId = f.SourceAttributeId,
        SourceDataType = f.SourceDataType,
        SourceEntityObjectTypeId = f.SourceEntityObjectTypeId,
        EntityObjectTypeCode = f.EntityObjectTypeCode,
        Usage = f.Usage,
        IsLookup = f.IsLookup,
        IsVariation = f.IsVariation,
        IsAdvancedSearch = f.IsAdvancedSearch,
        AcceptMultipleValues = f.AcceptMultipleValues,
        AllowAddNew = f.AllowAddNew,
        FieldCreationTime = f.CreationTime,
        FieldCreatorUserId = f.CreatorUserId,
        FieldLastModificationTime = f.LastModificationTime,
        FieldLastModifierUserId = f.LastModifierUserId,
        FieldIsDeleted = f.IsDeleted,
        FieldDeleterUserId = f.DeleterUserId,
        FieldDeletionTime = f.DeletionTime
    FROM dbo.AppTableFields AS a
    JOIN #Settings AS s ON s.OwnerTypeId = a.SycEntityObjectTypeId
        AND s.FieldName = a.FieldName
    JOIN dbo.AppFields AS f ON f.SycObjectId = @fieldObjectId
        AND f.EntitySycObjectId = s.OwnerTypeId AND f.TenantId IS NULL
        AND f.FieldName = s.FieldName AND f.FieldTypeId = s.FieldTypeId AND f.IsDeleted = 0
    WHERE a.SycObjectId = @fieldObjectId AND a.TenantId IS NULL
      AND a.FieldDefinitionKey <> f.FieldDefinitionKey;

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
           @fieldObjectId, s.OwnerTypeId, f.Id, f.TenantId, f.SourceFieldId,
           f.SycObjectId, f.EntitySycObjectId, f.FieldName, f.Description,
           f.FieldTypeId, f.WidgetTypeId, f.FieldLevelId, f.FieldStatusId,
           f.FieldLevelCode, f.FieldStatusCode, f.TrackingNo, f.IsStandard,
           f.IsExtraField, f.IsHidden, f.AllowNull, f.[Length], f.Decimals,
           f.DefaultValue, f.DateFormat, f.TimeFormat, f.AllowMultiSelect,
           f.Required, f.Visible, f.Editable, f.SourceAttributeId,
           f.SourceDataType, f.SourceEntityObjectTypeId, f.EntityObjectTypeCode,
           f.Usage, f.IsLookup, f.IsVariation, f.IsAdvancedSearch,
           f.AcceptMultipleValues, f.AllowAddNew, f.CreationTime, f.CreatorUserId,
           f.LastModificationTime, f.LastModifierUserId, f.IsDeleted,
           f.DeleterUserId, f.DeletionTime, SYSUTCDATETIME(), NULL
    FROM #Settings AS s
    JOIN dbo.AppFields AS f ON f.SycObjectId = @fieldObjectId
        AND f.EntitySycObjectId = s.OwnerTypeId AND f.TenantId IS NULL
        AND f.FieldName = s.FieldName AND f.FieldTypeId = s.FieldTypeId AND f.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
          AND a.SycEntityObjectTypeId = s.OwnerTypeId AND a.FieldName = s.FieldName);

    IF EXISTS (SELECT 1 FROM #Settings s OUTER APPLY
        (SELECT COUNT(*) AS Cnt FROM dbo.AppTableFields a
         WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
           AND a.SycEntityObjectTypeId = s.OwnerTypeId
           AND a.FieldName = s.FieldName) matches
        WHERE matches.Cnt <> 1)
        THROW 51409, 'Expected one assignment per field type setting.', 1;
    IF EXISTS (SELECT 1 FROM #Settings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = s.OwnerTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        JOIN dbo.AppTableFields a ON a.SycObjectId = @fieldObjectId
       AND a.SycEntityObjectTypeId = s.OwnerTypeId AND a.TenantId IS NULL
       AND a.FieldName = s.FieldName
        WHERE a.FieldDefinitionKey <> f.FieldDefinitionKey)
        THROW 51410, 'A setting assignment points to a different definition.', 1;

    DECLARE @historyColumns nvarchar(max), @historyValues nvarchar(max), @historySql nvarchar(max);
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
    FROM dbo.AppFields f JOIN #Settings s
      ON s.OwnerTypeId = f.EntitySycObjectId AND s.FieldName = f.FieldName
     AND s.FieldTypeId = f.FieldTypeId
    WHERE f.SycObjectId = @objectId AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
          WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
    EXEC sys.sp_executesql @historySql, N'@objectId bigint', @objectId = @fieldObjectId;

    -- Preserve attribute IDs for matching codes, including the old typo
    -- NoOfDecmials -> Decimals on Numeric input. Allocate new IDs globally.
    DECLARE @lastAttributeId bigint;
    ;WITH Parsed AS
    (
        SELECT TRY_CONVERT(xml, ExtraAttributes) AS AttributesXml
        FROM dbo.SycEntityObjectTypes WHERE ExtraAttributes IS NOT NULL
    )
    SELECT @lastAttributeId = COALESCE(MAX(
        A.Node.value('(AttributeId/text())[1]', 'bigint')), 0)
    FROM Parsed
    CROSS APPLY AttributesXml.nodes(
        '/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node);

    DECLARE @ownerCode nvarchar(50), @ownerTypeId bigint;
    DECLARE @oldAttributes xml, @newAttributes xml;
    DECLARE owner_cursor CURSOR LOCAL FAST_FORWARD FOR
        SELECT TypeCode, TypeId FROM #OwnerTypes ORDER BY TypeCode;
    OPEN owner_cursor;
    FETCH NEXT FROM owner_cursor INTO @ownerCode, @ownerTypeId;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @oldAttributes = TRY_CONVERT(xml, ExtraAttributes)
        FROM dbo.SycEntityObjectTypes WITH (UPDLOCK, HOLDLOCK) WHERE Id = @ownerTypeId;
        IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
            WHERE Id = @ownerTypeId AND ExtraAttributes IS NOT NULL)
            AND @oldAttributes IS NULL
            THROW 51411, 'A field type has invalid ExtraAttributes XML.', 1;
        IF @oldAttributes IS NOT NULL
           AND @oldAttributes.exist('/ItemExtraAttributes/ExtraAttributes') <> 1
            THROW 51412, 'A field type has an unexpected ExtraAttributes XML structure.', 1;

        IF @oldAttributes IS NOT NULL
        BEGIN
            IF EXISTS
            (
                SELECT s.FieldName
                FROM #Settings AS s
                JOIN @oldAttributes.nodes('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node)
                  ON LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = LOWER(s.FieldName)
                  OR (s.OwnerCode = N'IN' AND s.FieldName = N'Decimals'
                      AND LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = N'noofdecmials')
                WHERE s.OwnerCode = @ownerCode
                GROUP BY s.FieldName HAVING COUNT(*) > 1
            ) THROW 51413, 'A field type XML contains duplicate setting codes.', 1;

            UPDATE s SET AttributeId = A.Node.value('(AttributeId/text())[1]', 'bigint')
            FROM #Settings AS s
            JOIN @oldAttributes.nodes('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node)
              ON LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = LOWER(s.FieldName)
              OR (s.OwnerCode = N'IN' AND s.FieldName = N'Decimals'
                  AND LOWER(A.Node.value('(Code/text())[1]', 'nvarchar(100)')) = N'noofdecmials')
            WHERE s.OwnerCode = @ownerCode;
        END;

        ;WITH Missing AS
        (
            SELECT OwnerCode, Ordinal, ROW_NUMBER() OVER (ORDER BY Ordinal) AS SequenceNo
            FROM #Settings WHERE OwnerCode = @ownerCode AND AttributeId IS NULL
        )
        UPDATE s SET AttributeId = @lastAttributeId + m.SequenceNo
        FROM #Settings AS s JOIN Missing AS m
            ON m.OwnerCode = s.OwnerCode AND m.Ordinal = s.Ordinal;
        SELECT @lastAttributeId = CASE WHEN MAX(AttributeId) > @lastAttributeId
            THEN MAX(AttributeId) ELSE @lastAttributeId END
        FROM #Settings WHERE OwnerCode = @ownerCode;

        SELECT @newAttributes =
        (
            SELECT
            (
                SELECT AttributeId, FieldName AS Code, XmlName AS Name,
                       XmlName AS Description, XmlDataType AS DataType,
                       N'' AS Width,
                       CASE WHEN OwnerCode = N'IC' AND FieldName = N'DefaultValue'
                            THEN 2 ELSE 0 END AS Decimals,
                       COALESCE(DefaultValue, N'') AS DefaultValue,
                       N'FieldManager.' + [Section] AS Usage,
                       N'false' AS IsLookup,
                       N'' AS EntityObjectTypeCode,
                       N'false' AS AllowAddNew,
                       N'false' AS AcceptMultipleValues,
                       N'' AS ValidEntries,
                       N'false' AS IsVariation,
                       N'false' AS IsAdvancedSearch
                FROM #Settings WHERE OwnerCode = @ownerCode ORDER BY Ordinal
                FOR XML PATH('ExtraAttribute'), TYPE
            )
            FOR XML PATH('ExtraAttributes'), ROOT('ItemExtraAttributes'), TYPE
        );
        UPDATE dbo.SycEntityObjectTypes
        SET ExtraAttributes = CONVERT(nvarchar(max), @newAttributes)
        WHERE Id = @ownerTypeId;

        FETCH NEXT FROM owner_cursor INTO @ownerCode, @ownerTypeId;
    END;
    CLOSE owner_cursor;
    DEALLOCATE owner_cursor;

    DROP TABLE #MissingSettings;
    DROP TABLE #Settings;
    DROP TABLE #OwnerTypes;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

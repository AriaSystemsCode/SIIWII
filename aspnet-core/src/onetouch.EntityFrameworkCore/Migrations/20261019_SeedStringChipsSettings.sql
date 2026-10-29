-- Add the String--Chips Field Manager type and its two type-owned settings.
-- Rerunnable: existing definitions, revisions and applied snapshots are preserved.
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
        THROW 51500, 'Apply the Field Manager schema before seeding String--Chips.', 1;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51501, 'Expected one active Field object.', 1;
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51502, 'Expected one active Field type root.', 1;
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'BOOLEAN' AND TenantId IS NULL AND IsDeleted = 0) <> 1
        OR (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51503, 'Boolean and String--Textbox value types are required.', 1;
    DECLARE @booleanTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'BOOLEAN' AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @stringTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND TenantId IS NULL AND IsDeleted = 0);

    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'SC'
          AND (ParentId <> @fieldRootId OR Name <> N'String--Chips' OR IsDeleted <> 0))
        THROW 51504, 'An existing SC object type conflicts with String--Chips.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'SC' AND Name = N'String--Chips'
          AND TenantId IS NULL AND IsDeleted = 0)
    BEGIN
        INSERT dbo.SycEntityObjectTypes
            (CreationTime, IsDeleted, Code, Name, ParentId, ObjectId,
             ObjectCode, ParentCode, TenantId, Hidden, IsDefault)
        VALUES
            (SYSUTCDATETIME(), 0, N'SC', N'String--Chips', @fieldRootId,
             @fieldObjectId, N'FIELD', N'FIELD', NULL, 0, 0);
    END;
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'SC' AND Name = N'String--Chips'
          AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51505, 'Expected one active String--Chips type.', 1;
    DECLARE @chipsTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'SC' AND Name = N'String--Chips'
          AND TenantId IS NULL AND IsDeleted = 0);

    CREATE TABLE #ChipsSettings
    (
        Ordinal int NOT NULL PRIMARY KEY,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
        TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        FieldTypeId bigint NOT NULL,
        XmlDataType nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        DefaultValue nvarchar(2000) COLLATE DATABASE_DEFAULT NULL,
        AllowNull bit NOT NULL,
        Required bit NOT NULL,
        AttributeId bigint NULL
    );
    INSERT #ChipsSettings
        (Ordinal, FieldName, TypeCode, FieldTypeId, XmlDataType,
         DefaultValue, AllowNull, Required)
    VALUES
        (1, N'hasOptions', N'BOOLEAN', @booleanTypeId, N'boolean', N'false', 0, 1),
        (2, N'OptionsList', N'SC', @chipsTypeId, N'string', NULL, 1, 0);

    IF EXISTS (SELECT 1 FROM #ChipsSettings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        WHERE (f.FieldTypeId <> s.FieldTypeId
           AND NOT (s.FieldName = N'OptionsList' AND f.FieldTypeId = @stringTypeId))
           OR f.FieldLevelCode <> N'System'
           OR f.IsStandard <> 1 OR f.IsExtraField <> 0)
        THROW 51506, 'An existing String--Chips setting definition conflicts with the seed.', 1;
    IF EXISTS (SELECT 1 FROM #ChipsSettings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        GROUP BY s.FieldName HAVING COUNT(*) > 1)
        THROW 51507, 'String--Chips has duplicate active setting definitions.', 1;

    -- Existing databases seeded OptionsList as String--Textbox. Promote that
    -- definition to String--Chips as a new revision without changing its code.
    CREATE TABLE #ChangedChipsSettings
    (
        AppFieldId bigint NOT NULL PRIMARY KEY,
        RevisionNo nvarchar(10) COLLATE DATABASE_DEFAULT NOT NULL
    );
    IF EXISTS (SELECT 1 FROM dbo.AppFields f
        WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
          AND f.TenantId IS NULL AND f.FieldName = N'OptionsList'
          AND f.FieldTypeId = @stringTypeId AND f.IsDeleted = 0
          AND (TRY_CONVERT(int, f.CurrentRevisionNo) IS NULL
               OR TRY_CONVERT(int, f.CurrentRevisionNo) >= 999999999))
        THROW 51515, 'OptionsList has an invalid or exhausted revision number.', 1;
    IF EXISTS (SELECT 1 FROM dbo.AppFields f
        JOIN dbo.AppFieldsHistory h ON h.AppFieldId = f.Id
        WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
          AND f.TenantId IS NULL AND f.FieldName = N'OptionsList'
          AND f.FieldTypeId = @stringTypeId AND f.IsDeleted = 0
          AND h.RevisionNo = CASE
              WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0'
              ELSE N'' END + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1))
        THROW 51516, 'The next OptionsList revision already exists.', 1;

    UPDATE f SET
        FieldTypeId = @chipsTypeId,
        CurrentRevisionNo = CASE
            WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0'
            ELSE N'' END + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1),
        LastModificationTime = SYSUTCDATETIME()
    OUTPUT inserted.Id, inserted.CurrentRevisionNo
        INTO #ChangedChipsSettings(AppFieldId, RevisionNo)
    FROM dbo.AppFields AS f
    WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
      AND f.TenantId IS NULL AND f.FieldName = N'OptionsList'
      AND f.FieldTypeId = @stringTypeId AND f.IsDeleted = 0;

    ;WITH Missing AS
    (
        SELECT s.*, ROW_NUMBER() OVER (PARTITION BY s.FieldTypeId ORDER BY s.Ordinal) AS NewOrdinal
        FROM #ChipsSettings s
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
            WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
              AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0)
    )
    SELECT m.*, COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
        FROM dbo.AppFields f WHERE f.FieldTypeId = m.FieldTypeId
          AND LEN(f.FieldCode) = 11
          AND SUBSTRING(f.FieldCode, 3, 1) IN (N'S', N'A', N'T')), 0)
          + m.NewOrdinal AS NextSequence
    INTO #MissingChipsSettings FROM Missing m;
    IF EXISTS (SELECT 1 FROM #MissingChipsSettings WHERE NextSequence > 9999)
        THROW 51508, 'A setting value type has exhausted its four-digit code sequence.', 1;

    INSERT dbo.AppFields
        (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
         Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId,
         FieldLevelCode, FieldStatusCode, TrackingNo, CurrentRevisionNo,
         IsStandard, IsExtraField, IsHidden, AllowNull, [Length], Decimals,
         DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required, Visible,
         Editable, Usage, CreationTime, CreatorUserId, LastModificationTime,
         LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
    SELECT NULL, NULL, @fieldObjectId, @chipsTypeId,
           LEFT(m.TypeCode, 2) + N'S' + LEFT(UPPER(m.FieldName) + N'____', 4)
               + RIGHT(N'0000' + CONVERT(nvarchar(10), m.NextSequence), 4),
           m.FieldName, N'Field Manager String--Chips AdvancedInformation setting',
           m.FieldTypeId, NULL, NULL, NULL, N'System', N'Active', NULL, N'00',
           1, 0, 0, m.AllowNull, NULL, NULL, m.DefaultValue,
           NULL, NULL, 0, m.Required, 1, 1, N'FieldManager.AdvancedInformation',
           SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
    FROM #MissingChipsSettings m;

    IF EXISTS (SELECT 1 FROM #ChipsSettings s OUTER APPLY
        (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
         WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
           AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0) matches
        WHERE matches.Cnt <> 1)
        THROW 51509, 'Expected one active definition per String--Chips setting.', 1;
    IF EXISTS (SELECT 1 FROM #ChipsSettings s JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
       AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
        JOIN dbo.AppTableFields a ON a.SycObjectId = @fieldObjectId
       AND a.SycEntityObjectTypeId = @chipsTypeId AND a.TenantId IS NULL
       AND a.FieldName = s.FieldName
        WHERE a.FieldDefinitionKey <> f.FieldDefinitionKey)
        THROW 51510, 'A String--Chips assignment points to a different definition.', 1;

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
           @fieldObjectId, @chipsTypeId, f.Id, f.TenantId, f.SourceFieldId,
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
    FROM #ChipsSettings s JOIN dbo.AppFields f
      ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
     AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
          AND a.SycEntityObjectTypeId = @chipsTypeId AND a.FieldName = s.FieldName);
    IF EXISTS (SELECT 1 FROM #ChipsSettings s OUTER APPLY
        (SELECT COUNT(*) AS Cnt FROM dbo.AppTableFields a
         WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
           AND a.SycEntityObjectTypeId = @chipsTypeId AND a.FieldName = s.FieldName) matches
        WHERE matches.Cnt <> 1)
        THROW 51511, 'Expected one String--Chips assignment per setting.', 1;

    UPDATE a SET
        FieldTypeId = f.FieldTypeId,
        AppliedRevisionNo = f.CurrentRevisionNo
    FROM dbo.AppTableFields a
    JOIN dbo.AppFields f ON f.FieldDefinitionKey = a.FieldDefinitionKey
    WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @chipsTypeId
      AND f.TenantId IS NULL AND f.SycObjectId = @fieldObjectId
      AND f.EntitySycObjectId = @chipsTypeId AND f.FieldName = N'OptionsList'
      AND f.IsDeleted = 0
      AND (a.FieldTypeId <> f.FieldTypeId
           OR a.AppliedRevisionNo <> f.CurrentRevisionNo);

    DECLARE @historyColumns nvarchar(max), @historyValues nvarchar(max), @historySql nvarchar(max);
    SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id),
           @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id)
    FROM sys.columns c JOIN sys.columns h
      ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
    WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';
    SET @historySql = N'INSERT dbo.AppFieldsHistory
        (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
    SELECT f.Id, f.CurrentRevisionNo,
           CASE WHEN changed.AppFieldId IS NULL THEN N''Create'' ELSE N''Edit'' END,
           SYSUTCDATETIME(), ' + @historyValues + N'
    FROM dbo.AppFields f
    LEFT JOIN #ChangedChipsSettings changed ON changed.AppFieldId = f.Id
    WHERE f.SycObjectId = @objectId
      AND f.EntitySycObjectId = @typeId AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND f.FieldName IN (N''hasOptions'', N''OptionsList'')
      AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
          WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
    EXEC sys.sp_executesql @historySql,
        N'@objectId bigint, @typeId bigint',
        @objectId = @fieldObjectId, @typeId = @chipsTypeId;

    DECLARE @oldAttributes xml = (SELECT TRY_CONVERT(xml, ExtraAttributes)
        FROM dbo.SycEntityObjectTypes WITH (UPDLOCK, HOLDLOCK) WHERE Id = @chipsTypeId);
    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE Id = @chipsTypeId AND ExtraAttributes IS NOT NULL)
       AND @oldAttributes IS NULL
        THROW 51512, 'String--Chips has invalid ExtraAttributes XML.', 1;
    IF @oldAttributes IS NOT NULL
    BEGIN
        IF @oldAttributes.exist('/ItemExtraAttributes/ExtraAttributes') <> 1
            THROW 51513, 'String--Chips has an unexpected ExtraAttributes XML structure.', 1;
        IF (SELECT COUNT(*) FROM @oldAttributes.nodes(
            '/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node)) <> 2
            OR @oldAttributes.exist('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="hasOptions"]') <> 1
            OR @oldAttributes.exist('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="OptionsList"]') <> 1
            THROW 51514, 'String--Chips XML conflicts with the two seeded settings.', 1;
    END
    ELSE
    BEGIN
        DECLARE @lastAttributeId bigint;
        ;WITH Parsed AS
        (
            SELECT TRY_CONVERT(xml, ExtraAttributes) AS AttributesXml
            FROM dbo.SycEntityObjectTypes WHERE ExtraAttributes IS NOT NULL
        )
        SELECT @lastAttributeId = COALESCE(MAX(
            A.Node.value('(AttributeId/text())[1]', 'bigint')), 0)
        FROM Parsed CROSS APPLY AttributesXml.nodes(
            '/ItemExtraAttributes/ExtraAttributes/ExtraAttribute') AS A(Node);
        UPDATE s SET AttributeId = @lastAttributeId + s.Ordinal FROM #ChipsSettings s;

        DECLARE @newAttributes xml =
        (
            SELECT
            (
                SELECT AttributeId, FieldName AS Code,
                       CASE WHEN FieldName = N'hasOptions' THEN N'Has Options'
                            ELSE N'Options List' END AS Name,
                       CASE WHEN FieldName = N'hasOptions' THEN N'Has Options'
                            ELSE N'Options List' END AS Description,
                       XmlDataType AS DataType, N'' AS Width, 0 AS Decimals,
                       COALESCE(DefaultValue, N'') AS DefaultValue,
                       N'FieldManager.AdvancedInformation' AS Usage,
                       N'false' AS IsLookup, N'' AS EntityObjectTypeCode,
                       N'false' AS AllowAddNew, N'false' AS AcceptMultipleValues,
                       N'' AS ValidEntries, N'false' AS IsVariation,
                       N'false' AS IsAdvancedSearch
                FROM #ChipsSettings ORDER BY Ordinal
                FOR XML PATH('ExtraAttribute'), TYPE
            )
            FOR XML PATH('ExtraAttributes'), ROOT('ItemExtraAttributes'), TYPE
        );
        UPDATE dbo.SycEntityObjectTypes
        SET ExtraAttributes = CONVERT(nvarchar(max), @newAttributes)
        WHERE Id = @chipsTypeId;
    END;

    DROP TABLE #MissingChipsSettings;
    DROP TABLE #ChangedChipsSettings;
    DROP TABLE #ChipsSettings;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

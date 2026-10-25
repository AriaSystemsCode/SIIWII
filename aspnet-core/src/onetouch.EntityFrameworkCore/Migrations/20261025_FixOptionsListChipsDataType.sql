-- Correct the String--Chips OptionsList control type on already seeded databases.
-- Resolve the FIELD/SC type by code because SycEntityObjectTypes IDs vary by database.
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

    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL
          AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @chipsTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'SC' AND Name = N'String--Chips'
          AND TenantId IS NULL AND IsDeleted = 0);
    IF @chipsTypeId IS NULL
        THROW 51800, 'Seed the FIELD/String--Chips type before correcting OptionsList.', 1;

    DECLARE @attributes xml = (SELECT TRY_CONVERT(xml, ExtraAttributes)
        FROM dbo.SycEntityObjectTypes WITH (UPDLOCK, HOLDLOCK)
        WHERE Id = @chipsTypeId);
    IF @attributes IS NULL OR
       (SELECT COUNT(*) FROM @attributes.nodes(
           '/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="OptionsList"]/DataType') AS X(Node)) <> 1
        THROW 51801, 'String--Chips XML must have one OptionsList DataType.', 1;
    DECLARE @xmlDataType nvarchar(50) = @attributes.value(
        '(/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="OptionsList"]/DataType/text())[1]',
        'nvarchar(50)');
    IF @xmlDataType NOT IN (N'string', N'chips')
        THROW 51802, 'OptionsList XML has an unexpected data type.', 1;
    IF @xmlDataType = N'string'
    BEGIN
        SET @attributes.modify('replace value of
            (/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="OptionsList"]/DataType/text())[1]
            with "chips"');
        UPDATE dbo.SycEntityObjectTypes
        SET ExtraAttributes = CONVERT(nvarchar(max), @attributes),
            LastModificationTime = SYSUTCDATETIME()
        WHERE Id = @chipsTypeId;
    END;

    SELECT f.Id, f.FieldDefinitionKey, f.CurrentRevisionNo,
           CAST(CASE WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0' ELSE N'' END
             + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1) AS nvarchar(10))
             AS NewRevisionNo
    INTO #Target
    FROM dbo.AppFields f WITH (UPDLOCK, HOLDLOCK)
    WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @chipsTypeId
      AND f.TenantId IS NULL AND f.FieldName = N'OptionsList' AND f.IsDeleted = 0;
    IF (SELECT COUNT(*) FROM #Target) <> 1
        THROW 51803, 'Expected one active String--Chips OptionsList definition.', 1;
    IF EXISTS (SELECT 1 FROM dbo.AppFields f JOIN #Target t ON t.Id = f.Id
        WHERE f.SourceDataType IS NOT NULL AND f.SourceDataType NOT IN (N'string', N'chips'))
        THROW 51804, 'OptionsList definition has an unexpected source data type.', 1;

    SELECT t.Id, t.NewRevisionNo
    INTO #Changed FROM #Target t JOIN dbo.AppFields f ON f.Id = t.Id
    WHERE f.SourceDataType IS NULL OR f.SourceDataType <> N'chips';
    IF EXISTS (SELECT 1 FROM #Changed c JOIN #Target t ON t.Id = c.Id
        WHERE TRY_CONVERT(int, t.CurrentRevisionNo) IS NULL
           OR TRY_CONVERT(int, t.CurrentRevisionNo) < 0
           OR TRY_CONVERT(int, t.CurrentRevisionNo) >= 999999999)
        THROW 51805, 'OptionsList has an invalid or exhausted revision number.', 1;
    IF EXISTS (SELECT 1 FROM #Changed c JOIN dbo.AppFieldsHistory h
        ON h.AppFieldId = c.Id AND h.RevisionNo = c.NewRevisionNo)
        THROW 51806, 'The next OptionsList revision already exists.', 1;

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
        INSERT dbo.AppFieldsHistory (AppFieldId, RevisionNo, ChangeType, ChangedAt, '
          + @historyColumns + N')
        OUTPUT inserted.Id, inserted.AppFieldId INTO #CreatedHistory
        SELECT f.Id, f.CurrentRevisionNo,
            CASE WHEN f.CurrentRevisionNo = N''00'' THEN N''Create'' ELSE N''Edit'' END,
            CASE WHEN f.CurrentRevisionNo = N''00'' THEN f.CreationTime
                 ELSE COALESCE(f.LastModificationTime, SYSUTCDATETIME()) END,
            ' + @historyValues + N'
        FROM dbo.AppFields f JOIN #Changed c ON c.Id = f.Id
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
            WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);
        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #CreatedHistory h JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = h.AppFieldId;';
    EXEC sys.sp_executesql @historySql;

    UPDATE f SET SourceDataType = N'chips', CurrentRevisionNo = c.NewRevisionNo,
                 LastModificationTime = SYSUTCDATETIME()
    FROM dbo.AppFields f JOIN #Changed c ON c.Id = f.Id;

    SET @historySql = N'TRUNCATE TABLE #CreatedHistory;
        INSERT dbo.AppFieldsHistory (AppFieldId, RevisionNo, ChangeType, ChangedAt, '
          + @historyColumns + N')
        OUTPUT inserted.Id, inserted.AppFieldId INTO #CreatedHistory
        SELECT f.Id, f.CurrentRevisionNo, N''Edit'', SYSUTCDATETIME(), '
          + @historyValues + N'
        FROM dbo.AppFields f JOIN #Changed c ON c.Id = f.Id;
        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #CreatedHistory h JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = h.AppFieldId;';
    EXEC sys.sp_executesql @historySql;

    IF EXISTS (SELECT 1 FROM dbo.AppTableFields a JOIN #Target t
        ON a.FieldDefinitionKey = t.FieldDefinitionKey
        WHERE a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @chipsTypeId
          AND a.TenantId IS NULL AND a.SourceAppFieldId <> t.Id)
        THROW 51807, 'An OptionsList snapshot points to another field definition.', 1;
    IF (SELECT COUNT(*) FROM dbo.AppTableFields a JOIN #Target t
        ON a.FieldDefinitionKey = t.FieldDefinitionKey
        WHERE a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @chipsTypeId
          AND a.TenantId IS NULL AND a.SourceAppFieldId = t.Id) <> 1
        THROW 51808, 'Expected one String--Chips OptionsList snapshot.', 1;
    UPDATE a SET SourceDataType = f.SourceDataType,
                 AppliedRevisionNo = f.CurrentRevisionNo,
                 FieldLastModificationTime = f.LastModificationTime
    FROM dbo.AppTableFields a JOIN #Target t
      ON a.FieldDefinitionKey = t.FieldDefinitionKey AND a.SourceAppFieldId = t.Id
    JOIN dbo.AppFields f ON f.Id = t.Id
    WHERE a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @chipsTypeId
      AND a.TenantId IS NULL
      AND (a.SourceDataType IS NULL OR a.SourceDataType <> N'chips'
           OR a.AppliedRevisionNo <> f.CurrentRevisionNo);

    DROP TABLE #CreatedHistory;
    DROP TABLE #Changed;
    DROP TABLE #Target;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

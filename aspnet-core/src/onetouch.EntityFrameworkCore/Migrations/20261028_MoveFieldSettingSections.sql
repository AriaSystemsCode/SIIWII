-- Move the twelve type-owned settings to the sections in the Field Manager design.
-- Keep old revisions intact; add one revision for each changed definition.
-- Resolve type and field IDs by code/name because IDs vary between databases.
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
    BEGIN
        COMMIT TRANSACTION;
        RETURN;
    END;

    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    IF @fieldObjectId IS NULL
    BEGIN
        -- New database: host object and type seeding has not happened yet.
        COMMIT TRANSACTION;
        RETURN;
    END;

    DECLARE @rootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0);
    IF @rootId IS NULL THROW 52200, 'The FIELD type root is missing.', 1;

    CREATE TABLE #Desired
    (
        TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
        FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL,
        NewUsage nvarchar(100) COLLATE DATABASE_DEFAULT NOT NULL,
        TypeId bigint NULL,
        AppFieldId bigint NULL,
        PRIMARY KEY (TypeCode, FieldName)
    );
    INSERT #Desired (TypeCode, FieldName, NewUsage) VALUES
        (N'ST', N'Visible',          N'FieldManager.AdvancedInformation'),
        (N'ST', N'Editable',         N'FieldManager.AdvancedInformation'),
        (N'IN', N'Visible',          N'FieldManager.AdvancedInformation'),
        (N'IN', N'Editable',         N'FieldManager.AdvancedInformation'),
        (N'IC', N'Visible',          N'FieldManager.AdvancedInformation'),
        (N'IC', N'Editable',         N'FieldManager.AdvancedInformation'),
        (N'DP', N'Visible',          N'FieldManager.AdvancedInformation'),
        (N'DP', N'DateFormat',       N'FieldManager.ExtraAttributes'),
        (N'LD', N'Visible',          N'FieldManager.AdvancedInformation'),
        (N'LD', N'AllowMultiSelect', N'FieldManager.ExtraAttributes'),
        (N'LD', N'DropdownOptions',  N'FieldManager.ExtraAttributes'),
        (N'BOOLEAN', N'Visible',     N'FieldManager.AdvancedInformation');

    UPDATE d SET TypeId = t.Id
    FROM #Desired d JOIN dbo.SycEntityObjectTypes t
      ON t.ObjectId = @fieldObjectId AND t.ParentId = @rootId
     AND t.Code = d.TypeCode AND t.TenantId IS NULL AND t.IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM #Desired WHERE TypeId IS NULL)
        THROW 52201, 'A required field type is missing.', 1;
    IF EXISTS (SELECT 1 FROM #Desired d JOIN dbo.SycEntityObjectTypes t
        ON t.ObjectId = @fieldObjectId AND t.ParentId = @rootId
       AND t.Code = d.TypeCode AND t.TenantId IS NULL AND t.IsDeleted = 0
        GROUP BY d.TypeCode HAVING COUNT(DISTINCT t.Id) <> 1)
        THROW 52202, 'A field type code is duplicated.', 1;

    UPDATE d SET AppFieldId = f.Id
    FROM #Desired d JOIN dbo.AppFields f WITH (UPDLOCK, HOLDLOCK)
      ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = d.TypeId
     AND f.FieldName = d.FieldName AND f.TenantId IS NULL AND f.IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM #Desired WHERE AppFieldId IS NULL)
        THROW 52203, 'A type-owned setting definition is missing.', 1;
    IF EXISTS (SELECT 1 FROM #Desired d JOIN dbo.AppFields f
        ON f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = d.TypeId
       AND f.FieldName = d.FieldName AND f.TenantId IS NULL AND f.IsDeleted = 0
        GROUP BY d.TypeCode, d.FieldName HAVING COUNT(*) <> 1)
        THROW 52204, 'A type-owned setting definition is duplicated.', 1;
    IF EXISTS (SELECT 1 FROM #Desired d JOIN dbo.AppFields f ON f.Id = d.AppFieldId
        WHERE f.Usage NOT IN (N'FieldManager.AdvancedInformation',
                              N'FieldManager.ExtraAttributes') OR f.Usage IS NULL)
        THROW 52205, 'A setting definition has an unexpected Usage.', 1;

    SELECT d.AppFieldId, d.TypeId, d.FieldName, d.NewUsage,
           f.FieldDefinitionKey, f.CurrentRevisionNo,
           CAST(CASE WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10
                THEN N'0' ELSE N'' END
                + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1)
                AS nvarchar(10)) AS NewRevisionNo
    INTO #Changed
    FROM #Desired d JOIN dbo.AppFields f ON f.Id = d.AppFieldId
    WHERE f.Usage <> d.NewUsage;
    IF EXISTS (SELECT 1 FROM #Changed
        WHERE TRY_CONVERT(int, CurrentRevisionNo) IS NULL
           OR TRY_CONVERT(int, CurrentRevisionNo) < 0
           OR TRY_CONVERT(int, CurrentRevisionNo) >= 999999999)
        THROW 52206, 'A setting has an invalid or exhausted revision.', 1;
    IF EXISTS (SELECT 1 FROM #Changed c JOIN dbo.AppFieldsHistory h
        ON h.AppFieldId = c.AppFieldId AND h.RevisionNo = c.NewRevisionNo)
        THROW 52207, 'A next setting revision already exists.', 1;

    DECLARE @historyColumns nvarchar(max), @historyValues nvarchar(max), @historySql nvarchar(max);
    SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id),
           @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
               WITHIN GROUP (ORDER BY c.column_id)
    FROM sys.columns c JOIN sys.columns h
      ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
    WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';

    CREATE TABLE #CreatedHistory (Id bigint NOT NULL, AppFieldId bigint NOT NULL);
    SET @historySql = N'INSERT dbo.AppFieldsHistory
        (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
        OUTPUT inserted.Id, inserted.AppFieldId INTO #CreatedHistory
        SELECT f.Id, f.CurrentRevisionNo,
               CASE WHEN f.CurrentRevisionNo = N''00'' THEN N''Create'' ELSE N''Edit'' END,
               CASE WHEN f.CurrentRevisionNo = N''00'' THEN f.CreationTime
                    ELSE COALESCE(f.LastModificationTime, SYSUTCDATETIME()) END,
               ' + @historyValues + N'
        FROM dbo.AppFields f JOIN #Changed c ON c.AppFieldId = f.Id
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
            WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);
        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #CreatedHistory h JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = h.AppFieldId;';
    EXEC sys.sp_executesql @historySql;

    UPDATE f SET Usage = c.NewUsage, CurrentRevisionNo = c.NewRevisionNo,
                 LastModificationTime = SYSUTCDATETIME()
    FROM dbo.AppFields f JOIN #Changed c ON c.AppFieldId = f.Id;

    SET @historySql = N'TRUNCATE TABLE #CreatedHistory;
        INSERT dbo.AppFieldsHistory
            (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
        OUTPUT inserted.Id, inserted.AppFieldId INTO #CreatedHistory
        SELECT f.Id, f.CurrentRevisionNo, N''Edit'', f.LastModificationTime,
               ' + @historyValues + N'
        FROM dbo.AppFields f JOIN #Changed c ON c.AppFieldId = f.Id;
        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #CreatedHistory h JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = h.AppFieldId;';
    EXEC sys.sp_executesql @historySql;

    -- The AppFields-sourced API reads Usage from these applied snapshots.
    UPDATE a SET Usage = f.Usage, AppliedRevisionNo = f.CurrentRevisionNo,
                 FieldLastModificationTime = f.LastModificationTime
    FROM dbo.AppTableFields a JOIN #Desired d ON d.AppFieldId = a.SourceAppFieldId
    JOIN dbo.AppFields f ON f.Id = d.AppFieldId
    WHERE a.FieldDefinitionKey = f.FieldDefinitionKey
      AND (a.Usage IS NULL OR a.Usage <> f.Usage
           OR a.AppliedRevisionNo <> f.CurrentRevisionNo);

    -- The legacy XML source must describe the same sections. String--Textbox
    -- may have no XML; its AppTableFields snapshots remain authoritative.
    DECLARE @typeId bigint, @settingName nvarchar(250), @usage nvarchar(100), @attributes xml;
    DECLARE xmlSettings CURSOR LOCAL FAST_FORWARD FOR
        SELECT TypeId, FieldName, NewUsage FROM #Desired ORDER BY TypeId, FieldName;
    OPEN xmlSettings;
    FETCH NEXT FROM xmlSettings INTO @typeId, @settingName, @usage;
    WHILE @@FETCH_STATUS = 0
    BEGIN
        SELECT @attributes = TRY_CONVERT(xml, ExtraAttributes)
        FROM dbo.SycEntityObjectTypes WHERE Id = @typeId;
        IF @attributes IS NOT NULL
           AND @attributes.exist('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code=sql:variable("@settingName")]/Usage') = 1
        BEGIN
            SET @attributes.modify('replace value of
                (/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code=sql:variable("@settingName")]/Usage/text())[1]
                with sql:variable("@usage")');
            UPDATE dbo.SycEntityObjectTypes
            SET ExtraAttributes = CONVERT(nvarchar(max), @attributes)
            WHERE Id = @typeId;
        END;
        FETCH NEXT FROM xmlSettings INTO @typeId, @settingName, @usage;
    END;
    CLOSE xmlSettings;
    DEALLOCATE xmlSettings;

    DROP TABLE #CreatedHistory;
    DROP TABLE #Changed;
    DROP TABLE #Desired;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF CURSOR_STATUS('local', 'xmlSettings') >= 0 CLOSE xmlSettings;
    IF CURSOR_STATUS('local', 'xmlSettings') > -3 DEALLOCATE xmlSettings;
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

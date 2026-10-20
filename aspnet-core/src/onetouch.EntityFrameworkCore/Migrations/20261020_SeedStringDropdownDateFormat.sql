-- Add the combined String--dropDownList Field type and move the DateFormat
-- setting to it. Existing field codes and earlier revisions remain stable.
-- This script is rerunnable and does not hard-code database identity values.
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
        THROW 51600, 'Apply the Field Manager schema before seeding String--dropDownList.', 1;

    -- On a new database, migrations can run before the host object/type seeder.
    -- The host seeder runs this same script after creating those prerequisites.
    IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0)
    BEGIN
        COMMIT TRANSACTION;
        RETURN;
    END;

    IF (SELECT COUNT(*) FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
        THROW 51601, 'Expected one active Field object.', 1;
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51602, 'Expected one active Field type root.', 1;
    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51603, 'String--Textbox must exist before String--dropDownList.', 1;
    DECLARE @stringTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'ST' AND TenantId IS NULL AND IsDeleted = 0);

    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND (Code = N'SD' OR Name = N'String--dropDownList')
          AND (Code <> N'SD' OR Name <> N'String--dropDownList'
               OR ParentId <> @fieldRootId OR TenantId IS NOT NULL OR IsDeleted <> 0))
        THROW 51604, 'A conflicting String--dropDownList type exists.', 1;
    IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'SD'
          AND ParentId = @fieldRootId AND TenantId IS NULL AND IsDeleted = 0)
        INSERT dbo.SycEntityObjectTypes
            (CreationTime, IsDeleted, Code, Name, ParentId, ObjectId,
             ObjectCode, ParentCode, TenantId, Hidden, IsDefault)
        VALUES (SYSUTCDATETIME(), 0, N'SD', N'String--dropDownList',
                @fieldRootId, @fieldObjectId, N'FIELD', N'FIELD', NULL, 0, 0);
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'SD'
          AND ParentId = @fieldRootId AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51605, 'Expected one String--dropDownList type.', 1;
    DECLARE @dropdownTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'SD'
          AND ParentId = @fieldRootId AND TenantId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'DP'
          AND ParentId = @fieldRootId AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 51606, 'Expected one Date--Date picker type.', 1;
    DECLARE @dateTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'DP'
          AND ParentId = @fieldRootId AND TenantId IS NULL AND IsDeleted = 0);

    IF (SELECT COUNT(*) FROM dbo.AppFields
        WHERE SycObjectId = @fieldObjectId AND EntitySycObjectId = @dateTypeId
          AND FieldName = N'DateFormat' AND TenantId IS NULL AND IsDeleted = 0) > 1
        THROW 51607, 'Multiple DateFormat setting definitions exist.', 1;
    IF EXISTS (SELECT 1 FROM dbo.AppFields
        WHERE SycObjectId = @fieldObjectId AND EntitySycObjectId = @dateTypeId
          AND FieldName = N'DateFormat' AND TenantId IS NULL AND IsDeleted = 0
          AND FieldTypeId NOT IN (@stringTypeId, @dropdownTypeId))
        THROW 51608, 'DateFormat has an unexpected field type.', 1;

    CREATE TABLE #ChangedDateFormat
    (
        AppFieldId bigint NOT NULL PRIMARY KEY,
        RevisionNo nvarchar(10) COLLATE DATABASE_DEFAULT NOT NULL
    );
    IF EXISTS (SELECT 1 FROM dbo.AppFields
        WHERE SycObjectId = @fieldObjectId AND EntitySycObjectId = @dateTypeId
          AND FieldName = N'DateFormat' AND TenantId IS NULL AND IsDeleted = 0
          AND (FieldTypeId <> @dropdownTypeId
               OR ISNULL(SourceDataType, N'') <> N'dropDownList')
          AND (TRY_CONVERT(int, CurrentRevisionNo) IS NULL
               OR TRY_CONVERT(int, CurrentRevisionNo) >= 999999999))
        THROW 51609, 'DateFormat has an invalid or exhausted revision number.', 1;
    IF EXISTS (SELECT 1 FROM dbo.AppFields f
        JOIN dbo.AppFieldsHistory h ON h.AppFieldId = f.Id
        WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @dateTypeId
          AND f.FieldName = N'DateFormat' AND f.TenantId IS NULL AND f.IsDeleted = 0
          AND (f.FieldTypeId <> @dropdownTypeId
               OR ISNULL(f.SourceDataType, N'') <> N'dropDownList')
          AND h.RevisionNo = CASE
              WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0'
              ELSE N'' END + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1))
        THROW 51610, 'The next DateFormat revision already exists.', 1;

    UPDATE f SET
        FieldTypeId = @dropdownTypeId,
        SourceDataType = N'dropDownList',
        CurrentRevisionNo = CASE
            WHEN TRY_CONVERT(int, f.CurrentRevisionNo) + 1 < 10 THEN N'0'
            ELSE N'' END + CONVERT(nvarchar(10), TRY_CONVERT(int, f.CurrentRevisionNo) + 1),
        LastModificationTime = SYSUTCDATETIME()
    OUTPUT inserted.Id, inserted.CurrentRevisionNo
        INTO #ChangedDateFormat(AppFieldId, RevisionNo)
    FROM dbo.AppFields AS f
    WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @dateTypeId
      AND f.FieldName = N'DateFormat' AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND (f.FieldTypeId <> @dropdownTypeId
           OR ISNULL(f.SourceDataType, N'') <> N'dropDownList');

    -- Match RecordHistory's typed snapshot without replacing older revisions.
    IF EXISTS (SELECT 1 FROM #ChangedDateFormat)
    BEGIN
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
            (AppFieldId, RevisionNo, ChangeType, ChangedAt, '
            + @historyColumns + N')
        SELECT f.Id, f.CurrentRevisionNo, N''Edit'', SYSUTCDATETIME(), '
            + @historyValues + N'
        FROM dbo.AppFields f JOIN #ChangedDateFormat c ON c.AppFieldId = f.Id
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
            WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
        EXEC sys.sp_executesql @historySql;

        INSERT dbo.AppFieldHistorySettingValues
            (AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value])
        SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
        FROM #ChangedDateFormat c
        JOIN dbo.AppFieldsHistory h ON h.AppFieldId = c.AppFieldId AND h.RevisionNo = c.RevisionNo
        JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = c.AppFieldId
        WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldHistorySettingValues old
            WHERE old.AppFieldHistoryId = h.Id AND old.SettingFieldId = v.SettingFieldId);
    END;

    UPDATE a SET
        FieldTypeId = @dropdownTypeId,
        SourceDataType = N'dropDownList',
        ValidEntries = f.ValidEntries,
        AppliedRevisionNo = f.CurrentRevisionNo
    FROM dbo.AppTableFields a
    JOIN dbo.AppFields f ON f.FieldDefinitionKey = a.FieldDefinitionKey
    WHERE f.SycObjectId = @fieldObjectId AND f.EntitySycObjectId = @dateTypeId
      AND f.FieldName = N'DateFormat' AND f.TenantId IS NULL AND f.IsDeleted = 0
      AND a.SycObjectId = @fieldObjectId AND a.SycEntityObjectTypeId = @dateTypeId
      AND a.TenantId IS NULL
      AND (a.FieldTypeId <> @dropdownTypeId
           OR ISNULL(a.SourceDataType, N'') <> N'dropDownList'
           OR ISNULL(a.ValidEntries, N'') <> ISNULL(f.ValidEntries, N'')
           OR a.AppliedRevisionNo <> f.CurrentRevisionNo);

    -- Keep the legacy XML definition consistent with the Field Manager rows.
    DECLARE @attributes xml = (SELECT TRY_CONVERT(xml, ExtraAttributes)
        FROM dbo.SycEntityObjectTypes WHERE Id = @dateTypeId);
    IF @attributes IS NOT NULL
       AND @attributes.exist('/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="DateFormat"]/DataType') = 1
    BEGIN
        SET @attributes.modify('replace value of
            (/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="DateFormat"]/DataType/text())[1]
            with "dropDownList"');
        UPDATE dbo.SycEntityObjectTypes
        SET ExtraAttributes = CONVERT(nvarchar(max), @attributes)
        WHERE Id = @dateTypeId;
    END;

    DROP TABLE #ChangedDateFormat;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

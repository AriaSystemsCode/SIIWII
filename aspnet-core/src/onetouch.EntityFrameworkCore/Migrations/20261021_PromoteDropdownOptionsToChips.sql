-- DropdownOptions belongs to List--Dropdown, but its value is edited as
-- String--Chips. Resolve type IDs by code; database identity values vary.
-- Rerunnable: the first promotion creates one revision, later runs do nothing.
SET XACT_ABORT ON;

BEGIN TRY
    BEGIN TRANSACTION;

    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    IF @fieldObjectId IS NULL
        THROW 51700, 'The active FIELD object is missing.', 1;

    DECLARE @fieldRootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @listTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'LD' AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @chipsTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @fieldRootId
          AND Code = N'SC' AND TenantId IS NULL AND IsDeleted = 0);
    IF @listTypeId IS NULL OR @chipsTypeId IS NULL
        THROW 51701, 'List--Dropdown and String--Chips types are required.', 1;

    IF (SELECT COUNT(*) FROM dbo.AppFields
        WHERE SycObjectId = @fieldObjectId AND EntitySycObjectId = @listTypeId
          AND TenantId IS NULL AND FieldName = N'DropdownOptions'
          AND IsDeleted = 0) <> 1
        THROW 51702, 'Expected one active DropdownOptions definition.', 1;

    DECLARE @settingFieldId bigint, @definitionKey uniqueidentifier,
            @currentTypeId bigint, @currentRevision nvarchar(10),
            @nextRevision nvarchar(10), @historyColumns nvarchar(max),
            @historyValues nvarchar(max), @historySql nvarchar(max);
    SELECT @settingFieldId = Id, @definitionKey = FieldDefinitionKey,
           @currentTypeId = FieldTypeId, @currentRevision = CurrentRevisionNo
    FROM dbo.AppFields WITH (UPDLOCK, HOLDLOCK)
    WHERE SycObjectId = @fieldObjectId AND EntitySycObjectId = @listTypeId
      AND TenantId IS NULL AND FieldName = N'DropdownOptions' AND IsDeleted = 0;

    IF @currentTypeId NOT IN (@listTypeId, @chipsTypeId)
        THROW 51703, 'DropdownOptions has an unexpected value type.', 1;

    IF @currentTypeId = @listTypeId
    BEGIN
        IF TRY_CONVERT(int, @currentRevision) IS NULL
           OR TRY_CONVERT(int, @currentRevision) >= 999999999
            THROW 51704, 'DropdownOptions has an invalid or exhausted revision.', 1;
        SET @nextRevision = CASE WHEN TRY_CONVERT(int, @currentRevision) + 1 < 10
            THEN N'0' ELSE N'' END
            + CONVERT(nvarchar(10), TRY_CONVERT(int, @currentRevision) + 1);
        IF EXISTS (SELECT 1 FROM dbo.AppFieldsHistory
            WHERE AppFieldId = @settingFieldId AND RevisionNo = @nextRevision)
            THROW 51705, 'The next DropdownOptions revision already exists.', 1;

        SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
                   WITHIN GROUP (ORDER BY c.column_id),
               @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
                   WITHIN GROUP (ORDER BY c.column_id)
        FROM sys.columns c JOIN sys.columns h
          ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
        WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';

        -- Preserve the old definition even if its original history row is absent.
        SET @historySql = N'INSERT dbo.AppFieldsHistory
            (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
        SELECT f.Id, f.CurrentRevisionNo,
               CASE WHEN f.CurrentRevisionNo = N''00'' THEN N''Create'' ELSE N''Edit'' END,
               SYSUTCDATETIME(), ' + @historyValues + N'
        FROM dbo.AppFields f WHERE f.Id = @id
          AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
              WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
        EXEC sys.sp_executesql @historySql, N'@id bigint', @id = @settingFieldId;

        UPDATE dbo.AppFields SET FieldTypeId = @chipsTypeId,
            SourceDataType = N'chips',
            CurrentRevisionNo = @nextRevision,
            LastModificationTime = SYSUTCDATETIME()
        WHERE Id = @settingFieldId AND FieldTypeId = @listTypeId;
        IF @@ROWCOUNT <> 1
            THROW 51706, 'DropdownOptions changed during promotion.', 1;

        SET @historySql = N'INSERT dbo.AppFieldsHistory
            (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
        SELECT f.Id, f.CurrentRevisionNo, N''Edit'', SYSUTCDATETIME(), '
            + @historyValues + N'
        FROM dbo.AppFields f WHERE f.Id = @id;';
        EXEC sys.sp_executesql @historySql, N'@id bigint', @id = @settingFieldId;
    END;

    -- The applied setting definition is a snapshot, so update it explicitly.
    UPDATE a SET FieldTypeId = @chipsTypeId,
                 SourceDataType = f.SourceDataType,
                 AppliedRevisionNo = f.CurrentRevisionNo
    FROM dbo.AppTableFields a
    JOIN dbo.AppFields f ON f.Id = @settingFieldId
    WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
      AND a.SycEntityObjectTypeId = @listTypeId
      AND a.FieldName = N'DropdownOptions'
      AND a.FieldDefinitionKey = @definitionKey
      AND (a.FieldTypeId <> @chipsTypeId
           OR (f.SourceDataType = N'chips' AND (a.SourceDataType IS NULL OR a.SourceDataType <> N'chips'))
           OR a.AppliedRevisionNo <> f.CurrentRevisionNo);

    IF (SELECT COUNT(*) FROM dbo.AppTableFields a
        WHERE a.TenantId IS NULL AND a.SycObjectId = @fieldObjectId
          AND a.SycEntityObjectTypeId = @listTypeId
          AND a.FieldName = N'DropdownOptions'
          AND a.FieldDefinitionKey = @definitionKey
          AND a.FieldTypeId = @chipsTypeId) <> 1
        THROW 51707, 'Expected one promoted DropdownOptions assignment.', 1;

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

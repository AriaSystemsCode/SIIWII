-- Correct the initial level of host-seeded Field Manager definitions.
-- CreatorUserId distinguishes seed data from System fields deliberately created by a host user.
-- Keep FieldCode stable: assignments and external consumers may already use that identifier.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    SELECT Id, FieldDefinitionKey, CurrentRevisionNo
    INTO #ReleveledFields
    FROM dbo.AppFields WITH (UPDLOCK, HOLDLOCK)
    WHERE TenantId IS NULL
      AND CreatorUserId IS NULL
      AND IsDeleted = 0
      AND FieldLevelCode = N'System';

    UPDATE f
    SET FieldLevelCode = N'Application'
    FROM dbo.AppFields f
    JOIN #ReleveledFields r ON r.Id = f.Id;

    -- The current history row represents the same definition as AppFields.
    -- Older revisions retain their original level.
    UPDATE h
    SET FieldLevelCode = N'Application'
    FROM dbo.AppFieldsHistory h
    JOIN #ReleveledFields r ON r.Id = h.AppFieldId
                           AND r.CurrentRevisionNo = h.RevisionNo
    WHERE h.FieldLevelCode = N'System';

    -- Table/type assignments are snapshots, so update only snapshots of these seed fields.
    UPDATE a
    SET FieldLevelCode = N'Application'
    FROM dbo.AppTableFields a
    JOIN #ReleveledFields r ON r.FieldDefinitionKey = a.FieldDefinitionKey
    WHERE a.TenantId IS NULL
      AND a.FieldTenantId IS NULL
      AND a.FieldLevelCode = N'System';

    DROP TABLE #ReleveledFields;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

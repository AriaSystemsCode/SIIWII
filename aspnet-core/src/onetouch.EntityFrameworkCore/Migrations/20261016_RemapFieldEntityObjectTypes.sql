-- EntitySycObjectId in Field Manager records now identifies a
-- SycEntityObjectTypes row. Earlier data stored the owning SydObjects.Id.
-- Resolve one root type per referenced object and remap definitions, history,
-- and table snapshots together before replacing the AppFields foreign key.
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;

IF EXISTS (SELECT 1 FROM sys.foreign_keys
    WHERE name = N'FK_AppFields_SycEntityObjectTypes_EntitySycObjectId'
      AND parent_object_id = OBJECT_ID(N'dbo.AppFields'))
    RETURN;

BEGIN TRY
    BEGIN TRANSACTION;

    IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys
        WHERE name = N'FK_AppFields_SydObjects_EntitySycObjectId'
          AND parent_object_id = OBJECT_ID(N'dbo.AppFields'))
        THROW 51360, 'The expected old AppFields entity-object foreign key is missing.', 1;

    CREATE TABLE #EntityTypeMap
    (
        ObjectId bigint NOT NULL PRIMARY KEY,
        TypeId bigint NULL
    );
    INSERT #EntityTypeMap (ObjectId)
    SELECT EntitySycObjectId FROM dbo.AppFields WHERE EntitySycObjectId IS NOT NULL
    UNION
    SELECT EntitySycObjectId FROM dbo.AppFieldsHistory WHERE EntitySycObjectId IS NOT NULL
    UNION
    SELECT EntitySycObjectId FROM dbo.AppTableFields WHERE EntitySycObjectId IS NOT NULL;
    INSERT #EntityTypeMap (ObjectId)
    SELECT o.Id FROM dbo.SydObjects o
    WHERE o.Code IN (N'TRANSACTION', N'BASEENTITY')
      AND o.ObjectTypeCode = N'ENTITY' AND o.IsDeleted = 0
      AND NOT EXISTS (SELECT 1 FROM #EntityTypeMap m WHERE m.ObjectId = o.Id);

    IF EXISTS (SELECT 1 FROM #EntityTypeMap m
        LEFT JOIN dbo.SydObjects o ON o.Id = m.ObjectId
        WHERE o.Id IS NULL OR o.IsDeleted = 1)
        THROW 51361, 'An existing Field Manager entity object is missing or deleted.', 1;

    IF EXISTS (SELECT 1 FROM #EntityTypeMap m
        JOIN dbo.SydObjects o ON o.Id = m.ObjectId
        JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = o.Id
            AND t.Code = o.Code AND t.ParentId IS NULL AND t.IsDeleted = 0
        GROUP BY m.ObjectId HAVING COUNT(*) > 1)
        THROW 51362, 'An entity object has multiple matching root types.', 1;

    INSERT dbo.SycEntityObjectTypes
        (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode,
         TenantId, IsDefault)
    SELECT SYSUTCDATETIME(), 0, o.Code, o.Name, o.Id, o.Code, NULL, 0
    FROM #EntityTypeMap m
    JOIN dbo.SydObjects o ON o.Id = m.ObjectId
    WHERE NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes t
        WHERE t.ObjectId = o.Id AND t.Code = o.Code
          AND t.ParentId IS NULL AND t.IsDeleted = 0);

    UPDATE m SET TypeId = t.Id
    FROM #EntityTypeMap m
    JOIN dbo.SydObjects o ON o.Id = m.ObjectId
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = o.Id
        AND t.Code = o.Code AND t.ParentId IS NULL AND t.IsDeleted = 0;
    IF EXISTS (SELECT 1 FROM #EntityTypeMap WHERE TypeId IS NULL)
        THROW 51363, 'An entity object root type could not be resolved.', 1;

    ALTER TABLE dbo.AppFields
        DROP CONSTRAINT FK_AppFields_SydObjects_EntitySycObjectId;

    UPDATE f SET EntitySycObjectId = m.TypeId
    FROM dbo.AppFields f JOIN #EntityTypeMap m ON m.ObjectId = f.EntitySycObjectId;
    UPDATE h SET EntitySycObjectId = m.TypeId
    FROM dbo.AppFieldsHistory h JOIN #EntityTypeMap m ON m.ObjectId = h.EntitySycObjectId;
    UPDATE a SET EntitySycObjectId = m.TypeId
    FROM dbo.AppTableFields a JOIN #EntityTypeMap m ON m.ObjectId = a.EntitySycObjectId;

    -- The input mask XML is on the Date picker type. Its entity type is the
    -- Field root, while SourceEntityObjectTypeId tracks that XML origin.
    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    DECLARE @fieldRootTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND IsDeleted = 0);
    DECLARE @datePickerTypeId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'DP'
          AND ParentId = @fieldRootTypeId AND IsDeleted = 0);
    IF @fieldObjectId IS NULL OR @fieldRootTypeId IS NULL OR @datePickerTypeId IS NULL
        THROW 51364, 'The Field root or Date picker type was not found.', 1;

    UPDATE f SET EntitySycObjectId = @fieldRootTypeId,
                 SourceEntityObjectTypeId = @datePickerTypeId
    FROM dbo.AppFields f
    WHERE f.SycObjectId = @fieldObjectId AND f.FieldName = N'input mask'
      AND f.IsExtraField = 1 AND f.SourceDataType = N'string';
    UPDATE h SET EntitySycObjectId = @fieldRootTypeId,
                 SourceEntityObjectTypeId = @datePickerTypeId
    FROM dbo.AppFieldsHistory h
    JOIN dbo.AppFields f ON f.Id = h.AppFieldId
    WHERE f.SycObjectId = @fieldObjectId AND f.FieldName = N'input mask'
      AND f.IsExtraField = 1 AND f.SourceDataType = N'string';
    UPDATE a SET EntitySycObjectId = @fieldRootTypeId,
                 SourceEntityObjectTypeId = @datePickerTypeId
    FROM dbo.AppTableFields a
    JOIN dbo.AppFields f ON f.FieldDefinitionKey = a.FieldDefinitionKey
    WHERE f.SycObjectId = @fieldObjectId AND f.FieldName = N'input mask'
      AND f.IsExtraField = 1 AND f.SourceDataType = N'string';

    IF EXISTS (SELECT 1 FROM dbo.AppFields f
        LEFT JOIN dbo.SycEntityObjectTypes t ON t.Id = f.EntitySycObjectId
        WHERE f.EntitySycObjectId IS NOT NULL AND t.Id IS NULL)
        THROW 51365, 'An AppFields entity type has no referenced type row.', 1;

    ALTER TABLE dbo.AppFields WITH CHECK ADD CONSTRAINT
        FK_AppFields_SycEntityObjectTypes_EntitySycObjectId
        FOREIGN KEY (EntitySycObjectId) REFERENCES dbo.SycEntityObjectTypes(Id);

    DROP TABLE #EntityTypeMap;
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

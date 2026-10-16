-- Standalone equivalent of EF migration 20261016140000_DetachOrdinaryFieldDefinitions.
-- Keep AppTableFields.SycObjectId NOT NULL: it is the assignment target.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.AppFields', N'U') IS NULL
       OR OBJECT_ID(N'dbo.AppFieldsHistory', N'U') IS NULL
       OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
        THROW 51450, 'Field Manager tables are missing.', 1;
    IF COL_LENGTH(N'dbo.AppFields', N'FieldDefinitionKey') IS NULL
       OR COL_LENGTH(N'dbo.AppTableFields', N'SourceAppFieldId') IS NULL
       OR COL_LENGTH(N'dbo.AppFields', N'IsCustom') IS NOT NULL
        THROW 51451, 'Apply the earlier Field Manager schema migrations first.', 1;

    ALTER TABLE dbo.AppFields ALTER COLUMN SycObjectId bigint NULL;
    ALTER TABLE dbo.AppFieldsHistory ALTER COLUMN SycObjectId bigint NULL;
    ALTER TABLE dbo.AppTableFields ALTER COLUMN DefinitionSycObjectId bigint NULL;

    UPDATE f SET SycObjectId = NULL, EntitySycObjectId = NULL
    FROM dbo.AppFields AS f
    WHERE NOT EXISTS
    (
        SELECT 1 FROM dbo.SydObjects AS o
        JOIN dbo.SycEntityObjectTypes AS root ON root.ObjectId = o.Id
            AND root.Code = N'FIELD' AND root.ParentId IS NULL AND root.IsDeleted = 0
        JOIN dbo.SycEntityObjectTypes AS t ON t.ObjectId = o.Id
            AND t.ParentId = root.Id AND t.Id = f.EntitySycObjectId AND t.IsDeleted = 0
        WHERE o.Id = f.SycObjectId AND o.Code = N'FIELD' AND o.IsDeleted = 0
          AND t.Code IN (N'BOOLEAN', N'DP', N'IC', N'IN', N'LD', N'ST')
    );

    UPDATE h SET SycObjectId = f.SycObjectId,
                 EntitySycObjectId = f.EntitySycObjectId
    FROM dbo.AppFieldsHistory AS h
    JOIN dbo.AppFields AS f ON f.Id = h.AppFieldId;

    UPDATE a SET DefinitionSycObjectId = f.SycObjectId,
                 EntitySycObjectId = f.EntitySycObjectId
    FROM dbo.AppTableFields AS a
    LEFT JOIN dbo.AppFields AS f ON f.Id = a.SourceAppFieldId;

    IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
       AND NOT EXISTS (SELECT 1 FROM dbo.__EFMigrationsHistory
                       WHERE MigrationId = N'20261016140000_DetachOrdinaryFieldDefinitions')
        INSERT dbo.__EFMigrationsHistory (MigrationId, ProductVersion)
        SELECT N'20261016140000_DetachOrdinaryFieldDefinitions',
               COALESCE((SELECT TOP (1) ProductVersion FROM dbo.__EFMigrationsHistory
                         ORDER BY MigrationId DESC), N'7.0.20');

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

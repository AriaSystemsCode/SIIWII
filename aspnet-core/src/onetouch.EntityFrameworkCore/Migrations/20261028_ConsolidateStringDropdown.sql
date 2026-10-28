-- Retire the duplicate String--dropDownList type. Resolve IDs by code because
-- identity values differ between databases. Safe to rerun after consolidation.
SET XACT_ABORT ON;
BEGIN TRY
    BEGIN TRANSACTION;

    IF OBJECT_ID(N'dbo.SydObjects', N'U') IS NULL
       OR OBJECT_ID(N'dbo.SycEntityObjectTypes', N'U') IS NULL
       OR OBJECT_ID(N'dbo.AppFields', N'U') IS NULL
    BEGIN
        COMMIT TRANSACTION;
        RETURN;
    END;

    DECLARE @fieldObjectId bigint = (SELECT Id FROM dbo.SydObjects
        WHERE Code = N'FIELD' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0);
    IF @fieldObjectId IS NULL
    BEGIN
        -- The host object/type seeder has not run yet.
        COMMIT TRANSACTION;
        RETURN;
    END;

    DECLARE @rootId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND Code = N'FIELD'
          AND ParentId IS NULL AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @targetId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @rootId
          AND Code = N'LD' AND TenantId IS NULL AND IsDeleted = 0);
    DECLARE @oldId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @rootId
          AND Code = N'SD' AND TenantId IS NULL AND IsDeleted = 0);

    IF @rootId IS NULL OR @targetId IS NULL
        THROW 52100, 'Expected one active FIELD root and LD type.', 1;
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @rootId
          AND Code = N'LD' AND TenantId IS NULL AND IsDeleted = 0) <> 1
        THROW 52101, 'Duplicate LD field types exist.', 1;
    IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE ObjectId = @fieldObjectId AND ParentId = @rootId
          AND Code = N'SD' AND TenantId IS NULL AND IsDeleted = 0) > 1
        THROW 52102, 'Duplicate SD field types exist.', 1;
    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE Id = @targetId AND Name NOT IN (N'List--Dropdown', N'String--Dropdown'))
        THROW 52103, 'LD has an unexpected name.', 1;
    IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
        WHERE Name = N'String--Dropdown' AND Id <> @targetId AND IsDeleted = 0)
        THROW 52104, 'Another active type already uses String--Dropdown.', 1;

    IF @oldId IS NOT NULL
    BEGIN
        IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
            WHERE Id = @oldId AND Name <> N'String--dropDownList')
            THROW 52105, 'SD has an unexpected name.', 1;

        -- Remap every declared FK to the retired type, including references
        -- outside Field Manager. The three snapshot tables also contain type
        -- IDs that are not all declared as foreign keys.
        DECLARE @schema sysname, @table sysname, @column sysname, @sql nvarchar(max);
        DECLARE referencesToType CURSOR LOCAL FAST_FORWARD FOR
            SELECT OBJECT_SCHEMA_NAME(fkc.parent_object_id),
                   OBJECT_NAME(fkc.parent_object_id),
                   COL_NAME(fkc.parent_object_id, fkc.parent_column_id)
            FROM sys.foreign_key_columns AS fkc
            WHERE fkc.referenced_object_id = OBJECT_ID(N'dbo.SycEntityObjectTypes')
              AND COL_NAME(fkc.referenced_object_id, fkc.referenced_column_id) = N'Id';
        OPEN referencesToType;
        FETCH NEXT FROM referencesToType INTO @schema, @table, @column;
        WHILE @@FETCH_STATUS = 0
        BEGIN
            SET @sql = N'UPDATE ' + QUOTENAME(@schema) + N'.' + QUOTENAME(@table)
                + N' SET ' + QUOTENAME(@column) + N' = @targetId WHERE '
                + QUOTENAME(@column) + N' = @oldId';
            EXEC sys.sp_executesql @sql, N'@targetId bigint, @oldId bigint',
                @targetId = @targetId, @oldId = @oldId;
            FETCH NEXT FROM referencesToType INTO @schema, @table, @column;
        END;
        CLOSE referencesToType;
        DEALLOCATE referencesToType;

        UPDATE dbo.AppFields SET
            EntitySycObjectId = CASE WHEN EntitySycObjectId = @oldId THEN @targetId ELSE EntitySycObjectId END,
            FieldTypeId = CASE WHEN FieldTypeId = @oldId THEN @targetId ELSE FieldTypeId END,
            WidgetTypeId = CASE WHEN WidgetTypeId = @oldId THEN @targetId ELSE WidgetTypeId END,
            SourceEntityObjectTypeId = CASE WHEN SourceEntityObjectTypeId = @oldId THEN @targetId ELSE SourceEntityObjectTypeId END
        WHERE EntitySycObjectId = @oldId OR FieldTypeId = @oldId
           OR WidgetTypeId = @oldId OR SourceEntityObjectTypeId = @oldId;
        UPDATE dbo.AppFieldsHistory SET
            EntitySycObjectId = CASE WHEN EntitySycObjectId = @oldId THEN @targetId ELSE EntitySycObjectId END,
            FieldTypeId = CASE WHEN FieldTypeId = @oldId THEN @targetId ELSE FieldTypeId END,
            WidgetTypeId = CASE WHEN WidgetTypeId = @oldId THEN @targetId ELSE WidgetTypeId END,
            SourceEntityObjectTypeId = CASE WHEN SourceEntityObjectTypeId = @oldId THEN @targetId ELSE SourceEntityObjectTypeId END
        WHERE EntitySycObjectId = @oldId OR FieldTypeId = @oldId
           OR WidgetTypeId = @oldId OR SourceEntityObjectTypeId = @oldId;
        UPDATE dbo.AppTableFields SET
            SycEntityObjectTypeId = CASE WHEN SycEntityObjectTypeId = @oldId THEN @targetId ELSE SycEntityObjectTypeId END,
            EntitySycObjectId = CASE WHEN EntitySycObjectId = @oldId THEN @targetId ELSE EntitySycObjectId END,
            FieldTypeId = CASE WHEN FieldTypeId = @oldId THEN @targetId ELSE FieldTypeId END,
            WidgetTypeId = CASE WHEN WidgetTypeId = @oldId THEN @targetId ELSE WidgetTypeId END,
            SourceEntityObjectTypeId = CASE WHEN SourceEntityObjectTypeId = @oldId THEN @targetId ELSE SourceEntityObjectTypeId END
        WHERE SycEntityObjectTypeId = @oldId OR EntitySycObjectId = @oldId
           OR FieldTypeId = @oldId OR WidgetTypeId = @oldId
           OR SourceEntityObjectTypeId = @oldId;

        DELETE FROM dbo.SycEntityObjectTypes WHERE Id = @oldId;
    END;

    UPDATE dbo.SycEntityObjectTypes
    SET Name = N'String--Dropdown', LastModificationTime = SYSUTCDATETIME()
    WHERE Id = @targetId AND Name <> N'String--Dropdown';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF CURSOR_STATUS('local', 'referencesToType') >= 0 CLOSE referencesToType;
    IF CURSOR_STATUS('local', 'referencesToType') > -3 DEALLOCATE referencesToType;
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

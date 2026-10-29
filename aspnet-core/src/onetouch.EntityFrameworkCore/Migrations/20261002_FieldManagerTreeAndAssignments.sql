-- Iteration 51: field assignments and order-header tree placement.
-- Run after 20260930185118_AddAppFieldsFieldManager / Create_APPFields_and_History.sql.
SET XACT_ABORT ON;
BEGIN TRY
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.APPFields', N'U') IS NULL
    THROW 51050, 'APPFields migration must be applied first.', 1;

IF OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.AppTableFields
    (
        Id bigint IDENTITY(1,1) NOT NULL CONSTRAINT PK_AppTableFields PRIMARY KEY,
        TenantId int NULL,
        AppFieldId bigint NOT NULL,
        SycObjectId bigint NOT NULL,
        SycEntityObjectTypeId bigint NULL,
        CreationTime datetime2 NOT NULL,
        CreatorUserId bigint NULL,
        CONSTRAINT FK_AppTableFields_APPFields_AppFieldId FOREIGN KEY (AppFieldId)
            REFERENCES dbo.APPFields(Id),
        CONSTRAINT FK_AppTableFields_SydObjects_SycObjectId FOREIGN KEY (SycObjectId)
            REFERENCES dbo.SydObjects(Id),
        CONSTRAINT FK_AppTableFields_SycEntityObjectTypes_SycEntityObjectTypeId FOREIGN KEY (SycEntityObjectTypeId)
            REFERENCES dbo.SycEntityObjectTypes(Id)
    );
    CREATE INDEX IX_AppTableFields_AppFieldId ON dbo.AppTableFields(AppFieldId);
    CREATE INDEX IX_AppTableFields_SycObjectId ON dbo.AppTableFields(SycObjectId);
    CREATE INDEX IX_AppTableFields_SycEntityObjectTypeId ON dbo.AppTableFields(SycEntityObjectTypeId);
    CREATE INDEX IX_AppTableFields_TenantId_SycObjectId_SycEntityObjectTypeId
        ON dbo.AppTableFields(TenantId, SycObjectId, SycEntityObjectTypeId);
    CREATE UNIQUE INDEX IX_AppTableFields_TenantId_AppFieldId_SycObjectId_SycEntityObjectTypeId
        ON dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId);
END;

-- Existing field definitions without explicit assignments belong to their data object.
INSERT dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
SELECT f.TenantId, f.Id, f.SycObjectId, NULL, SYSUTCDATETIME(), f.CreatorUserId
FROM dbo.APPFields AS f
WHERE f.IsDeleted = 0
  AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFields AS a WHERE a.AppFieldId = f.Id);

IF (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0) <> 1
    OR (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0) <> 1
    THROW 51053, 'Expected one active ENTITY and DATA object type.', 1;
DECLARE @entityTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0);
DECLARE @dataTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0);
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION' OR Name = N'Transaction')
      AND NOT (Code = N'TRANSACTION' AND ObjectTypeId = @entityTypeId
          AND ObjectTypeCode = N'ENTITY' AND ParentId IS NULL
          AND ParentCode IS NULL AND IsDeleted = 0))
    THROW 51054, 'A conflicting Transaction object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Transaction', N'TRANSACTION', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0) <> 1
    THROW 51054, 'Expected one Transaction object.', 1;
DECLARE @transactionId bigint = (SELECT Id FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION' AND IsDeleted = 0);
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION-HEADER-DATA' OR Name = N'AppTransactionHeaders')
      AND NOT (Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
          AND ObjectTypeId = @dataTypeId AND ObjectTypeCode = N'DATA'
          AND ParentId = @transactionId AND ParentCode = N'TRANSACTION'
          AND IsDeleted = 0))
    THROW 51055, 'A conflicting AppTransactionHeaders object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'AppTransactionHeaders', N'TRANSACTION-HEADER-DATA',
            @transactionId, N'TRANSACTION', N'DATA', @dataTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0) <> 1
    THROW 51055, 'Expected one AppTransactionHeaders object.', 1;
DECLARE @headerId bigint = (SELECT Id FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0);
IF @headerId IS NULL OR @transactionId IS NULL
    THROW 51051, 'Transaction metadata is missing.', 1;
IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
           WHERE Code IN (N'SALESORDER', N'PURCHASEORDER') AND IsDeleted = 0
             AND ObjectId NOT IN (@transactionId, @headerId))
    THROW 51052, 'Order type is attached to an unexpected object.', 1;
UPDATE dbo.SycEntityObjectTypes
SET ObjectId = @headerId, ObjectCode = N'TRANSACTION-HEADER-DATA'
WHERE Code IN (N'SALESORDER', N'PURCHASEORDER') AND IsDeleted = 0
  AND ObjectId = @transactionId;

IF OBJECT_ID(N'dbo.__EFMigrationsHistory', N'U') IS NOT NULL
   AND NOT EXISTS (SELECT 1 FROM dbo.__EFMigrationsHistory
                   WHERE MigrationId = N'20261002120000_AddAppTableFields')
    INSERT dbo.__EFMigrationsHistory(MigrationId, ProductVersion)
    VALUES (N'20261002120000_AddAppTableFields', N'7.0.1');

COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

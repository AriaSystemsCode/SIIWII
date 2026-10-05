-- Iteration 51: field assignments and order-header tree placement.
-- Run after 20260930185118_AddAppFieldsFieldManager / Create_APPFields_and_History.sql.
SET XACT_ABORT ON;
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

DECLARE @headerId bigint = (SELECT Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0);
DECLARE @transactionId bigint = (SELECT Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0);
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

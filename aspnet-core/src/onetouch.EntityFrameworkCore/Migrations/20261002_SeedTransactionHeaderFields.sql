-- Iteration 51 reviewed transaction-header fields: 37 shared, 5 sales-only.
-- Run after the Field Manager migrations through NormalizeFieldExtraAttributes.
-- Creates missing Transaction, BaseEntity, AppEntity, header, and Field metadata.
-- Rerunnable: existing definitions and applied snapshots are preserved.
SET XACT_ABORT ON;
BEGIN TRY
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.AppFields', N'U') IS NULL OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
    OR OBJECT_ID(N'dbo.AppFieldsHistory', N'U') IS NULL
    THROW 51060, 'Apply the Field Manager table migrations first.', 1;
IF COL_LENGTH(N'dbo.AppFields', N'ExtraAttributes') IS NOT NULL
    OR COL_LENGTH(N'dbo.AppFields', N'SourceAttributeId') IS NULL
    OR COL_LENGTH(N'dbo.AppFieldsHistory', N'SnapshotJson') IS NOT NULL
    OR COL_LENGTH(N'dbo.AppTableFields', N'SnapshotJson') IS NOT NULL
    OR COL_LENGTH(N'dbo.AppTableFields', N'SourceAppFieldId') IS NULL
    THROW 51067, 'Apply the current typed Field Manager migrations first.', 1;
IF COL_LENGTH(N'dbo.SydObjects', N'BaseEntityId') IS NULL
    THROW 51072, 'Apply the SydObjects BaseEntityId migration first.', 1;
IF (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0) <> 1
    OR (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0) <> 1
    THROW 51073, 'Expected one active ENTITY and DATA object type.', 1;
DECLARE @entityTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0);
DECLARE @dataTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0);
DECLARE @entityId bigint;
DECLARE @headerId bigint;
DECLARE @baseEntityId bigint;
DECLARE @appEntityId bigint;
DECLARE @fieldObjectId bigint;
DECLARE @fieldRootId bigint;
DECLARE @salesId bigint;
DECLARE @salesAliasId bigint;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION' OR Name = N'Transaction')
      AND NOT (Code = N'TRANSACTION' AND ObjectTypeId = @entityTypeId
        AND ObjectTypeCode = N'ENTITY' AND ParentId IS NULL
        AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51061, 'A conflicting Transaction object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Transaction', N'TRANSACTION', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0) <> 1
    THROW 51061, 'Expected one Transaction object.', 1;
SELECT @entityId = Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'BASEENTITY' OR Name = N'BaseEntity')
      AND NOT (Code = N'BASEENTITY' AND Name = N'BaseEntity'
        AND ObjectTypeId = @entityTypeId AND ObjectTypeCode = N'ENTITY'
        AND ParentId IS NULL AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51074, 'A conflicting BaseEntity object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'BASEENTITY' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'BaseEntity', N'BASEENTITY', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'BASEENTITY' AND IsDeleted = 0) <> 1
    THROW 51074, 'Expected one BaseEntity object.', 1;
SELECT @baseEntityId = Id FROM dbo.SydObjects WHERE Code = N'BASEENTITY' AND IsDeleted = 0;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'APPENTITY-DATA' OR Name = N'AppEntity')
      AND NOT (Code = N'APPENTITY-DATA' AND Name = N'AppEntity'
        AND ObjectTypeId = @dataTypeId AND ObjectTypeCode = N'DATA'
        AND ParentId = @baseEntityId AND ParentCode = N'BASEENTITY' AND IsDeleted = 0))
    THROW 51075, 'A conflicting AppEntity object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'APPENTITY-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'AppEntity', N'APPENTITY-DATA',
            @baseEntityId, N'BASEENTITY', N'DATA', @dataTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'APPENTITY-DATA' AND IsDeleted = 0) <> 1
    THROW 51075, 'Expected one AppEntity object.', 1;
SELECT @appEntityId = Id FROM dbo.SydObjects WHERE Code = N'APPENTITY-DATA' AND IsDeleted = 0;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION-HEADER-DATA' OR Name = N'AppTransactionHeaders')
      AND NOT (Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
        AND ObjectTypeId = @dataTypeId AND ObjectTypeCode = N'DATA'
        AND ParentId = @entityId AND ParentCode = N'TRANSACTION' AND IsDeleted = 0))
    THROW 51076, 'A conflicting AppTransactionHeaders object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode,
         ObjectTypeCode, ObjectTypeId, BaseEntityId)
    VALUES (SYSUTCDATETIME(), 0, N'AppTransactionHeaders', N'TRANSACTION-HEADER-DATA',
            @entityId, N'TRANSACTION', N'DATA', @dataTypeId, @appEntityId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0) <> 1
    THROW 51076, 'Expected one AppTransactionHeaders object.', 1;
SELECT @headerId = Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0;
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE Id = @headerId AND BaseEntityId IS NOT NULL AND BaseEntityId <> @appEntityId)
    THROW 51077, 'AppTransactionHeaders has a different base entity.', 1;
UPDATE dbo.SydObjects SET BaseEntityId = @appEntityId
WHERE Id = @headerId AND BaseEntityId IS NULL;

IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'FIELD' OR Name = N'Field')
      AND NOT (Code = N'FIELD' AND Name = N'Field'
        AND ObjectTypeId = @entityTypeId AND ObjectTypeCode = N'ENTITY'
        AND ParentId IS NULL AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51078, 'A conflicting Field object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Field', N'FIELD', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0) <> 1
    THROW 51078, 'Expected one Field object.', 1;
SELECT @fieldObjectId = Id FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0;
IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE Code = N'FIELD' AND (ObjectId <> @fieldObjectId OR ParentId IS NOT NULL OR IsDeleted <> 0))
    THROW 51079, 'A conflicting Field type root exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL AND IsDeleted = 0)
    INSERT dbo.SycEntityObjectTypes
        (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, TenantId, IsDefault)
    VALUES (SYSUTCDATETIME(), 0, N'FIELD', N'Field', @fieldObjectId, N'FIELD', NULL, 0);
IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
    WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL AND IsDeleted = 0) <> 1
    THROW 51079, 'Expected one Field type root.', 1;
SELECT @fieldRootId = Id FROM dbo.SycEntityObjectTypes
WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL AND IsDeleted = 0;

DECLARE @requiredTypes table (Code nvarchar(50) PRIMARY KEY, Name nvarchar(250) NOT NULL);
INSERT @requiredTypes (Code, Name) VALUES
    (N'ST', N'String--Textbox'), (N'IN', N'Integer--Numeric input'),
    (N'IC', N'Integer--Currency'), (N'DP', N'Date--Date picker'),
    (N'LD', N'List--Dropdown'), (N'BOOLEAN', N'Boolean--Checkbox');
IF EXISTS (SELECT 1 FROM @requiredTypes s JOIN dbo.SycEntityObjectTypes t
    ON t.Code = s.Code OR t.Name = s.Name
    WHERE NOT (t.Code = s.Code AND t.Name = s.Name AND t.ObjectId = @fieldObjectId
        AND t.ObjectCode = N'FIELD' AND t.ParentId = @fieldRootId
        AND t.ParentCode = N'FIELD' AND t.TenantId IS NULL AND t.IsDeleted = 0))
    THROW 51080, 'A conflicting Field data type exists.', 1;
INSERT dbo.SycEntityObjectTypes
    (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, ParentId, ParentCode, TenantId, IsDefault)
SELECT SYSUTCDATETIME(), 0, s.Code, s.Name, @fieldObjectId, N'FIELD',
       @fieldRootId, N'FIELD', NULL, 0
FROM @requiredTypes s
WHERE NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes t
    WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
      AND t.Code = s.Code AND t.IsDeleted = 0);

IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE Code IN (N'SALESORDER', N'PURCHASEORDER') AND IsDeleted = 0
      AND (ObjectId <> @headerId OR ObjectCode <> N'TRANSACTION-HEADER-DATA'))
    THROW 51081, 'An order type is assigned to a different object.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE Code = N'SALESORDER' AND ObjectId = @headerId AND IsDeleted = 0)
    INSERT dbo.SycEntityObjectTypes
        (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, TenantId, IsDefault)
    VALUES (SYSUTCDATETIME(), 0, N'SALESORDER', N'Sales Order',
            @headerId, N'TRANSACTION-HEADER-DATA', NULL, 0);
IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE Code = N'PURCHASEORDER' AND ObjectId = @headerId AND IsDeleted = 0)
    INSERT dbo.SycEntityObjectTypes
        (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, TenantId, IsDefault)
    VALUES (SYSUTCDATETIME(), 0, N'PURCHASEORDER', N'Purchase Order',
            @headerId, N'TRANSACTION-HEADER-DATA', NULL, 0);
IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
    WHERE Code = N'SALESORDER' AND ObjectId = @headerId AND IsDeleted = 0) <> 1
    OR (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
        WHERE Code = N'PURCHASEORDER' AND ObjectId = @headerId AND IsDeleted = 0) <> 1
    THROW 51082, 'Expected one Sales and Purchase Order header type.', 1;
SELECT @salesId = Id FROM dbo.SycEntityObjectTypes
WHERE Code = N'SALESORDER' AND ObjectId = @headerId AND IsDeleted = 0;
SELECT @salesAliasId = Id FROM dbo.SycEntityObjectTypes
WHERE Code = N'SALESORDERHEADER' AND ObjectId = @headerId AND IsDeleted = 0;

CREATE TABLE #SeedFields
(
    FieldCode nvarchar(11) COLLATE DATABASE_DEFAULT NOT NULL,
    FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY,
    Description nvarchar(2000) COLLATE DATABASE_DEFAULT NULL,
    FieldTypeId bigint NOT NULL,
    FieldLevelCode nvarchar(32) COLLATE DATABASE_DEFAULT NOT NULL,
    FieldStatusCode nvarchar(32) COLLATE DATABASE_DEFAULT NOT NULL,
    TrackingNo nvarchar(100) COLLATE DATABASE_DEFAULT NULL,
    CurrentRevisionNo nvarchar(10) COLLATE DATABASE_DEFAULT NOT NULL,
    IsStandard bit NOT NULL,
    IsCustom bit NOT NULL,
    IsExtraField bit NOT NULL,
    IsHidden bit NOT NULL,
    AllowNull bit NOT NULL,
    [Length] int NULL,
    Decimals int NULL,
    DefaultValue nvarchar(2000) COLLATE DATABASE_DEFAULT NULL,
    DateFormat nvarchar(100) COLLATE DATABASE_DEFAULT NULL,
    TimeFormat nvarchar(100) COLLATE DATABASE_DEFAULT NULL,
    AllowMultiSelect bit NOT NULL,
    Required bit NOT NULL,
    Visible bit NOT NULL,
    Editable bit NOT NULL,
    LegacyMetadataJson nvarchar(max) COLLATE DATABASE_DEFAULT NULL,
    AssignmentKind tinyint NOT NULL -- 0 = header shared, 1 = sales-only
);
INSERT #SeedFields
(FieldCode, FieldName, Description, FieldTypeId, FieldLevelCode, FieldStatusCode,
 TrackingNo, CurrentRevisionNo, IsStandard, IsCustom, IsExtraField, IsHidden, AllowNull,
 [Length], Decimals, DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required,
 Visible, Editable, LegacyMetadataJson, AssignmentKind)
VALUES
    (N'INSID__0001', N'Id', N'AppTransactionHeaders primary key', 829, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, 0, NULL, NULL, NULL, 0, 1, 0, 0, NULL, 0),
    (N'STSENTE0001', N'EnteredUserByRole', N'Role of user who entered the transaction', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0002', N'BuyerCompanySSIN', N'Buyer company SSIN', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0003', N'BuyerContactSSIN', N'Buyer Contact SSIN', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0004', N'SellerCompanySSIN', N'Seller Company SSIN', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0005', N'SellerContactSSIN', N'Seller Contact SSIN', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0006', N'SellerContactName', N'Seller Contact Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0007', N'BuyerContactEMailAddress', N'Buyer Contact Email Address', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 100, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'LDSLANG0001', N'LanguageId', N'Language ID', 830, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, 0),
    (N'STSLANG0008', N'LanguageCode', N'Language Code', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'LDSCURR0002', N'CurrencyId', N'Currency ID', 830, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, 0),
    (N'STSCURR0009', N'CurrencyCode', N'Currency Code', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0010', N'SellerContactEMailAddress', N'Seller Contact Email Address', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 100, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0011', N'BuyerContactPhoneNumber', N'Buyer Contact Phone Number', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 20, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0012', N'SellerContactPhoneNumber', N'Seller Contact Phone Number', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 20, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0013', N'BuyerCompanyName', N'Buyer Company Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSBUYE0014', N'BuyerContactName', N'Buyer Contact Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSELL0015', N'SellerCompanyName', N'Seller Company Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSPRIC0016', N'PriceLevel', N'Price Level', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'DPSCOMP0001', N'CompleteDate', N'Complete Date', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, NULL, N'yyyy-MM-dd', NULL, 0, 1, 1, 1, NULL, 0),
    (N'DPSAVAI0002', N'AvailableDate', N'Available Date', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, N'0001-01-01T00:00:00.0000000', N'yyyy-MM-dd', NULL, 0, 1, 1, 1, NULL, 0),
    (N'STSBUYE0017', N'BuyerDepartment', N'Buyer Department', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSPAYM0018', N'PaymentTermsCode', N'Payment Terms Code', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'LDSPAYM0003', N'PaymentTermsId', N'Payment Terms ID', 830, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, 0),
    (N'STSSHIP0019', N'ShipViaCode', N'Ship Via Code', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'LDSSHIP0004', N'ShipViaId', N'Ship Via ID', 830, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, 0),
    (N'DPSSTAR0003', N'StartDate', N'Start Date', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, N'0001-01-01T00:00:00.0000000', N'yyyy-MM-dd', NULL, 0, 1, 1, 1, NULL, 0),
    (N'ICSCURR0001', N'CurrencyExchangeRate', N'Currency Exchange Rate', 828, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, 2, N'0', NULL, NULL, 0, 1, 1, 1, NULL, 0),
    (N'STSBUYE0020', N'BuyerStore', N'Buyer Store', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'ICSTOTA0002', N'TotalAmount', N'Total Amount', 828, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, 2, N'0', NULL, NULL, 0, 1, 1, 1, NULL, 0),
    (N'INSTOTA0002', N'TotalQuantity', N'Total Quantity', 829, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, 0, N'0', NULL, NULL, 0, 1, 1, 1, NULL, 0),
    (N'STSPAYM0021', N'PaymentTermsName', N'Payment Terms Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSSHIP0022', N'ShipViaName', N'Ship Via Name', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, NULL, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'STSREFE0023', N'Reference', N'Reference', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 1, 50, NULL, NULL, NULL, NULL, 0, 0, 1, 1, NULL, 0),
    (N'DPSENTE0004', N'EnteredDate', N'Entered Date', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, N'0001-01-01T00:00:00.0000000', N'yyyy-MM-dd', NULL, 0, 1, 1, 1, NULL, 0),
    (N'DPSORDE0005', N'OrderConfirmationTimeStamp', N'Order Confirmation Timestamp', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, N'0001-01-01T00:00:00.0000000', N'yyyy-MM-dd', N'HH:mm:ss', 0, 1, 1, 1, NULL, 0),
    (N'DPSTIME0006', N'TimeStamp', N'Timestamp', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 0, 0, 0, NULL, NULL, N'0001-01-01T00:00:00.0000000', N'yyyy-MM-dd', N'HH:mm:ss', 0, 1, 1, 1, NULL, 0),
    (N'BOSAPPR0001', N'Approved', N'Approved', 826, N'System', N'Proposed', NULL, N'00', 1, 0, 1, 0, 1, 1, 0, NULL, NULL, NULL, 0, 0, 1, 1, N'{"sourceEntityObjectTypeId":723,"sourceAttributeId":1111,"sourceDataType":"boolean","usage":"Order Approval","isLookup":false,"allowAddNew":false,"acceptMultipleValues":false,"isVariation":false,"isAdvancedSearch":true}', 1),
    (N'STSAPPR0024', N'ApprovalNumber', N'Approval Number', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 1, 0, 1, 50, 0, NULL, NULL, NULL, 0, 0, 1, 1, N'{"sourceEntityObjectTypeId":723,"sourceAttributeId":1112,"sourceDataType":"string","usage":"Order Approval","isLookup":false,"allowAddNew":false,"acceptMultipleValues":false,"isVariation":false,"isAdvancedSearch":true}', 1),
    (N'ICSAPPR0003', N'Approved Amount', N'Approved Amount', 828, N'System', N'Proposed', NULL, N'00', 1, 0, 1, 0, 1, 15, 2, NULL, NULL, NULL, 0, 0, 1, 1, N'{"sourceEntityObjectTypeId":723,"sourceAttributeId":1113,"sourceDataType":"Numeric","usage":"Order Approval","isLookup":false,"allowAddNew":false,"acceptMultipleValues":false,"isVariation":false,"isAdvancedSearch":true}', 1),
    (N'DPSAPPR0007', N'Approved Date', N'Approved Date', 827, N'System', N'Proposed', NULL, N'00', 1, 0, 1, 0, 1, NULL, 0, NULL, N'yyyy-MM-dd', N'HH:mm:ss', 0, 0, 1, 1, N'{"sourceEntityObjectTypeId":723,"sourceAttributeId":1114,"sourceDataType":"Datetime","usage":"Order Approval","isLookup":false,"allowAddNew":false,"acceptMultipleValues":false,"isVariation":false,"isAdvancedSearch":false}', 1),
    (N'STSAPPR0025', N'Approval Reason', N'Approval Reason', 831, N'System', N'Proposed', NULL, N'00', 1, 0, 1, 0, 1, 50, 0, NULL, NULL, NULL, 0, 0, 1, 1, N'{"sourceEntityObjectTypeId":723,"sourceAttributeId":1115,"sourceDataType":"string","usage":"Order Approval","isLookup":true,"allowAddNew":true,"acceptMultipleValues":false,"isVariation":false,"isAdvancedSearch":false,"entityObjectTypeCode":"APPROVALR"}', 1);

IF (SELECT COUNT(*) FROM #SeedFields) <> 42 OR
   (SELECT COUNT(*) FROM #SeedFields WHERE AssignmentKind = 0) <> 37 OR
   (SELECT COUNT(*) FROM #SeedFields WHERE AssignmentKind = 1) <> 5
    THROW 51063, 'Unexpected sample field counts.', 1;
-- The numeric IDs in the reviewed source rows are staging values only. Resolve
-- each field type from metadata in the target database before persisting it.
IF EXISTS (SELECT 1 FROM #SeedFields s OUTER APPLY
    (SELECT COUNT(*) AS Cnt FROM dbo.SycEntityObjectTypes t
     WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId AND t.IsDeleted = 0
       AND t.Code = CASE LEFT(s.FieldCode, 2)
           WHEN N'BO' THEN N'BOOLEAN' ELSE LEFT(s.FieldCode, 2) END) matches
    WHERE matches.Cnt <> 1)
    THROW 51064, 'A field type is missing or duplicated.', 1;
UPDATE s SET FieldTypeId = t.Id
FROM #SeedFields s
JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
    AND t.ParentId = @fieldRootId AND t.IsDeleted = 0
    AND t.Code = CASE LEFT(s.FieldCode, 2)
        WHEN N'BO' THEN N'BOOLEAN' ELSE LEFT(s.FieldCode, 2) END;
IF EXISTS (SELECT 1 FROM #SeedFields s JOIN dbo.AppFields f
    ON f.SycObjectId = @headerId AND f.FieldName = s.FieldName
       AND f.TenantId IS NULL AND f.IsDeleted = 0
    GROUP BY s.FieldName HAVING COUNT(*) > 1)
    THROW 51069, 'More than one active header definition has the same field name.', 1;

-- Preserve codes already assigned to this header, including codes allocated on
-- an earlier run. A new field gets the next sequence when its sample code is taken.
UPDATE s SET FieldCode = f.FieldCode
FROM #SeedFields s
JOIN dbo.AppFields f ON f.SycObjectId = @headerId AND f.FieldName = s.FieldName
    AND f.TenantId IS NULL AND f.IsDeleted = 0;
;WITH Collisions AS
(
    SELECT s.FieldName, s.FieldTypeId,
        ROW_NUMBER() OVER (PARTITION BY s.FieldTypeId ORDER BY s.FieldName) AS Ordinal
    FROM #SeedFields s
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields own
        WHERE own.SycObjectId = @headerId AND own.FieldName = s.FieldName
          AND own.TenantId IS NULL AND own.IsDeleted = 0)
      AND EXISTS (SELECT 1 FROM dbo.AppFields used
        WHERE used.FieldCode = s.FieldCode AND used.TenantId IS NULL AND used.IsDeleted = 0)
), SequenceBase AS
(
    SELECT t.FieldTypeId,
        COALESCE(MAX(TRY_CONVERT(int, RIGHT(t.FieldCode, 4))), 0) AS LastSequence
    FROM (
        SELECT FieldTypeId, FieldCode FROM dbo.AppFields
            WHERE TenantId IS NULL AND IsDeleted = 0 AND LEN(FieldCode) = 11
        UNION ALL
        SELECT FieldTypeId, FieldCode FROM #SeedFields WHERE LEN(FieldCode) = 11
    ) t
    GROUP BY t.FieldTypeId
)
SELECT c.FieldName, b.LastSequence + c.Ordinal AS NextSequence
INTO #CodeCollisions
FROM Collisions c JOIN SequenceBase b ON b.FieldTypeId = c.FieldTypeId;
IF EXISTS (SELECT 1 FROM #CodeCollisions WHERE NextSequence > 9999)
    THROW 51070, 'A field type has exhausted its four-digit code sequence.', 1;
UPDATE s SET FieldCode = LEFT(s.FieldCode, 7)
    + RIGHT(N'0000' + CONVERT(nvarchar(10), c.NextSequence), 4)
FROM #SeedFields s JOIN #CodeCollisions c ON c.FieldName = s.FieldName;
IF EXISTS (SELECT FieldCode FROM #SeedFields GROUP BY FieldCode HAVING COUNT(*) > 1)
    THROW 51071, 'The reviewed header fields resolve to duplicate codes.', 1;
IF EXISTS (SELECT 1 FROM #SeedFields
    WHERE IsExtraField = 1 AND (ISJSON(LegacyMetadataJson) <> 1
        OR TRY_CONVERT(bigint, JSON_VALUE(LegacyMetadataJson, '$.sourceAttributeId')) IS NULL))
    THROW 51068, 'An order approval field has invalid source metadata.', 1;
IF EXISTS (
    SELECT 1 FROM #SeedFields AS s JOIN dbo.AppFields AS f ON f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldCode=s.FieldCode
    WHERE f.FieldName<>s.FieldName OR f.FieldTypeId<>s.FieldTypeId OR f.SycObjectId<>@headerId
)
    THROW 51065, 'An existing field code conflicts with the sample.', 1;
IF EXISTS (
    SELECT 1 FROM #SeedFields AS s JOIN dbo.AppFields AS f ON f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldName=s.FieldName
    WHERE f.FieldCode<>s.FieldCode AND f.SycObjectId=@headerId
)
    THROW 51066, 'An existing field name has a different code.', 1;

INSERT dbo.AppFields
(TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
 Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId, FieldLevelCode,
 FieldStatusCode, TrackingNo, CurrentRevisionNo, IsStandard, IsCustom, IsExtraField,
 IsHidden, AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
 AllowMultiSelect, Required, Visible, Editable, SourceAttributeId, SourceDataType,
 SourceEntityObjectTypeId, EntityObjectTypeCode, Usage, IsLookup, IsVariation,
 IsAdvancedSearch, AcceptMultipleValues, AllowAddNew, CreationTime, CreatorUserId,
 LastModificationTime, LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
SELECT NULL, NULL, @headerId, @entityId, s.FieldCode, s.FieldName,
 s.Description, s.FieldTypeId, NULL, NULL, NULL, s.FieldLevelCode,
 s.FieldStatusCode, s.TrackingNo, s.CurrentRevisionNo, s.IsStandard, s.IsCustom, s.IsExtraField,
 s.IsHidden, s.AllowNull, s.[Length], s.Decimals, s.DefaultValue, s.DateFormat, s.TimeFormat,
 s.AllowMultiSelect, s.Required, s.Visible, s.Editable,
 TRY_CONVERT(bigint, JSON_VALUE(s.LegacyMetadataJson, '$.sourceAttributeId')),
 JSON_VALUE(s.LegacyMetadataJson, '$.sourceDataType'),
 CASE WHEN s.IsExtraField = 1 THEN @salesId ELSE NULL END,
 JSON_VALUE(s.LegacyMetadataJson, '$.entityObjectTypeCode'),
 JSON_VALUE(s.LegacyMetadataJson, '$.usage'),
 CASE WHEN JSON_VALUE(s.LegacyMetadataJson, '$.isLookup') = N'true' THEN 1
      WHEN s.IsExtraField = 1 THEN 0 ELSE NULL END,
 CASE WHEN s.IsExtraField = 1 THEN 0 ELSE NULL END,
 CASE WHEN JSON_VALUE(s.LegacyMetadataJson, '$.isAdvancedSearch') = N'true' THEN 1
      WHEN s.IsExtraField = 1 THEN 0 ELSE NULL END,
 CASE WHEN s.IsExtraField = 1 THEN 0 ELSE NULL END,
 CASE WHEN JSON_VALUE(s.LegacyMetadataJson, '$.allowAddNew') = N'true' THEN 1
      WHEN s.IsExtraField = 1 THEN 0 ELSE NULL END,
 SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
FROM #SeedFields AS s
WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields AS f
                  WHERE f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldCode=s.FieldCode);

-- Shared rows are inherited by Sales and Purchase Order; only five are sales-only.
CREATE TABLE #SeedAssignments (FieldCode nvarchar(11) COLLATE DATABASE_DEFAULT NOT NULL,
    SycEntityObjectTypeId bigint NULL);
INSERT #SeedAssignments (FieldCode, SycEntityObjectTypeId)
SELECT FieldCode, NULL FROM #SeedFields WHERE AssignmentKind = 0;
INSERT #SeedAssignments (FieldCode, SycEntityObjectTypeId)
SELECT FieldCode, @salesId FROM #SeedFields WHERE AssignmentKind = 1;
IF @salesAliasId IS NOT NULL
    INSERT #SeedAssignments (FieldCode, SycEntityObjectTypeId)
    SELECT FieldCode, @salesAliasId FROM #SeedFields WHERE AssignmentKind = 1;

INSERT dbo.AppTableFields
    (TenantId, FieldDefinitionKey, FieldCode, AppliedRevisionNo, SycObjectId,
     SycEntityObjectTypeId, SourceAppFieldId, FieldTenantId, SourceFieldId,
     DefinitionSycObjectId, EntitySycObjectId, FieldName, Description,
     FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId, FieldLevelCode,
     FieldStatusCode, TrackingNo, IsStandard, IsCustom, IsExtraField, IsHidden,
     AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
     AllowMultiSelect, Required, Visible, Editable, SourceAttributeId,
     SourceDataType, SourceEntityObjectTypeId, EntityObjectTypeCode, Usage,
     IsLookup, IsVariation, IsAdvancedSearch, AcceptMultipleValues, AllowAddNew,
     FieldCreationTime, FieldCreatorUserId, FieldLastModificationTime,
     FieldLastModifierUserId, FieldIsDeleted, FieldDeleterUserId,
     FieldDeletionTime, CreationTime, CreatorUserId)
SELECT f.TenantId, f.FieldDefinitionKey, f.FieldCode, f.CurrentRevisionNo,
       @headerId, target.SycEntityObjectTypeId, f.Id, f.TenantId,
       f.SourceFieldId, f.SycObjectId, f.EntitySycObjectId, f.FieldName,
       f.Description, f.FieldTypeId, f.WidgetTypeId, f.FieldLevelId,
       f.FieldStatusId, f.FieldLevelCode, f.FieldStatusCode, f.TrackingNo,
       f.IsStandard, f.IsCustom, f.IsExtraField, f.IsHidden, f.AllowNull,
       f.[Length], f.Decimals, f.DefaultValue, f.DateFormat, f.TimeFormat,
       f.AllowMultiSelect, f.Required, f.Visible, f.Editable,
       f.SourceAttributeId, f.SourceDataType, f.SourceEntityObjectTypeId,
       f.EntityObjectTypeCode, f.Usage, f.IsLookup, f.IsVariation,
       f.IsAdvancedSearch, f.AcceptMultipleValues, f.AllowAddNew,
       f.CreationTime, f.CreatorUserId, f.LastModificationTime,
       f.LastModifierUserId, f.IsDeleted, f.DeleterUserId, f.DeletionTime,
       SYSUTCDATETIME(), NULL
FROM #SeedAssignments target
JOIN dbo.AppFields f ON f.FieldCode = target.FieldCode
    AND f.TenantId IS NULL AND f.SycObjectId = @headerId AND f.IsDeleted = 0
WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
    WHERE a.TenantId IS NULL AND a.FieldDefinitionKey = f.FieldDefinitionKey
      AND a.SycObjectId = @headerId
      AND ((a.SycEntityObjectTypeId IS NULL AND target.SycEntityObjectTypeId IS NULL)
        OR a.SycEntityObjectTypeId = target.SycEntityObjectTypeId));

DECLARE @historyColumns nvarchar(max);
DECLARE @historyValues nvarchar(max);
DECLARE @historySql nvarchar(max);
SELECT @historyColumns = STRING_AGG(CAST(QUOTENAME(c.name) AS nvarchar(max)), N',')
        WITHIN GROUP (ORDER BY c.column_id),
       @historyValues = STRING_AGG(CAST(N'f.' + QUOTENAME(c.name) AS nvarchar(max)), N',')
        WITHIN GROUP (ORDER BY c.column_id)
FROM sys.columns c
JOIN sys.columns h ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';
SET @historySql = N'INSERT dbo.AppFieldsHistory
    (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
SELECT f.Id, f.CurrentRevisionNo, N''Create'', SYSUTCDATETIME(), ' + @historyValues + N'
FROM dbo.AppFields f
JOIN #SeedFields s ON s.FieldCode = f.FieldCode
WHERE f.SycObjectId = @objectId AND f.TenantId IS NULL AND f.IsDeleted = 0
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
      WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
EXEC sys.sp_executesql @historySql, N'@objectId bigint', @objectId = @headerId;

SELECT (SELECT COUNT(*) FROM dbo.AppFields WHERE TenantId IS NULL AND IsDeleted=0 AND SycObjectId=@headerId) AS HeaderFieldDefinitions,
       (SELECT COUNT(*) FROM dbo.AppTableFields WHERE TenantId IS NULL AND SycObjectId=@headerId AND SycEntityObjectTypeId IS NULL) AS SharedHeaderAssignments,
       (SELECT COUNT(*) FROM dbo.AppTableFields WHERE TenantId IS NULL AND SycObjectId=@headerId AND SycEntityObjectTypeId=@salesId) AS SalesSpecificAssignments;
DROP TABLE #SeedAssignments;
DROP TABLE #CodeCollisions;
DROP TABLE #SeedFields;
COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
    THROW;
END CATCH;

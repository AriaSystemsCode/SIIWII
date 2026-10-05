-- Iteration 51 sample fields. Source: Google Sheet "data sample" rows 16-57.
-- Run after 20261002_FieldManagerTreeAndAssignments.sql.
-- Rerunnable: existing host fields are checked and kept; missing assignments are inserted.
SET XACT_ABORT ON;
BEGIN TRANSACTION;

IF OBJECT_ID(N'dbo.APPFields', N'U') IS NULL OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
    THROW 51060, 'Apply the Field Manager table migrations first.', 1;
DECLARE @headerId bigint = (SELECT Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0);
DECLARE @entityId bigint = (SELECT Id FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0);
DECLARE @salesId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes WHERE Code = N'SALESORDER' AND ObjectId = @headerId AND IsDeleted = 0);
DECLARE @salesAliasId bigint = (SELECT Id FROM dbo.SycEntityObjectTypes WHERE Code = N'SALESORDERHEADER' AND ObjectId = @headerId AND IsDeleted = 0);
IF @headerId IS NULL OR @entityId IS NULL OR @salesId IS NULL
    THROW 51061, 'Transaction field metadata is missing.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes WHERE Code = N'PURCHASEORDER' AND ObjectId = @headerId AND IsDeleted = 0)
    THROW 51062, 'Purchase Order header metadata is missing.', 1;

CREATE TABLE #SeedFields
(
    FieldCode nvarchar(11) COLLATE DATABASE_DEFAULT NOT NULL PRIMARY KEY,
    FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL,
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
    ExtraAttributes nvarchar(max) COLLATE DATABASE_DEFAULT NULL,
    AssignmentKind tinyint NOT NULL -- 0 = header shared, 1 = sales-only
);
INSERT #SeedFields
(FieldCode, FieldName, Description, FieldTypeId, FieldLevelCode, FieldStatusCode,
 TrackingNo, CurrentRevisionNo, IsStandard, IsCustom, IsExtraField, IsHidden, AllowNull,
 [Length], Decimals, DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required,
 Visible, Editable, ExtraAttributes, AssignmentKind)
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
IF EXISTS (SELECT 1 FROM #SeedFields AS s LEFT JOIN dbo.SycEntityObjectTypes AS t ON t.Id=s.FieldTypeId
           WHERE t.Id IS NULL OR t.ObjectId <> (SELECT Id FROM dbo.SydObjects WHERE Code=N'FIELD' AND IsDeleted=0))
    THROW 51064, 'A sample field type is missing or invalid.', 1;
IF EXISTS (
    SELECT 1 FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldCode=s.FieldCode
    WHERE f.FieldName<>s.FieldName OR f.FieldTypeId<>s.FieldTypeId OR f.SycObjectId<>@headerId
)
    THROW 51065, 'An existing field code conflicts with the sample.', 1;
IF EXISTS (
    SELECT 1 FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldName=s.FieldName
    WHERE f.FieldCode<>s.FieldCode AND f.SycObjectId=@headerId
)
    THROW 51066, 'An existing field name has a different code.', 1;

INSERT dbo.APPFields
(TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
 Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId, FieldLevelCode,
 FieldStatusCode, TrackingNo, CurrentRevisionNo, IsStandard, IsCustom, IsExtraField,
 IsHidden, AllowNull, [Length], Decimals, DefaultValue, DateFormat, TimeFormat,
 AllowMultiSelect, Required, Visible, Editable, ExtraAttributes, CreationTime,
 CreatorUserId, LastModificationTime, LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
SELECT NULL, NULL, @headerId, @entityId, s.FieldCode, s.FieldName,
 s.Description, s.FieldTypeId, NULL, NULL, NULL, s.FieldLevelCode,
 s.FieldStatusCode, s.TrackingNo, s.CurrentRevisionNo, s.IsStandard, s.IsCustom, s.IsExtraField,
 s.IsHidden, s.AllowNull, s.[Length], s.Decimals, s.DefaultValue, s.DateFormat, s.TimeFormat,
 s.AllowMultiSelect, s.Required, s.Visible, s.Editable, s.ExtraAttributes, SYSUTCDATETIME(),
 NULL, NULL, NULL, 0, NULL, NULL
FROM #SeedFields AS s
WHERE NOT EXISTS (SELECT 1 FROM dbo.APPFields AS f WHERE f.TenantId IS NULL AND f.IsDeleted=0 AND f.FieldCode=s.FieldCode);

-- Shared header assignments are inherited by either order subtype.
INSERT dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
SELECT NULL, f.Id, @headerId, NULL, SYSUTCDATETIME(), NULL
FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.FieldCode=s.FieldCode AND f.TenantId IS NULL AND f.IsDeleted=0
WHERE s.AssignmentKind=0
  AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFields AS a WHERE a.AppFieldId=f.Id AND a.TenantId IS NULL
                  AND a.SycObjectId=@headerId AND a.SycEntityObjectTypeId IS NULL);

-- The five order approval attributes belong only to Sales Order Header.
INSERT dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
SELECT NULL, f.Id, @headerId, @salesId, SYSUTCDATETIME(), NULL
FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.FieldCode=s.FieldCode AND f.TenantId IS NULL AND f.IsDeleted=0
WHERE s.AssignmentKind=1
  AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFields AS a WHERE a.AppFieldId=f.Id AND a.TenantId IS NULL
                  AND a.SycObjectId=@headerId AND a.SycEntityObjectTypeId=@salesId);

-- The old header alias is still visible on some running versions of the tree API.
IF @salesAliasId IS NOT NULL
    INSERT dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
    SELECT NULL, f.Id, @headerId, @salesAliasId, SYSUTCDATETIME(), NULL
    FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.FieldCode=s.FieldCode AND f.TenantId IS NULL AND f.IsDeleted=0
    WHERE s.AssignmentKind=1
      AND NOT EXISTS (SELECT 1 FROM dbo.AppTableFields AS a WHERE a.AppFieldId=f.Id AND a.TenantId IS NULL
                      AND a.SycObjectId=@headerId AND a.SycEntityObjectTypeId=@salesAliasId);

INSERT dbo.AppFieldsHistory(TenantId, AppFieldId, RevisionNo, ChangeType, SnapshotJson, ChangedAt, ChangedBy, RestoredFromRevisionNo)
SELECT NULL, f.Id, f.CurrentRevisionNo, N'Create',
       (SELECT f.Id, f.SycObjectId, f.EntitySycObjectId, f.FieldCode, f.FieldName, f.Description,
               f.FieldTypeId, f.WidgetTypeId, f.FieldLevelCode, f.FieldStatusCode, f.TrackingNo,
               f.IsExtraField, f.AllowNull, f.[Length], f.Decimals, f.DefaultValue,
               f.DateFormat, f.TimeFormat, f.AllowMultiSelect, f.Required, f.Visible,
               f.Editable, f.ExtraAttributes FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
       SYSUTCDATETIME(), NULL, NULL
FROM #SeedFields AS s JOIN dbo.APPFields AS f ON f.FieldCode=s.FieldCode AND f.TenantId IS NULL AND f.IsDeleted=0
WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory AS h WHERE h.AppFieldId=f.Id AND h.RevisionNo=f.CurrentRevisionNo);

SELECT (SELECT COUNT(*) FROM dbo.APPFields WHERE TenantId IS NULL AND IsDeleted=0 AND SycObjectId=@headerId) AS HeaderFieldDefinitions,
       (SELECT COUNT(*) FROM dbo.AppTableFields WHERE TenantId IS NULL AND SycObjectId=@headerId AND SycEntityObjectTypeId IS NULL) AS SharedHeaderAssignments,
       (SELECT COUNT(*) FROM dbo.AppTableFields WHERE TenantId IS NULL AND SycObjectId=@headerId AND SycEntityObjectTypeId=@salesId) AS SalesSpecificAssignments;
COMMIT TRANSACTION;

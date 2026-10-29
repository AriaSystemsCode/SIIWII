-- Run from aspnet-core with sqlcmd -b -d onetouchDevDb3 -i tests/onetouch.Seeder.Tests/Test-OptionsListChipsDataType.sql.
-- Both seed runs take place inside an outer transaction; all row changes are rolled back.
:on error exit
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;

SELECT f.Id, f.CurrentRevisionNo, f.SourceDataType
INTO #BeforeField
FROM dbo.AppFields f JOIN dbo.SycEntityObjectTypes t ON t.Id = f.EntitySycObjectId
JOIN dbo.SydObjects o ON o.Id = t.ObjectId
WHERE o.Code = N'FIELD' AND t.Code = N'SC' AND t.Name = N'String--Chips'
  AND f.FieldName = N'OptionsList' AND f.TenantId IS NULL AND f.IsDeleted = 0;
IF (SELECT COUNT(*) FROM #BeforeField) <> 1
    THROW 51920, 'Test needs one seeded String--Chips OptionsList field.', 1;
GO
:r src/onetouch.EntityFrameworkCore/Migrations/20261025_FixOptionsListChipsDataType.sql
GO
IF @@TRANCOUNT <> 1 THROW 51921, 'Corrective seed did not retain the outer transaction.', 1;
IF EXISTS (SELECT 1 FROM #BeforeField b JOIN dbo.AppFields f ON f.Id = b.Id
    WHERE f.SourceDataType <> N'chips'
       OR TRY_CONVERT(int, f.CurrentRevisionNo) <> TRY_CONVERT(int, b.CurrentRevisionNo)
          + CASE WHEN b.SourceDataType = N'chips' THEN 0 ELSE 1 END)
    THROW 51922, 'OptionsList definition or revision is incorrect.', 1;
IF EXISTS (SELECT 1 FROM #BeforeField b JOIN dbo.AppFields f ON f.Id = b.Id
    JOIN dbo.AppTableFields a ON a.SourceAppFieldId = f.Id AND a.FieldDefinitionKey = f.FieldDefinitionKey
    WHERE a.SourceDataType <> N'chips' OR a.AppliedRevisionNo <> f.CurrentRevisionNo)
    THROW 51923, 'OptionsList snapshot does not match its definition.', 1;
IF EXISTS (SELECT 1 FROM #BeforeField b JOIN dbo.AppFields f ON f.Id = b.Id
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
        WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo))
    THROW 51924, 'Corrected OptionsList revision is missing from history.', 1;
IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes t JOIN dbo.AppFields f ON f.EntitySycObjectId = t.Id
    JOIN #BeforeField b ON b.Id = f.Id
    CROSS APPLY (SELECT TRY_CONVERT(xml, t.ExtraAttributes) AS AttributesXml) parsed
    WHERE parsed.AttributesXml.value(
        '(/ItemExtraAttributes/ExtraAttributes/ExtraAttribute[Code="OptionsList"]/DataType/text())[1]',
        'nvarchar(50)') <> N'chips')
    THROW 51925, 'OptionsList XML data type is not chips.', 1;

SELECT f.* INTO #AfterField FROM dbo.AppFields f JOIN #BeforeField b ON b.Id = f.Id;
SELECT h.* INTO #AfterHistory FROM dbo.AppFieldsHistory h JOIN #BeforeField b ON b.Id = h.AppFieldId;
SELECT a.* INTO #AfterSnapshot FROM dbo.AppTableFields a JOIN #BeforeField b ON b.Id = a.SourceAppFieldId;
SELECT t.Id, t.ExtraAttributes INTO #AfterType FROM dbo.SycEntityObjectTypes t
    JOIN dbo.AppFields f ON f.EntitySycObjectId = t.Id JOIN #BeforeField b ON b.Id = f.Id;
GO
:r src/onetouch.EntityFrameworkCore/Migrations/20261025_FixOptionsListChipsDataType.sql
GO
IF EXISTS (SELECT * FROM #AfterField EXCEPT SELECT * FROM dbo.AppFields WHERE Id IN (SELECT Id FROM #BeforeField))
    OR EXISTS (SELECT * FROM dbo.AppFields WHERE Id IN (SELECT Id FROM #BeforeField) EXCEPT SELECT * FROM #AfterField)
    OR EXISTS (SELECT * FROM #AfterHistory EXCEPT SELECT * FROM dbo.AppFieldsHistory)
    OR EXISTS (SELECT * FROM dbo.AppFieldsHistory WHERE AppFieldId IN (SELECT Id FROM #BeforeField) EXCEPT SELECT * FROM #AfterHistory)
    OR EXISTS (SELECT * FROM #AfterSnapshot EXCEPT SELECT * FROM dbo.AppTableFields)
    OR EXISTS (SELECT * FROM dbo.AppTableFields WHERE SourceAppFieldId IN (SELECT Id FROM #BeforeField) EXCEPT SELECT * FROM #AfterSnapshot)
    OR EXISTS (SELECT t.Id, t.ExtraAttributes FROM dbo.SycEntityObjectTypes t
        JOIN #AfterType a ON a.Id = t.Id EXCEPT SELECT * FROM #AfterType)
    THROW 51926, 'The second seed run changed OptionsList again.', 1;
ROLLBACK TRANSACTION;
PRINT 'PASS: OptionsList XML, definition, history, snapshot and second-run idempotency. Row changes rolled back.';

-- Run from aspnet-core using sqlcmd -b -d <local-test-db> -i tests/onetouch.Seeder.Tests/Test-HeaderFieldSettings.sql.
-- Executes the seed twice inside an outer transaction and rolls back all row changes.
:on error exit
SET NOCOUNT ON;
SET XACT_ABORT ON;
BEGIN TRANSACTION;
SELECT f.Id, f.FieldName, f.CurrentRevisionNo, f.IsLookup, f.EntityObjectTypeCode, f.ValidEntries
INTO #BeforeFields FROM dbo.AppFields f
WHERE f.TenantId IS NULL AND f.SycObjectId IS NULL AND f.IsDeleted = 0
  AND f.FieldName IN (N'ShipViaCode', N'PriceLevel')
  AND EXISTS (SELECT 1 FROM dbo.AppTableFields a JOIN dbo.SydObjects o ON o.Id = a.SycObjectId
      WHERE a.SourceAppFieldId = f.Id AND a.TenantId IS NULL AND o.Code = N'TRANSACTION-HEADER-DATA');
IF (SELECT COUNT(*) FROM #BeforeFields) <> 2 THROW 51900, 'Test needs the two seeded header fields.', 1;
SELECT * INTO #OldHistory FROM dbo.AppFieldsHistory WHERE AppFieldId IN (SELECT Id FROM #BeforeFields);
SELECT * INTO #OldHistoryValues FROM dbo.AppFieldHistorySettingValues WHERE AppFieldHistoryId IN (SELECT Id FROM #OldHistory);
SELECT * INTO #OldValues FROM dbo.AppFieldSettingValues WHERE AppFieldId IN (SELECT Id FROM #BeforeFields);
SELECT * INTO #Expected FROM (VALUES
    (N'ShipViaCode', N'IsLookup', N'true'),
    (N'ShipViaCode', N'EntityObjectTypeCode', N'SHIPVIA'),
    (N'PriceLevel', N'ValidEntries', N'MSRP|A|B|C|D')) v(FieldName, SettingName, [Value]);
SELECT f.Id INTO #NeedsRevision FROM #BeforeFields f
WHERE EXISTS (SELECT 1 FROM #Expected e WHERE e.FieldName = f.FieldName
    AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues v
        JOIN dbo.AppFields s ON s.Id = v.SettingFieldId
        JOIN dbo.AppFields parent ON parent.Id = f.Id
        WHERE v.AppFieldId = f.Id AND s.EntitySycObjectId = parent.FieldTypeId
          AND s.FieldName = e.SettingName AND s.SycObjectId IS NOT NULL
          AND s.TenantId IS NULL AND s.IsDeleted = 0 AND v.[Value] = e.[Value]
          AND v.SettingFieldCode = s.FieldCode AND v.SettingFieldName = s.FieldName));
GO
:r src/onetouch.EntityFrameworkCore/Migrations/20261021_SeedHeaderFieldSettings.sql
GO
IF @@TRANCOUNT <> 1 THROW 51901, 'Seed did not retain the outer test transaction.', 1;
IF EXISTS (SELECT 1 FROM #Expected e JOIN #BeforeFields f ON f.FieldName = e.FieldName
    WHERE (SELECT COUNT(*) FROM dbo.AppFieldSettingValues v JOIN dbo.AppFields s ON s.Id = v.SettingFieldId
        JOIN dbo.AppFields parent ON parent.Id = f.Id
        WHERE v.AppFieldId = f.Id AND v.[Value] = e.[Value] AND v.SettingFieldName = e.SettingName
          AND s.FieldName = e.SettingName AND s.EntitySycObjectId = parent.FieldTypeId
          AND s.Required = 0 AND s.SycObjectId IS NOT NULL AND s.TenantId IS NULL AND s.IsDeleted = 0) <> 1)
    THROW 51902, 'Expected one correct value and optional setting definition per setting.', 1;
IF EXISTS (SELECT Id, IsLookup, EntityObjectTypeCode, ValidEntries FROM #BeforeFields
    EXCEPT SELECT Id, IsLookup, EntityObjectTypeCode, ValidEntries FROM dbo.AppFields)
    THROW 51903, 'Seed changed a legacy metadata column.', 1;
IF EXISTS (SELECT 1 FROM #BeforeFields old JOIN dbo.AppFields f ON f.Id = old.Id
    WHERE TRY_CONVERT(int, f.CurrentRevisionNo) <> TRY_CONVERT(int, old.CurrentRevisionNo)
        + CASE WHEN EXISTS (SELECT 1 FROM #NeedsRevision n WHERE n.Id = f.Id) THEN 1 ELSE 0 END)
    THROW 51904, 'Revision number did not advance exactly once for each changed field.', 1;
IF EXISTS (SELECT * FROM #OldHistory EXCEPT SELECT * FROM dbo.AppFieldsHistory)
    OR EXISTS (SELECT * FROM #OldHistoryValues EXCEPT SELECT * FROM dbo.AppFieldHistorySettingValues)
    THROW 51905, 'Existing history was modified.', 1;
IF EXISTS (SELECT * FROM #OldValues WHERE SettingFieldName NOT IN (N'IsLookup', N'EntityObjectTypeCode', N'ValidEntries')
    EXCEPT SELECT * FROM dbo.AppFieldSettingValues)
    THROW 51906, 'An unrelated setting value was changed.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppFields f JOIN #NeedsRevision n ON n.Id = f.Id
    WHERE (SELECT COUNT(*) FROM dbo.AppFieldsHistory h WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo) <> 1)
    THROW 51907, 'Current revision history is missing.', 1;
IF EXISTS (SELECT h.Id, v.SettingFieldId, v.SettingFieldCode, v.SettingFieldName, v.[Value]
    FROM dbo.AppFieldsHistory h JOIN dbo.AppFields f ON f.Id = h.AppFieldId AND f.CurrentRevisionNo = h.RevisionNo
    JOIN #NeedsRevision n ON n.Id = f.Id JOIN dbo.AppFieldSettingValues v ON v.AppFieldId = f.Id
    EXCEPT SELECT AppFieldHistoryId, SettingFieldId, SettingFieldCode, SettingFieldName, [Value]
        FROM dbo.AppFieldHistorySettingValues)
    THROW 51908, 'New history did not retain all current setting values.', 1;
IF EXISTS (SELECT 1 FROM #BeforeFields f JOIN dbo.AppTableFields a ON a.SourceAppFieldId = f.Id
    JOIN dbo.SydObjects o ON o.Id = a.SycObjectId JOIN #Expected e ON e.FieldName = f.FieldName
    WHERE a.TenantId IS NULL AND o.Code = N'TRANSACTION-HEADER-DATA'
      AND (SELECT COUNT(*) FROM dbo.AppTableFieldSettingValues v
          WHERE v.AppTableFieldId = a.Id AND v.SettingFieldName = e.SettingName AND v.[Value] = e.[Value]) <> 1)
    THROW 51909, 'Header snapshot settings do not match.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppTableFields a JOIN dbo.AppFields f ON f.Id = a.SourceAppFieldId
    JOIN #NeedsRevision n ON n.Id = f.Id JOIN dbo.SydObjects o ON o.Id = a.SycObjectId
    WHERE a.TenantId IS NULL AND o.Code = N'TRANSACTION-HEADER-DATA' AND a.AppliedRevisionNo <> f.CurrentRevisionNo)
    THROW 51910, 'Header snapshot revision is stale.', 1;
SELECT f.* INTO #AfterFields FROM dbo.AppFields f
WHERE f.Id IN (SELECT Id FROM #BeforeFields)
   OR (f.FieldName IN (N'IsLookup', N'EntityObjectTypeCode', N'ValidEntries')
       AND f.TenantId IS NULL AND f.SycObjectId IS NOT NULL AND f.IsDeleted = 0);
SELECT * INTO #AfterHistory FROM dbo.AppFieldsHistory WHERE AppFieldId IN (SELECT Id FROM #AfterFields);
SELECT * INTO #AfterTables FROM dbo.AppTableFields WHERE SourceAppFieldId IN (SELECT Id FROM #AfterFields);
SELECT * INTO #AfterValues FROM dbo.AppFieldSettingValues WHERE AppFieldId IN (SELECT Id FROM #AfterFields);
SELECT * INTO #AfterHistoryValues FROM dbo.AppFieldHistorySettingValues WHERE AppFieldHistoryId IN (SELECT Id FROM #AfterHistory);
SELECT * INTO #AfterTableValues FROM dbo.AppTableFieldSettingValues WHERE AppTableFieldId IN (SELECT Id FROM #AfterTables);
GO
:r src/onetouch.EntityFrameworkCore/Migrations/20261021_SeedHeaderFieldSettings.sql
GO
IF EXISTS (SELECT * FROM #AfterFields EXCEPT SELECT * FROM dbo.AppFields)
    OR EXISTS (SELECT * FROM dbo.AppFields WHERE Id IN (SELECT Id FROM #AfterFields) EXCEPT SELECT * FROM #AfterFields)
    OR EXISTS (SELECT * FROM #AfterHistory EXCEPT SELECT * FROM dbo.AppFieldsHistory)
    OR EXISTS (SELECT * FROM dbo.AppFieldsHistory WHERE AppFieldId IN (SELECT Id FROM #AfterFields) EXCEPT SELECT * FROM #AfterHistory)
    OR EXISTS (SELECT * FROM #AfterTables EXCEPT SELECT * FROM dbo.AppTableFields)
    OR EXISTS (SELECT * FROM dbo.AppTableFields WHERE SourceAppFieldId IN (SELECT Id FROM #AfterFields) EXCEPT SELECT * FROM #AfterTables)
    OR EXISTS (SELECT * FROM #AfterValues EXCEPT SELECT * FROM dbo.AppFieldSettingValues)
    OR EXISTS (SELECT * FROM dbo.AppFieldSettingValues WHERE AppFieldId IN (SELECT Id FROM #AfterFields) EXCEPT SELECT * FROM #AfterValues)
    OR EXISTS (SELECT * FROM #AfterHistoryValues EXCEPT SELECT * FROM dbo.AppFieldHistorySettingValues)
    OR EXISTS (SELECT * FROM dbo.AppFieldHistorySettingValues WHERE AppFieldHistoryId IN (SELECT Id FROM #AfterHistory) EXCEPT SELECT * FROM #AfterHistoryValues)
    OR EXISTS (SELECT * FROM #AfterTableValues EXCEPT SELECT * FROM dbo.AppTableFieldSettingValues)
    OR EXISTS (SELECT * FROM dbo.AppTableFieldSettingValues WHERE AppTableFieldId IN (SELECT Id FROM #AfterTables) EXCEPT SELECT * FROM #AfterTableValues)
    THROW 51911, 'Second seed run changed definitions, revisions, assignments or value rows.', 1;
SELECT COUNT(*) AS FieldsWithNewRevision FROM #NeedsRevision;
ROLLBACK TRANSACTION;
PRINT 'PASS: setting values, revision history, snapshot values, legacy-column preservation and second-run idempotency. Row changes rolled back.';

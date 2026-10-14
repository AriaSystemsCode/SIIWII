using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261012110000_SeedAppEntityFields")]
    public class SeedAppEntityFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF OBJECT_ID(N'dbo.AppEntities', N'U') IS NULL OR OBJECT_ID(N'dbo.AppFields', N'U') IS NULL
    OR OBJECT_ID(N'dbo.AppFieldsHistory', N'U') IS NULL OR OBJECT_ID(N'dbo.AppTableFields', N'U') IS NULL
    THROW 51110, 'AppEntities and the current Field Manager tables are required.', 1;
IF COL_LENGTH(N'dbo.AppFieldsHistory', N'SnapshotJson') IS NOT NULL
    OR COL_LENGTH(N'dbo.AppFieldsHistory', N'FieldDefinitionKey') IS NULL
    OR COL_LENGTH(N'dbo.AppTableFields', N'SnapshotJson') IS NULL
    THROW 51121, 'Apply the typed field history and table snapshot migrations first.', 1;

DECLARE @baseEntityObjectId bigint;
DECLARE @appEntityObjectId bigint;
DECLARE @fieldObjectId bigint;
DECLARE @fieldRootId bigint;

IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'BASEENTITY' AND Name = N'BaseEntity' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0) <> 1
    THROW 51111, 'Expected one BaseEntity object.', 1;
SELECT @baseEntityObjectId = Id FROM dbo.SydObjects
WHERE Code = N'BASEENTITY' AND Name = N'BaseEntity' AND ObjectTypeCode = N'ENTITY' AND IsDeleted = 0;

IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'APPENTITY-DATA' AND Name = N'AppEntity' AND ObjectTypeCode = N'DATA'
      AND ParentId = @baseEntityObjectId AND IsDeleted = 0) <> 1
    THROW 51112, 'Expected one AppEntity data object under BaseEntity.', 1;
SELECT @appEntityObjectId = Id FROM dbo.SydObjects
WHERE Code = N'APPENTITY-DATA' AND Name = N'AppEntity' AND ObjectTypeCode = N'DATA'
  AND ParentId = @baseEntityObjectId AND IsDeleted = 0;

IF (SELECT COUNT(*) FROM dbo.SysObjectTypes
    WHERE Code = N'ENTITY' AND IsDeleted = 0) <> 1
    THROW 51122, 'Expected an active ENTITY object type.', 1;
DECLARE @entityTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes
    WHERE Code = N'ENTITY' AND IsDeleted = 0);
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'FIELD' OR Name = N'Field')
      AND NOT (Code = N'FIELD' AND Name = N'Field'
          AND ObjectTypeId = @entityTypeId AND ObjectTypeCode = N'ENTITY'
          AND ParentId IS NULL AND NULLIF(LTRIM(RTRIM(ParentCode)), N'') IS NULL AND IsDeleted = 0))
    THROW 51113, 'A conflicting Field object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Field', N'FIELD', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0) <> 1
    THROW 51113, 'Expected one Field object.', 1;
SELECT @fieldObjectId = Id FROM dbo.SydObjects WHERE Code = N'FIELD' AND IsDeleted = 0;
IF EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE Code = N'FIELD' AND (ObjectId <> @fieldObjectId OR ParentId IS NOT NULL OR IsDeleted <> 0))
    THROW 51114, 'A conflicting Field type root exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes
    WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL AND IsDeleted = 0)
    INSERT dbo.SycEntityObjectTypes
        (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, TenantId, IsDefault)
    VALUES (SYSUTCDATETIME(), 0, N'FIELD', N'Field', @fieldObjectId, N'FIELD', NULL, 0);
IF (SELECT COUNT(*) FROM dbo.SycEntityObjectTypes
    WHERE ObjectId = @fieldObjectId AND Code = N'FIELD' AND ParentId IS NULL AND IsDeleted = 0) <> 1
    THROW 51114, 'Expected one Field type root.', 1;
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
    THROW 51116, 'A conflicting Field data type exists.', 1;
INSERT dbo.SycEntityObjectTypes
    (CreationTime, IsDeleted, Code, Name, ObjectId, ObjectCode, ParentId, ParentCode, TenantId, IsDefault)
SELECT SYSUTCDATETIME(), 0, s.Code, s.Name, @fieldObjectId, N'FIELD',
       @fieldRootId, N'FIELD', NULL, 0
FROM @requiredTypes s
WHERE NOT EXISTS (SELECT 1 FROM dbo.SycEntityObjectTypes t
    WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
      AND t.Code = s.Code AND t.IsDeleted = 0);

CREATE TABLE #SeedAppEntityFields
(
    Ordinal int NOT NULL PRIMARY KEY,
    FieldName nvarchar(250) COLLATE DATABASE_DEFAULT NOT NULL UNIQUE,
    TypeCode nvarchar(50) COLLATE DATABASE_DEFAULT NOT NULL,
    Visible bit NOT NULL,
    Editable bit NOT NULL
);
INSERT #SeedAppEntityFields (Ordinal, FieldName, TypeCode, Visible, Editable) VALUES
    (1,  N'Id',                     N'IN',      0, 0),
    (2,  N'CreationTime',           N'DP',      0, 0),
    (3,  N'CreatorUserId',          N'IN',      0, 0),
    (4,  N'LastModificationTime',   N'DP',      0, 0),
    (5,  N'LastModifierUserId',     N'IN',      0, 0),
    (6,  N'IsDeleted',              N'BOOLEAN', 0, 0),
    (7,  N'DeleterUserId',          N'IN',      0, 0),
    (8,  N'DeletionTime',           N'DP',      0, 0),
    (9,  N'TenantId',               N'IN',      0, 0),
    (10, N'Name',                   N'ST',      1, 1),
    (11, N'Code',                   N'ST',      1, 1),
    (12, N'Notes',                  N'ST',      1, 1),
    (13, N'EntityObjectStatusCode', N'ST',      1, 1),
    (14, N'EntityObjectStatusId',   N'LD',      0, 0),
    (15, N'EntityObjectTypeCode',   N'ST',      1, 0),
    (16, N'EntityObjectTypeId',     N'LD',      0, 0),
    (17, N'ObjectCode',             N'ST',      1, 0),
    (18, N'ObjectId',               N'LD',      0, 0),
    (19, N'SSIN',                   N'ST',      1, 0),
    (20, N'TenantOwner',            N'IN',      0, 0),
    (21, N'TimeStamp',              N'DP',      0, 0),
    (22, N'IsDefault',              N'BOOLEAN', 1, 1);

IF (SELECT COUNT(*) FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.AppEntities')) <> 22
    OR EXISTS (SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.AppEntities')
               EXCEPT SELECT FieldName FROM #SeedAppEntityFields)
    OR EXISTS (SELECT FieldName FROM #SeedAppEntityFields
               EXCEPT SELECT name FROM sys.columns WHERE object_id = OBJECT_ID(N'dbo.AppEntities'))
    THROW 51115, 'AppEntities columns differ from the 22 reviewed field definitions.', 1;

IF EXISTS (SELECT 1 FROM #SeedAppEntityFields s
    OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.SycEntityObjectTypes t
        WHERE t.ObjectId = @fieldObjectId AND t.ParentId = @fieldRootId
          AND t.Code = s.TypeCode AND t.IsDeleted = 0) matches
    WHERE matches.Cnt <> 1)
    THROW 51116, 'A field data type is missing or duplicated.', 1;

IF EXISTS (SELECT 1 FROM #SeedAppEntityFields s
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
    JOIN dbo.AppFields f ON f.SycObjectId = @appEntityObjectId
        AND f.TenantId IS NULL AND f.FieldName = s.FieldName AND f.IsDeleted = 0
    WHERE f.EntitySycObjectId <> @baseEntityObjectId OR f.FieldTypeId <> t.Id
       OR f.IsStandard <> 1 OR f.IsCustom <> 0)
    THROW 51117, 'An existing AppEntity field definition conflicts with the seed.', 1;

;WITH Missing AS
(
    SELECT s.Ordinal, s.FieldName, s.TypeCode, s.Visible, s.Editable,
           t.Id AS FieldTypeId,
           ROW_NUMBER() OVER (PARTITION BY t.Id ORDER BY s.Ordinal) AS NewOrdinal
    FROM #SeedAppEntityFields s
    JOIN dbo.SycEntityObjectTypes t ON t.ObjectId = @fieldObjectId
        AND t.ParentId = @fieldRootId AND t.Code = s.TypeCode AND t.IsDeleted = 0
    WHERE NOT EXISTS (SELECT 1 FROM dbo.AppFields f
        WHERE f.SycObjectId = @appEntityObjectId AND f.TenantId IS NULL
          AND f.FieldName = s.FieldName AND f.IsDeleted = 0)
)
SELECT m.*,
       COALESCE((SELECT MAX(TRY_CONVERT(int, RIGHT(f.FieldCode, 4)))
           FROM dbo.AppFields f WHERE f.FieldTypeId = m.FieldTypeId
             AND LEN(f.FieldCode) = 11 AND SUBSTRING(f.FieldCode, 3, 1) IN (N'S', N'A', N'T')), 0)
           + m.NewOrdinal AS NextSequence
INTO #MissingAppEntityFields
FROM Missing m;

IF EXISTS (SELECT 1 FROM #MissingAppEntityFields WHERE NextSequence > 9999)
    THROW 51118, 'A field type has exhausted its four-digit code sequence.', 1;

INSERT dbo.AppFields
    (TenantId, SourceFieldId, SycObjectId, EntitySycObjectId, FieldCode, FieldName,
     Description, FieldTypeId, WidgetTypeId, FieldLevelId, FieldStatusId,
     FieldLevelCode, FieldStatusCode, TrackingNo, CurrentRevisionNo,
     IsStandard, IsCustom, IsExtraField, IsHidden, AllowNull, [Length], Decimals,
     DefaultValue, DateFormat, TimeFormat, AllowMultiSelect, Required, Visible,
     Editable, ExtraAttributes, CreationTime, CreatorUserId, LastModificationTime,
     LastModifierUserId, IsDeleted, DeleterUserId, DeletionTime)
SELECT NULL, NULL, @appEntityObjectId, @baseEntityObjectId,
       LEFT(m.TypeCode, 2) + N'S' + LEFT(UPPER(m.FieldName) + N'____', 4)
           + RIGHT(N'0000' + CONVERT(nvarchar(10), m.NextSequence), 4),
       m.FieldName, N'AppEntities.' + m.FieldName, m.FieldTypeId,
       NULL, NULL, NULL, N'System', N'Proposed', NULL, N'00',
       1, 0, 0, 0, c.is_nullable,
       CASE WHEN ty.name IN (N'nvarchar', N'nchar') AND c.max_length > 0
            THEN c.max_length / 2
            WHEN ty.name IN (N'varchar', N'char') AND c.max_length > 0
            THEN c.max_length ELSE NULL END,
       CASE WHEN m.TypeCode = N'IN' THEN 0 ELSE NULL END,
       NULL, CASE WHEN m.TypeCode = N'DP' THEN N'yyyy-MM-dd' ELSE NULL END,
       NULL, 0, CASE WHEN c.is_nullable = 0 THEN 1 ELSE 0 END,
       m.Visible, m.Editable, NULL, SYSUTCDATETIME(), NULL, NULL, NULL, 0, NULL, NULL
FROM #MissingAppEntityFields m
JOIN sys.columns c ON c.object_id = OBJECT_ID(N'dbo.AppEntities') AND c.name = m.FieldName
JOIN sys.types ty ON ty.user_type_id = c.user_type_id;

IF EXISTS (SELECT 1 FROM #SeedAppEntityFields s
    OUTER APPLY (SELECT COUNT(*) AS Cnt FROM dbo.AppFields f
        WHERE f.SycObjectId = @appEntityObjectId AND f.TenantId IS NULL
          AND f.FieldName = s.FieldName AND f.IsDeleted = 0) matches
    WHERE matches.Cnt <> 1)
    THROW 51119, 'Expected one active AppEntity field definition per column.', 1;

INSERT dbo.AppTableFields
    (TenantId, FieldDefinitionKey, FieldCode, AppliedRevisionNo, SnapshotJson,
     SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
SELECT NULL, f.FieldDefinitionKey, f.FieldCode, f.CurrentRevisionNo,
       (SELECT snapshot.* FROM dbo.AppFields snapshot WHERE snapshot.Id = f.Id
        FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
       @appEntityObjectId, NULL, SYSUTCDATETIME(), NULL
FROM #SeedAppEntityFields s
JOIN dbo.AppFields f ON f.SycObjectId = @appEntityObjectId AND f.TenantId IS NULL
    AND f.FieldName = s.FieldName AND f.IsDeleted = 0
WHERE NOT EXISTS (SELECT 1 FROM dbo.AppTableFields a
    WHERE a.TenantId IS NULL AND a.FieldDefinitionKey = f.FieldDefinitionKey
      AND a.SycObjectId = @appEntityObjectId AND a.SycEntityObjectTypeId IS NULL);

DECLARE @historyColumns nvarchar(max);
DECLARE @historyValues nvarchar(max);
DECLARE @historySql nvarchar(max);
SELECT @historyColumns = STRING_AGG(QUOTENAME(c.name), N',') WITHIN GROUP (ORDER BY c.column_id),
       @historyValues = STRING_AGG(N'f.' + QUOTENAME(c.name), N',') WITHIN GROUP (ORDER BY c.column_id)
FROM sys.columns c
JOIN sys.columns h ON h.object_id = OBJECT_ID(N'dbo.AppFieldsHistory') AND h.name = c.name
WHERE c.object_id = OBJECT_ID(N'dbo.AppFields') AND c.name <> N'Id';

SET @historySql = N'INSERT dbo.AppFieldsHistory
    (AppFieldId, RevisionNo, ChangeType, ChangedAt, ' + @historyColumns + N')
SELECT f.Id, f.CurrentRevisionNo, N''Create'', SYSUTCDATETIME(), ' + @historyValues + N'
FROM dbo.AppFields f
JOIN #SeedAppEntityFields s ON s.FieldName = f.FieldName
WHERE f.SycObjectId = @objectId AND f.TenantId IS NULL AND f.IsDeleted = 0
  AND NOT EXISTS (SELECT 1 FROM dbo.AppFieldsHistory h
      WHERE h.AppFieldId = f.Id AND h.RevisionNo = f.CurrentRevisionNo);';
EXEC sys.sp_executesql @historySql, N'@objectId bigint', @objectId = @appEntityObjectId;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Field definitions may already be used by other tables; do not delete them on rollback.
        }
    }
}

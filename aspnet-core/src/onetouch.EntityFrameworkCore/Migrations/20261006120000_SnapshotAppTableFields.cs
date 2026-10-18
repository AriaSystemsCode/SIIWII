using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261006120000_SnapshotAppTableFields")]
    public class SnapshotAppTableFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE dbo.APPFields ADD FieldDefinitionKey uniqueidentifier NULL;");
            migrationBuilder.Sql(@"
UPDATE dbo.APPFields SET FieldDefinitionKey = NEWID() WHERE FieldDefinitionKey IS NULL;
ALTER TABLE dbo.APPFields ALTER COLUMN FieldDefinitionKey uniqueidentifier NOT NULL;
ALTER TABLE dbo.APPFields ADD CONSTRAINT DF_APPFields_FieldDefinitionKey DEFAULT NEWID() FOR FieldDefinitionKey;
CREATE UNIQUE INDEX IX_APPFields_FieldDefinitionKey ON dbo.APPFields(FieldDefinitionKey);");
            migrationBuilder.Sql(@"
ALTER TABLE dbo.AppTableFields ADD
    FieldDefinitionKey uniqueidentifier NULL,
    FieldCode nvarchar(11) NULL,
    AppliedRevisionNo nvarchar(10) NULL,
    SnapshotJson nvarchar(max) NULL;");
            migrationBuilder.Sql(@"
UPDATE assignment
SET FieldDefinitionKey = field.FieldDefinitionKey,
    FieldCode = field.FieldCode,
    AppliedRevisionNo = field.CurrentRevisionNo,
    SnapshotJson = (SELECT snapshot.* FROM dbo.APPFields AS snapshot
                    WHERE snapshot.Id = field.Id FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
FROM dbo.AppTableFields AS assignment
JOIN dbo.APPFields AS field ON field.Id = assignment.AppFieldId;

IF EXISTS (SELECT 1 FROM dbo.AppTableFields WHERE FieldDefinitionKey IS NULL OR
    FieldCode IS NULL OR AppliedRevisionNo IS NULL OR SnapshotJson IS NULL)
    THROW 51070, 'An existing table field has no definition to snapshot.', 1;

ALTER TABLE dbo.AppTableFields ALTER COLUMN FieldDefinitionKey uniqueidentifier NOT NULL;
ALTER TABLE dbo.AppTableFields ALTER COLUMN FieldCode nvarchar(11) NOT NULL;
ALTER TABLE dbo.AppTableFields ALTER COLUMN AppliedRevisionNo nvarchar(10) NOT NULL;
ALTER TABLE dbo.AppTableFields ALTER COLUMN SnapshotJson nvarchar(max) NOT NULL;

DROP INDEX IX_AppTableFields_TenantId_AppFieldId_SycObjectId_SycEntityObjectTypeId ON dbo.AppTableFields;
DROP INDEX IX_AppTableFields_AppFieldId ON dbo.AppTableFields;
ALTER TABLE dbo.AppTableFields DROP CONSTRAINT FK_AppTableFields_APPFields_AppFieldId;
ALTER TABLE dbo.AppTableFields DROP COLUMN AppFieldId;
CREATE INDEX IX_AppTableFields_FieldDefinitionKey ON dbo.AppTableFields(FieldDefinitionKey);
CREATE UNIQUE INDEX IX_AppTableFields_TenantId_FieldDefinitionKey_SycObjectId_SycEntityObjectTypeId
    ON dbo.AppTableFields(TenantId, FieldDefinitionKey, SycObjectId, SycEntityObjectTypeId);");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE dbo.AppTableFields ADD AppFieldId bigint NULL;");
            migrationBuilder.Sql(@"
UPDATE assignment SET AppFieldId = field.Id
FROM dbo.AppTableFields AS assignment
JOIN dbo.APPFields AS field ON field.FieldDefinitionKey = assignment.FieldDefinitionKey;
IF EXISTS (SELECT 1 FROM dbo.AppTableFields WHERE AppFieldId IS NULL)
    THROW 51071, 'Cannot restore AppFieldId for a missing definition.', 1;
ALTER TABLE dbo.AppTableFields ALTER COLUMN AppFieldId bigint NOT NULL;
DROP INDEX IX_AppTableFields_TenantId_FieldDefinitionKey_SycObjectId_SycEntityObjectTypeId ON dbo.AppTableFields;
DROP INDEX IX_AppTableFields_FieldDefinitionKey ON dbo.AppTableFields;
ALTER TABLE dbo.AppTableFields ADD CONSTRAINT FK_AppTableFields_APPFields_AppFieldId
    FOREIGN KEY (AppFieldId) REFERENCES dbo.APPFields(Id);
CREATE INDEX IX_AppTableFields_AppFieldId ON dbo.AppTableFields(AppFieldId);
CREATE UNIQUE INDEX IX_AppTableFields_TenantId_AppFieldId_SycObjectId_SycEntityObjectTypeId
    ON dbo.AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId);
ALTER TABLE dbo.AppTableFields DROP COLUMN FieldDefinitionKey, FieldCode, AppliedRevisionNo, SnapshotJson;
DROP INDEX IX_APPFields_FieldDefinitionKey ON dbo.APPFields;
ALTER TABLE dbo.APPFields DROP CONSTRAINT DF_APPFields_FieldDefinitionKey;
ALTER TABLE dbo.APPFields DROP COLUMN FieldDefinitionKey;");
        }
    }
}

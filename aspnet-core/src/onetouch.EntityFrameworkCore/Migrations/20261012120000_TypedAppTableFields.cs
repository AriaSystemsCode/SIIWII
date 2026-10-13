using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261012120000_TypedAppTableFields")]
    public class TypedAppTableFields : Migration
    {
        private static readonly (string Name, string JsonName, string Type, bool Required)[] Columns =
        {
            ("SourceAppFieldId", "Id", "bigint", true),
            ("FieldTenantId", "TenantId", "int", false),
            ("SourceFieldId", "SourceFieldId", "bigint", false),
            ("DefinitionSycObjectId", "SycObjectId", "bigint", true),
            ("EntitySycObjectId", "EntitySycObjectId", "bigint", false),
            ("FieldName", "FieldName", "nvarchar(250)", true),
            ("Description", "Description", "nvarchar(2000)", false),
            ("FieldTypeId", "FieldTypeId", "bigint", true),
            ("WidgetTypeId", "WidgetTypeId", "bigint", false),
            ("FieldLevelId", "FieldLevelId", "bigint", false),
            ("FieldStatusId", "FieldStatusId", "bigint", false),
            ("FieldLevelCode", "FieldLevelCode", "nvarchar(32)", true),
            ("FieldStatusCode", "FieldStatusCode", "nvarchar(32)", true),
            ("TrackingNo", "TrackingNo", "nvarchar(100)", false),
            ("IsStandard", "IsStandard", "bit", true),
            ("IsCustom", "IsCustom", "bit", true),
            ("IsExtraField", "IsExtraField", "bit", true),
            ("IsHidden", "IsHidden", "bit", true),
            ("AllowNull", "AllowNull", "bit", true),
            ("Length", "Length", "int", false),
            ("Decimals", "Decimals", "int", false),
            ("DefaultValue", "DefaultValue", "nvarchar(2000)", false),
            ("DateFormat", "DateFormat", "nvarchar(100)", false),
            ("TimeFormat", "TimeFormat", "nvarchar(100)", false),
            ("AllowMultiSelect", "AllowMultiSelect", "bit", true),
            ("Required", "Required", "bit", true),
            ("Visible", "Visible", "bit", true),
            ("Editable", "Editable", "bit", true),
            ("ExtraAttributes", "ExtraAttributes", "nvarchar(max)", false),
            ("FieldCreationTime", "CreationTime", "datetime2", true),
            ("FieldCreatorUserId", "CreatorUserId", "bigint", false),
            ("FieldLastModificationTime", "LastModificationTime", "datetime2", false),
            ("FieldLastModifierUserId", "LastModifierUserId", "bigint", false),
            ("FieldIsDeleted", "IsDeleted", "bit", true),
            ("FieldDeleterUserId", "DeleterUserId", "bigint", false),
            ("FieldDeletionTime", "DeletionTime", "datetime2", false)
        };

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM dbo.AppTableFields WHERE ISJSON(SnapshotJson) <> 1)
    THROW 51080, 'An applied table field snapshot is not valid JSON.', 1;");

            foreach (var column in Columns)
                migrationBuilder.Sql($"ALTER TABLE dbo.AppTableFields ADD [{column.Name}] {column.Type} NULL;");

            var schema = string.Join(",\n    ", Columns.Select(c =>
                $"[{c.Name}] {c.Type} '$.{c.JsonName}'"));
            var assignments = string.Join(",\n    ", Columns.Select(c =>
                $"a.[{c.Name}] = j.[{c.Name}]"));
            migrationBuilder.Sql($@"
UPDATE a SET
    {assignments}
FROM dbo.AppTableFields a
CROSS APPLY OPENJSON(a.SnapshotJson) WITH (
    {schema}
) j;");

            var missing = string.Join(" OR ", Columns.Where(c => c.Required)
                .Select(c => $"[{c.Name}] IS NULL"));
            migrationBuilder.Sql($@"
IF EXISTS (SELECT 1 FROM dbo.AppTableFields WHERE {missing})
    THROW 51081, 'An applied table field could not be converted to typed columns.', 1;");
            foreach (var column in Columns.Where(c => c.Required))
                migrationBuilder.Sql($"ALTER TABLE dbo.AppTableFields ALTER COLUMN [{column.Name}] {column.Type} NOT NULL;");
            migrationBuilder.DropColumn(name: "SnapshotJson", table: "AppTableFields");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "SnapshotJson", table: "AppTableFields",
                type: "nvarchar(max)", nullable: true);
            var properties = string.Join(",\n        ", Columns.Select(c =>
                $"a.[{c.Name}] AS [{c.JsonName}]"));
            migrationBuilder.Sql($@"
UPDATE a SET SnapshotJson =
    (SELECT a.FieldDefinitionKey, a.FieldCode, a.AppliedRevisionNo AS CurrentRevisionNo,
        {properties}
     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
FROM dbo.AppTableFields a;
ALTER TABLE dbo.AppTableFields ALTER COLUMN SnapshotJson nvarchar(max) NOT NULL;");
            foreach (var column in Columns)
                migrationBuilder.DropColumn(name: column.Name, table: "AppTableFields");
        }
    }
}

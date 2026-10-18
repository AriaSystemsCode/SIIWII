using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261011130000_TypedAppFieldsHistory")]
    public class TypedAppFieldsHistory : Migration
    {
        // Id is the history row identity; AppFieldId holds the original AppFields.Id.
        // TenantId already exists on AppFieldsHistory.
        private static readonly (string Name, string Type, bool Required)[] Columns =
        {
            ("FieldDefinitionKey", "uniqueidentifier", true),
            ("SourceFieldId", "bigint", false),
            ("SycObjectId", "bigint", true),
            ("EntitySycObjectId", "bigint", false),
            ("FieldCode", "nvarchar(11)", true),
            ("FieldName", "nvarchar(250)", true),
            ("Description", "nvarchar(2000)", false),
            ("FieldTypeId", "bigint", true),
            ("WidgetTypeId", "bigint", false),
            ("FieldLevelId", "bigint", false),
            ("FieldStatusId", "bigint", false),
            ("FieldLevelCode", "nvarchar(32)", true),
            ("FieldStatusCode", "nvarchar(32)", true),
            ("TrackingNo", "nvarchar(100)", false),
            ("CurrentRevisionNo", "nvarchar(10)", true),
            ("IsStandard", "bit", true),
            ("IsCustom", "bit", true),
            ("IsExtraField", "bit", true),
            ("IsHidden", "bit", true),
            ("AllowNull", "bit", true),
            ("Length", "int", false),
            ("Decimals", "int", false),
            ("DefaultValue", "nvarchar(2000)", false),
            ("DateFormat", "nvarchar(100)", false),
            ("TimeFormat", "nvarchar(100)", false),
            ("AllowMultiSelect", "bit", true),
            ("Required", "bit", true),
            ("Visible", "bit", true),
            ("Editable", "bit", true),
            ("ExtraAttributes", "nvarchar(max)", false),
            ("CreationTime", "datetime2", true),
            ("CreatorUserId", "bigint", false),
            ("LastModificationTime", "datetime2", false),
            ("LastModifierUserId", "bigint", false),
            ("IsDeleted", "bit", true),
            ("DeleterUserId", "bigint", false),
            ("DeletionTime", "datetime2", false)
        };

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1 FROM dbo.AppFieldsHistory h
    JOIN dbo.AppFields f ON f.Id = h.AppFieldId
    WHERE h.RevisionNo <> f.CurrentRevisionNo
      AND (JSON_VALUE(h.SnapshotJson, '$.CreationTime') IS NULL
           OR JSON_VALUE(h.SnapshotJson, '$.IsStandard') IS NULL))
    THROW 51075, 'An older sparse history revision cannot be reconstructed from the current field.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppFieldsHistory WHERE ISJSON(SnapshotJson) <> 1)
    THROW 51076, 'A field history snapshot is not valid JSON.', 1;");

            foreach (var column in Columns)
                migrationBuilder.Sql($"ALTER TABLE dbo.AppFieldsHistory ADD [{column.Name}] {column.Type} NULL;");

            var jsonSchema = string.Join(",\n    ", Columns.Select(c =>
                $"[{c.Name}] {c.Type} '$.{c.Name}'"));
            var assignments = string.Join(",\n    ", Columns.Select(c =>
                $"h.[{c.Name}] = " + (c.Name == "CurrentRevisionNo"
                    ? "COALESCE(j.[CurrentRevisionNo], h.RevisionNo)"
                    : $"CASE WHEN EXISTS (SELECT 1 FROM OPENJSON(h.SnapshotJson) p WHERE p.[key] = N'{c.Name}') THEN j.[{c.Name}] ELSE f.[{c.Name}] END")));
            migrationBuilder.Sql($@"
UPDATE h SET
    {assignments}
FROM dbo.AppFieldsHistory h
JOIN dbo.AppFields f ON f.Id = h.AppFieldId
CROSS APPLY OPENJSON(h.SnapshotJson) WITH (
    {jsonSchema}
) j;");

            var missing = string.Join(" OR ", Columns.Where(c => c.Required)
                .Select(c => $"[{c.Name}] IS NULL"));
            migrationBuilder.Sql($@"
IF EXISTS (SELECT 1 FROM dbo.AppFieldsHistory WHERE {missing})
    THROW 51077, 'A field history revision could not be converted to typed columns.', 1;");
            foreach (var column in Columns.Where(c => c.Required))
                migrationBuilder.Sql($"ALTER TABLE dbo.AppFieldsHistory ALTER COLUMN [{column.Name}] {column.Type} NOT NULL;");
            migrationBuilder.DropColumn(name: "SnapshotJson", table: "AppFieldsHistory");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(name: "SnapshotJson", table: "AppFieldsHistory",
                type: "nvarchar(max)", nullable: true);
            var properties = string.Join(", ", Columns.Select(c => $"h.[{c.Name}]"));
            migrationBuilder.Sql($@"
UPDATE h SET SnapshotJson =
    (SELECT h.AppFieldId AS Id, h.TenantId, {properties}
     FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
FROM dbo.AppFieldsHistory h;
ALTER TABLE dbo.AppFieldsHistory ALTER COLUMN SnapshotJson nvarchar(max) NOT NULL;");
            foreach (var column in Columns)
                migrationBuilder.DropColumn(name: column.Name, table: "AppFieldsHistory");
        }
    }
}

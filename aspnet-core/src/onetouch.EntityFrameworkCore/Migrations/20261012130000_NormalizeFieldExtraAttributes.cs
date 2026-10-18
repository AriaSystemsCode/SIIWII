using System;
using System.Linq;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261012130000_NormalizeFieldExtraAttributes")]
    public class NormalizeFieldExtraAttributes : Migration
    {
        private static readonly (string Name, string Type)[] Columns =
        {
            ("SourceAttributeId", "bigint"),
            ("SourceDataType", "nvarchar(100)"),
            ("SourceEntityObjectTypeId", "bigint"),
            ("EntityObjectTypeCode", "nvarchar(100)"),
            ("Usage", "nvarchar(500)"),
            ("IsLookup", "bit"),
            ("IsVariation", "bit"),
            ("IsAdvancedSearch", "bit"),
            ("AcceptMultipleValues", "bit"),
            ("AllowAddNew", "bit")
        };

        private static readonly (string Parent, string Options, string ForeignKey)[] Tables =
        {
            ("AppFields", "AppFieldDropdownOptions", "AppFieldId"),
            ("AppFieldsHistory", "AppFieldHistoryDropdownOptions", "AppFieldHistoryId"),
            ("AppTableFields", "AppTableFieldDropdownOptions", "AppTableFieldId")
        };

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var table in Tables)
            {
                migrationBuilder.Sql($@"
IF EXISTS (SELECT 1 FROM dbo.[{table.Parent}]
    WHERE ExtraAttributes IS NOT NULL AND LTRIM(RTRIM(ExtraAttributes)) <> ''
      AND ISJSON(ExtraAttributes) <> 1)
    THROW 51090, '{table.Parent} has invalid Field Manager JSON.', 1;
IF EXISTS (SELECT 1 FROM dbo.[{table.Parent}] a
    CROSS APPLY OPENJSON(CASE WHEN ISJSON(a.ExtraAttributes) = 1 THEN a.ExtraAttributes ELSE '{{}}' END) j
    WHERE j.[key] NOT IN ('sourceAttributeId','sourceDataType','sourceEntityObjectTypeId',
        'entityObjectTypeCode','usage','isLookup','isVariation','isAdvancedSearch',
        'acceptMultipleValues','allowAddNew','dropdownOptions'))
    THROW 51091, '{table.Parent} contains an unsupported Field Manager setting.', 1;
IF EXISTS (SELECT 1 FROM dbo.[{table.Parent}] a
    CROSS APPLY OPENJSON(CASE WHEN ISJSON(a.ExtraAttributes) = 1 THEN a.ExtraAttributes ELSE '{{}}' END) j
    WHERE (j.[key] IN ('sourceAttributeId','sourceEntityObjectTypeId') AND j.[type] NOT IN (0,2))
       OR (j.[key] IN ('sourceAttributeId','sourceEntityObjectTypeId') AND j.[type] = 2
           AND TRY_CONVERT(bigint, j.value) IS NULL)
       OR (j.[key] IN ('isLookup','isVariation','isAdvancedSearch','acceptMultipleValues','allowAddNew')
           AND j.[type] NOT IN (0,3))
       OR (j.[key] = 'dropdownOptions' AND j.[type] NOT IN (0,4))
       OR (j.[key] IN ('sourceDataType','entityObjectTypeCode')
           AND (j.[type] NOT IN (0,1) OR LEN(j.value) > 100))
       OR (j.[key] = 'usage' AND (j.[type] NOT IN (0,1) OR LEN(j.value) > 500)))
    THROW 51093, '{table.Parent} has Field Manager settings that cannot fit typed columns.', 1;");
                foreach (var column in Columns)
                    migrationBuilder.Sql($"ALTER TABLE dbo.[{table.Parent}] ADD [{column.Name}] {column.Type} NULL;");

                var assignments = string.Join(",\n    ", Columns.Select(column =>
                    $"[{column.Name}] = TRY_CONVERT({column.Type}, JSON_VALUE(ExtraAttributes, '$.{char.ToLowerInvariant(column.Name[0]) + column.Name.Substring(1)}'))"));
                migrationBuilder.Sql($@"
UPDATE dbo.[{table.Parent}] SET
    {assignments}
WHERE ISJSON(ExtraAttributes) = 1;");

                migrationBuilder.CreateTable(
                    name: table.Options,
                    columns: t => new
                    {
                        Id = t.Column<long>(type: "bigint", nullable: false)
                            .Annotation("SqlServer:Identity", "1, 1"),
                        ParentId = t.Column<long>(name: table.ForeignKey, type: "bigint", nullable: false),
                        SortOrder = t.Column<int>(type: "int", nullable: false),
                        Option = t.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                        Value = t.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                    },
                    constraints: t =>
                    {
                        t.PrimaryKey("PK_" + table.Options, x => x.Id);
                        t.ForeignKey("FK_" + table.Options + "_" + table.Parent + "_" + table.ForeignKey,
                            x => x.ParentId, table.Parent, "Id", onDelete: ReferentialAction.Cascade);
                    });
                migrationBuilder.CreateIndex(
                    name: "IX_" + table.Options + "_" + table.ForeignKey + "_SortOrder",
                    table: table.Options,
                    columns: new[] { table.ForeignKey, "SortOrder" }, unique: true);
                migrationBuilder.Sql($@"
IF EXISTS (SELECT 1 FROM dbo.[{table.Parent}] a
    CROSS APPLY OPENJSON(CASE WHEN ISJSON(a.ExtraAttributes) = 1 THEN a.ExtraAttributes ELSE '{{}}' END, '$.dropdownOptions') o
    WHERE ISJSON(o.value) <> 1 OR JSON_VALUE(o.value, '$.option') IS NULL
      OR JSON_VALUE(o.value, '$.value') IS NULL
      OR LEN(JSON_VALUE(o.value, '$.option')) > 500 OR LEN(JSON_VALUE(o.value, '$.value')) > 500)
    THROW 51092, '{table.Parent} contains invalid dropdown options.', 1;
INSERT INTO dbo.[{table.Options}] ([{table.ForeignKey}], SortOrder, [Option], [Value])
SELECT a.Id, TRY_CONVERT(int, o.[key]), JSON_VALUE(o.value, '$.option'), JSON_VALUE(o.value, '$.value')
FROM dbo.[{table.Parent}] a
CROSS APPLY OPENJSON(CASE WHEN ISJSON(a.ExtraAttributes) = 1 THEN a.ExtraAttributes ELSE '{{}}' END, '$.dropdownOptions') o;");
                migrationBuilder.DropColumn(name: "ExtraAttributes", table: table.Parent);
            }
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            foreach (var table in Tables.Reverse())
            {
                migrationBuilder.AddColumn<string>(name: "ExtraAttributes", table: table.Parent,
                    type: "nvarchar(max)", nullable: true);
                var properties = string.Join(",\n        ", Columns.Select(column =>
                    $"a.[{column.Name}] AS [{char.ToLowerInvariant(column.Name[0]) + column.Name.Substring(1)}]"));
                migrationBuilder.Sql($@"
UPDATE a SET ExtraAttributes = (
    SELECT {properties},
        JSON_QUERY((SELECT o.[Option] AS [option], o.[Value] AS [value]
                    FROM dbo.[{table.Options}] o WHERE o.[{table.ForeignKey}] = a.Id
                    ORDER BY o.SortOrder FOR JSON PATH)) AS dropdownOptions
    FOR JSON PATH, WITHOUT_ARRAY_WRAPPER)
FROM dbo.[{table.Parent}] a;");
                migrationBuilder.DropTable(name: table.Options);
                foreach (var column in Columns)
                    migrationBuilder.DropColumn(name: column.Name, table: table.Parent);
            }
        }
    }
}

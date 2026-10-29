using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016170000_UseFieldSettingOptionsOnly")]
    public class UseFieldSettingOptionsOnly : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
UPDATE f SET AllowMultiSelect = 1
FROM dbo.AppFields AS f
JOIN dbo.SydObjects AS o ON o.Id = f.SycObjectId AND o.Code = N'FIELD'
WHERE f.FieldName = N'DropdownOptions' AND f.IsDeleted = 0;");

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM dbo.AppFieldDropdownOptions)
   OR EXISTS (SELECT 1 FROM dbo.AppFieldHistoryDropdownOptions)
   OR EXISTS (SELECT 1 FROM dbo.AppTableFieldDropdownOptions)
    THROW 51120, 'Legacy dropdown options must be moved to AppFieldsOptions and setting values before this migration.', 1;");

            migrationBuilder.DropTable(name: "AppFieldDropdownOptions");
            migrationBuilder.DropTable(name: "AppFieldHistoryDropdownOptions");
            migrationBuilder.DropTable(name: "AppTableFieldDropdownOptions");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            CreateDropdownTable(migrationBuilder, "AppFieldDropdownOptions", "AppFields", "AppFieldId");
            CreateDropdownTable(migrationBuilder, "AppFieldHistoryDropdownOptions", "AppFieldsHistory", "AppFieldHistoryId");
            CreateDropdownTable(migrationBuilder, "AppTableFieldDropdownOptions", "AppTableFields", "AppTableFieldId");
        }

        private static void CreateDropdownTable(MigrationBuilder migrationBuilder, string name,
            string parent, string foreignKey)
        {
            migrationBuilder.Sql($@"
CREATE TABLE dbo.[{name}] (
    [Id] bigint IDENTITY(1,1) NOT NULL CONSTRAINT [PK_{name}] PRIMARY KEY,
    [{foreignKey}] bigint NOT NULL,
    [SortOrder] int NOT NULL,
    [Option] nvarchar(500) NOT NULL,
    [Value] nvarchar(500) NOT NULL,
    CONSTRAINT [FK_{name}_{parent}_{foreignKey}]
        FOREIGN KEY ([{foreignKey}]) REFERENCES dbo.[{parent}]([Id]) ON DELETE CASCADE);
CREATE UNIQUE INDEX [IX_{name}_{foreignKey}_SortOrder]
    ON dbo.[{name}]([{foreignKey}], [SortOrder]);");
        }
    }
}

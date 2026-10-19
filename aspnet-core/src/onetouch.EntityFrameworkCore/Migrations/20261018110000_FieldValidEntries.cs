using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261018110000_FieldValidEntries")]
    public class FieldValidEntries : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var table in new[] { "AppFields", "AppFieldsHistory", "AppTableFields" })
                migrationBuilder.AddColumn<string>("ValidEntries", table, type: "nvarchar(max)", nullable: true);

            migrationBuilder.Sql(@"
IF EXISTS (SELECT 1 FROM dbo.AppFieldsOptions WHERE Code IS NULL OR LTRIM(RTRIM(Code)) = N'' OR CHARINDEX(N'|', Code) > 0)
    THROW 51136, 'An existing option code cannot be represented in ValidEntries.', 1;

ALTER TABLE dbo.AppFieldSettingValues DROP CONSTRAINT CK_AppFieldSettingValues_OneValue;

UPDATE f SET ValidEntries = STUFF((
    SELECT N'|' + o.Code
    FROM dbo.AppFieldsOptions AS o
    WHERE o.SettingFieldId = f.Id AND o.IsActive = 1
    ORDER BY o.SortOrder, o.Id
    FOR XML PATH(''), TYPE).value('.', 'nvarchar(max)'), 1, 1, N'')
FROM dbo.AppFields AS f
WHERE EXISTS (SELECT 1 FROM dbo.AppFieldsOptions AS o WHERE o.SettingFieldId = f.Id AND o.IsActive = 1);

UPDATE h SET ValidEntries = f.ValidEntries
FROM dbo.AppFieldsHistory AS h JOIN dbo.AppFields AS f ON f.Id = h.AppFieldId
WHERE f.ValidEntries IS NOT NULL;

UPDATE t SET ValidEntries = f.ValidEntries
FROM dbo.AppTableFields AS t JOIN dbo.AppFields AS f ON f.Id = t.SourceAppFieldId
WHERE f.ValidEntries IS NOT NULL;

UPDATE v SET [Value] = COALESCE(v.[Value], NULLIF(v.OptionCode, N''), o.Code)
FROM dbo.AppFieldSettingValues AS v
LEFT JOIN dbo.AppFieldsOptions AS o ON o.Id = v.AppFieldsOptionId
WHERE v.AppFieldsOptionId IS NOT NULL;

UPDATE v SET [Value] = COALESCE(v.[Value], NULLIF(v.OptionCode, N''), o.Code)
FROM dbo.AppFieldHistorySettingValues AS v
LEFT JOIN dbo.AppFieldsOptions AS o ON o.Id = v.AppFieldsOptionId
WHERE v.AppFieldsOptionId IS NOT NULL;

UPDATE v SET [Value] = COALESCE(v.[Value], NULLIF(v.OptionCode, N''), o.Code)
FROM dbo.AppTableFieldSettingValues AS v
LEFT JOIN dbo.AppFieldsOptions AS o ON o.Id = v.AppFieldsOptionId
WHERE v.AppFieldsOptionId IS NOT NULL;

IF EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues WHERE [Value] IS NULL)
    THROW 51132, 'A current field setting option has no code; resolve it before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppFieldHistorySettingValues WHERE [Value] IS NULL)
    THROW 51133, 'A historical field setting option has no code; resolve it before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppTableFieldSettingValues WHERE [Value] IS NULL)
    THROW 51134, 'An applied field setting option has no code; resolve it before migration.', 1;
IF EXISTS (SELECT 1 FROM dbo.AppFieldSettingValues
    GROUP BY AppFieldId, SettingFieldId, [Value] HAVING COUNT(*) > 1)
    THROW 51135, 'Duplicate selected field setting values must be resolved before migration.', 1;

IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_AppFieldSettingValues_SettingOption'
    AND parent_object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    ALTER TABLE dbo.AppFieldSettingValues DROP CONSTRAINT FK_AppFieldSettingValues_SettingOption;
IF EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = N'FK_AppFieldSettingValues_Option'
    AND parent_object_id = OBJECT_ID(N'dbo.AppFieldSettingValues'))
    ALTER TABLE dbo.AppFieldSettingValues DROP CONSTRAINT FK_AppFieldSettingValues_Option;

DECLARE @indexName sysname;
DECLARE @dropSql nvarchar(max);
DECLARE option_indexes CURSOR LOCAL FAST_FORWARD FOR
    SELECT DISTINCT i.name
    FROM sys.indexes AS i
    JOIN sys.index_columns AS ic ON ic.object_id = i.object_id AND ic.index_id = i.index_id
    JOIN sys.columns AS c ON c.object_id = ic.object_id AND c.column_id = ic.column_id
    WHERE i.object_id = OBJECT_ID(N'dbo.AppFieldSettingValues')
      AND i.is_primary_key = 0 AND i.is_unique_constraint = 0
      AND (c.name = N'AppFieldsOptionId' OR i.name IN
          (N'IX_AppFieldSettingValues_Scalar', N'IX_AppFieldSettingValues_Option',
           N'IX_AppFieldSettingValues_AppFieldId_SettingFieldId'));
OPEN option_indexes;
FETCH NEXT FROM option_indexes INTO @indexName;
WHILE @@FETCH_STATUS = 0
BEGIN
    SET @dropSql = N'DROP INDEX ' + QUOTENAME(@indexName) + N' ON dbo.AppFieldSettingValues';
    EXEC sys.sp_executesql @dropSql;
    FETCH NEXT FROM option_indexes INTO @indexName;
END;
CLOSE option_indexes;
DEALLOCATE option_indexes;");

            foreach (var table in new[] { "AppFieldSettingValues", "AppFieldHistorySettingValues", "AppTableFieldSettingValues" })
            {
                migrationBuilder.DropColumn("AppFieldsOptionId", table);
                migrationBuilder.DropColumn("OptionCode", table);
                migrationBuilder.DropColumn("OptionName", table);
            }
            migrationBuilder.DropTable("AppFieldsOptions");
            migrationBuilder.AddCheckConstraint("CK_AppFieldSettingValues_OneValue", "AppFieldSettingValues",
                "[Value] IS NOT NULL");
            migrationBuilder.CreateIndex("IX_AppFieldSettingValues_AppFieldId_SettingFieldId",
                "AppFieldSettingValues", new[] { "AppFieldId", "SettingFieldId" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Restoring option IDs requires a database backup.");
        }
    }
}

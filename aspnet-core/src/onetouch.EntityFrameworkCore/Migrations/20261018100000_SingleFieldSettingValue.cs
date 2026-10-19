using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261018100000_SingleFieldSettingValue")]
    public class SingleFieldSettingValue : Migration
    {
        private static readonly string[] Tables =
        {
            "AppFieldSettingValues", "AppFieldHistorySettingValues", "AppTableFieldSettingValues"
        };

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            foreach (var table in Tables)
            {
                migrationBuilder.AddColumn<string>(
                    name: "Value", table: table, type: "nvarchar(2000)", maxLength: 2000,
                    nullable: true);

                migrationBuilder.Sql($@"
IF EXISTS (SELECT 1 FROM dbo.[{table}] WHERE
    (CASE WHEN [AppFieldsOptionId] IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN [ValueText] IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN [ValueNumber] IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN [ValueBoolean] IS NULL THEN 0 ELSE 1 END) +
    (CASE WHEN [ValueDateTime] IS NULL THEN 0 ELSE 1 END) > 1)
    THROW 51130, 'A field setting has more than one value; resolve it before migration.', 1;

UPDATE dbo.[{table}]
SET [Value] = COALESCE(
    [ValueText],
    CONVERT(nvarchar(2000), [ValueNumber]),
    CASE WHEN [ValueBoolean] = 1 THEN N'true'
         WHEN [ValueBoolean] = 0 THEN N'false' END,
    CONVERT(nvarchar(33), [ValueDateTime], 126));");
            }

            migrationBuilder.DropCheckConstraint(
                name: "CK_AppFieldSettingValues_OneValue", table: "AppFieldSettingValues");

            foreach (var table in Tables)
            {
                migrationBuilder.DropColumn(name: "ValueText", table: table);
                migrationBuilder.DropColumn(name: "ValueNumber", table: table);
                migrationBuilder.DropColumn(name: "ValueBoolean", table: table);
                migrationBuilder.DropColumn(name: "ValueDateTime", table: table);
            }

            migrationBuilder.AddCheckConstraint(
                name: "CK_AppFieldSettingValues_OneValue", table: "AppFieldSettingValues",
                sql: "(CASE WHEN [AppFieldsOptionId] IS NULL THEN 0 ELSE 1 END) + " +
                     "(CASE WHEN [Value] IS NULL THEN 0 ELSE 1 END) = 1");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Restoring typed setting columns requires a database backup.");
        }
    }
}

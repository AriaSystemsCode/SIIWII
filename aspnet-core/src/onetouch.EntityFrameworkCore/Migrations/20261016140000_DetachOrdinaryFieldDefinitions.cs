using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016140000_DetachOrdinaryFieldDefinitions")]
    public class DetachOrdinaryFieldDefinitions : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "SycObjectId", table: "AppFields", type: "bigint", nullable: true,
                oldClrType: typeof(long), oldType: "bigint");
            migrationBuilder.AlterColumn<long>(
                name: "SycObjectId", table: "AppFieldsHistory", type: "bigint", nullable: true,
                oldClrType: typeof(long), oldType: "bigint");
            migrationBuilder.AlterColumn<long>(
                name: "DefinitionSycObjectId", table: "AppTableFields", type: "bigint", nullable: true,
                oldClrType: typeof(long), oldType: "bigint");

            // Only the settings owned by the six Field types retain an owner.
            // Table ownership remains on AppTableFields.SycObjectId.
            migrationBuilder.Sql(@"
UPDATE f SET SycObjectId = NULL, EntitySycObjectId = NULL
FROM dbo.AppFields AS f
WHERE NOT EXISTS
(
    SELECT 1 FROM dbo.SydObjects AS o
    JOIN dbo.SycEntityObjectTypes AS root ON root.ObjectId = o.Id
        AND root.Code = N'FIELD' AND root.ParentId IS NULL AND root.IsDeleted = 0
    JOIN dbo.SycEntityObjectTypes AS t ON t.ObjectId = o.Id
        AND t.ParentId = root.Id AND t.Id = f.EntitySycObjectId AND t.IsDeleted = 0
    WHERE o.Id = f.SycObjectId AND o.Code = N'FIELD' AND o.IsDeleted = 0
      AND t.Code IN (N'BOOLEAN', N'DP', N'IC', N'IN', N'LD', N'ST')
);

UPDATE h SET SycObjectId = f.SycObjectId,
             EntitySycObjectId = f.EntitySycObjectId
FROM dbo.AppFieldsHistory AS h
JOIN dbo.AppFields AS f ON f.Id = h.AppFieldId;

UPDATE a SET DefinitionSycObjectId = f.SycObjectId,
             EntitySycObjectId = f.EntitySycObjectId
FROM dbo.AppTableFields AS a
LEFT JOIN dbo.AppFields AS f ON f.Id = a.SourceAppFieldId;
");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException(
                "Ordinary field definitions cannot recover their former owner from the catalog. Restore a database backup to undo this migration.");
        }
    }
}

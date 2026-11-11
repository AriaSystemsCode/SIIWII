using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261002120000_AddAppTableFields")]
    public class AddAppTableFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppTableFields",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    AppFieldId = table.Column<long>(type: "bigint", nullable: false),
                    SycObjectId = table.Column<long>(type: "bigint", nullable: false),
                    SycEntityObjectTypeId = table.Column<long>(type: "bigint", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTableFields", x => x.Id);
                    table.ForeignKey("FK_AppTableFields_APPFields_AppFieldId", x => x.AppFieldId,
                        "APPFields", "Id", onDelete: ReferentialAction.Restrict);
                    table.ForeignKey("FK_AppTableFields_SydObjects_SycObjectId", x => x.SycObjectId,
                        "SydObjects", "Id", onDelete: ReferentialAction.Restrict);
                    table.ForeignKey("FK_AppTableFields_SycEntityObjectTypes_SycEntityObjectTypeId",
                        x => x.SycEntityObjectTypeId, "SycEntityObjectTypes", "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex("IX_AppTableFields_AppFieldId", "AppTableFields", "AppFieldId");
            migrationBuilder.CreateIndex("IX_AppTableFields_SycObjectId", "AppTableFields", "SycObjectId");
            migrationBuilder.CreateIndex("IX_AppTableFields_SycEntityObjectTypeId", "AppTableFields", "SycEntityObjectTypeId");
            migrationBuilder.CreateIndex("IX_AppTableFields_TenantId_SycObjectId_SycEntityObjectTypeId",
                "AppTableFields", new[] { "TenantId", "SycObjectId", "SycEntityObjectTypeId" });
            migrationBuilder.CreateIndex("IX_AppTableFields_TenantId_AppFieldId_SycObjectId_SycEntityObjectTypeId",
                "AppTableFields", new[] { "TenantId", "AppFieldId", "SycObjectId", "SycEntityObjectTypeId" },
                unique: true);

            migrationBuilder.Sql(@"
INSERT AppTableFields(TenantId, AppFieldId, SycObjectId, SycEntityObjectTypeId, CreationTime, CreatorUserId)
SELECT f.TenantId, f.Id, f.SycObjectId, NULL, SYSUTCDATETIME(), f.CreatorUserId
FROM APPFields AS f
WHERE f.IsDeleted = 0
  AND NOT EXISTS (SELECT 1 FROM AppTableFields AS a WHERE a.AppFieldId = f.Id);");

            migrationBuilder.Sql(@"
IF (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0) <> 1
    OR (SELECT COUNT(*) FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0) <> 1
    THROW 51053, 'Expected one active ENTITY and DATA object type.', 1;
DECLARE @entityTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'ENTITY' AND IsDeleted = 0);
DECLARE @dataTypeId bigint = (SELECT Id FROM dbo.SysObjectTypes WHERE Code = N'DATA' AND IsDeleted = 0);
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION' OR Name = N'Transaction')
      AND NOT (Code = N'TRANSACTION' AND ObjectTypeId = @entityTypeId
          AND ObjectTypeCode = N'ENTITY' AND ParentId IS NULL
          AND ParentCode IS NULL AND IsDeleted = 0))
    THROW 51054, 'A conflicting Transaction object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0)
    INSERT dbo.SydObjects (CreationTime, IsDeleted, Name, Code, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'Transaction', N'TRANSACTION', N'ENTITY', @entityTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects WHERE Code = N'TRANSACTION' AND IsDeleted = 0) <> 1
    THROW 51054, 'Expected one Transaction object.', 1;
DECLARE @transactionId bigint = (SELECT Id FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION' AND IsDeleted = 0);
IF EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE (Code = N'TRANSACTION-HEADER-DATA' OR Name = N'AppTransactionHeaders')
      AND NOT (Code = N'TRANSACTION-HEADER-DATA' AND Name = N'AppTransactionHeaders'
          AND ObjectTypeId = @dataTypeId AND ObjectTypeCode = N'DATA'
          AND ParentId = @transactionId AND ParentCode = N'TRANSACTION'
          AND IsDeleted = 0))
    THROW 51055, 'A conflicting AppTransactionHeaders object exists.', 1;
IF NOT EXISTS (SELECT 1 FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0)
    INSERT dbo.SydObjects
        (CreationTime, IsDeleted, Name, Code, ParentId, ParentCode, ObjectTypeCode, ObjectTypeId)
    VALUES (SYSUTCDATETIME(), 0, N'AppTransactionHeaders', N'TRANSACTION-HEADER-DATA',
            @transactionId, N'TRANSACTION', N'DATA', @dataTypeId);
IF (SELECT COUNT(*) FROM dbo.SydObjects
    WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0) <> 1
    THROW 51055, 'Expected one AppTransactionHeaders object.', 1;
DECLARE @headerId bigint = (SELECT Id FROM SydObjects WHERE Code = N'TRANSACTION-HEADER-DATA' AND IsDeleted = 0);
IF @headerId IS NULL OR @transactionId IS NULL
    THROW 51051, 'Transaction metadata is missing.', 1;
IF EXISTS (SELECT 1 FROM SycEntityObjectTypes
           WHERE Code IN (N'SALESORDER', N'PURCHASEORDER') AND IsDeleted = 0
             AND ObjectId NOT IN (@transactionId, @headerId))
    THROW 51052, 'Order type is attached to an unexpected object.', 1;
UPDATE SycEntityObjectTypes
SET ObjectId = @headerId, ObjectCode = N'TRANSACTION-HEADER-DATA'
WHERE Code IN (N'SALESORDER', N'PURCHASEORDER') AND IsDeleted = 0
  AND ObjectId = @transactionId;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "AppTableFields");
        }
    }
}

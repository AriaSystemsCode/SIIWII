using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261016130000_RemoveFieldIsCustom")]
    public class RemoveFieldIsCustom : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // A table assignment may belong to a tenant while its field definition is host-owned.
            migrationBuilder.Sql(@"
UPDATE dbo.AppFields SET IsStandard = CASE WHEN TenantId IS NULL THEN 1 ELSE 0 END;
UPDATE dbo.AppFieldsHistory SET IsStandard = CASE WHEN TenantId IS NULL THEN 1 ELSE 0 END;
UPDATE dbo.AppTableFields SET IsStandard = CASE WHEN FieldTenantId IS NULL THEN 1 ELSE 0 END;
");

            migrationBuilder.DropColumn(name: "IsCustom", table: "AppFields");
            migrationBuilder.DropColumn(name: "IsCustom", table: "AppFieldsHistory");
            migrationBuilder.DropColumn(name: "IsCustom", table: "AppTableFields");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(name: "IsCustom", table: "AppFields", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsCustom", table: "AppFieldsHistory", type: "bit", nullable: false, defaultValue: false);
            migrationBuilder.AddColumn<bool>(name: "IsCustom", table: "AppTableFields", type: "bit", nullable: false, defaultValue: false);

            migrationBuilder.Sql(@"
UPDATE dbo.AppFields SET IsCustom = CASE WHEN IsStandard = 1 THEN 0 ELSE 1 END;
UPDATE dbo.AppFieldsHistory SET IsCustom = CASE WHEN IsStandard = 1 THEN 0 ELSE 1 END;
UPDATE dbo.AppTableFields SET IsCustom = CASE WHEN IsStandard = 1 THEN 0 ELSE 1 END;
");
        }
    }
}

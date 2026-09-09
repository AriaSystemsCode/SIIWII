using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20260828193000_AddImportLookupIndex")]
    public class AddImportLookupIndex : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Cover the import's type/code lookup without loading the wide entity rows.
            // Unfiltered so EF's parameterized soft-delete predicate can use the index.
            // Idempotent because this index may already be applied as a performance hotfix.
            migrationBuilder.Sql(@"
SET QUOTED_IDENTIFIER ON;
SET ANSI_NULLS ON;
SET ANSI_PADDING ON;
SET ANSI_WARNINGS ON;
SET ARITHABORT ON;
SET CONCAT_NULL_YIELDS_NULL ON;
SET NUMERIC_ROUNDABORT OFF;
IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.AppEntities')
      AND name = N'IX_AppEntities_ImportLookup_Type_Code_Tenant')
BEGIN
    CREATE NONCLUSTERED INDEX [IX_AppEntities_ImportLookup_Type_Code_Tenant]
    ON [dbo].[AppEntities] ([EntityObjectTypeCode], [Code], [TenantId])
    INCLUDE ([Name], [IsDeleted]);
END;");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
IF EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE object_id = OBJECT_ID(N'dbo.AppEntities')
      AND name = N'IX_AppEntities_ImportLookup_Type_Code_Tenant')
    DROP INDEX [IX_AppEntities_ImportLookup_Type_Code_Tenant] ON [dbo].[AppEntities];");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class create_index_on_Syccounter : Migration
    {
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_SycCounters_TenantId_SycSegmentIdentifierDefinitionId",
                table: "SycCounters");

            migrationBuilder.DropIndex(
                name: "IX_AppEntities_TenantId_EntityObjectTypeCode_Code",
                table: "AppEntities");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectClassifications_TenantId_Code",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectCategories_TenantId_Code",
                table: "SycEntityObjectCategories");


            migrationBuilder.DropIndex(
                name: "IX_AppAddresses_TenantId_Code",
                table: "AppAddresses");
        }

        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_SycCounters_TenantId_SycSegmentIdentifierDefinitionId",
                table: "SycCounters",
                columns: new[] { "IsDeleted", "TenantId", "SycSegmentIdentifierDefinitionId" },
                unique: true, filter: "IsDeleted=0");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_TenantId_EntityObjectTypeCode_Code",
                table: "AppEntities",
                columns: new[] { "IsDeleted", "TenantId","ObjectCode", "EntityObjectTypeCode", "Code" },
                unique: true, filter: "IsDeleted=0");

            migrationBuilder.CreateIndex(
               name: "IX_SycEntityObjectClassifications_TenantId_Code",
               table: "SycEntityObjectClassifications",
               columns: new[] { "IsDeleted", "TenantId", "ObjectCode","ParentCode", "Code" },
               unique: true, filter: "IsDeleted=0");

           migrationBuilder.CreateIndex(
               name: "IX_SycEntityObjectCategories_TenantId_Code",
               table: "SycEntityObjectCategories",
               columns: new[] { "IsDeleted", "TenantId", "ObjectCode", "ParentCode","Code" },
               unique: true, filter: "IsDeleted=0");

            migrationBuilder.CreateIndex(
                 name: "IX_AppAddresses_TenantId_Code",
                 table: "AppAddresses",
                 columns: new[] { "IsDeleted", "TenantId", "Code", "AccountId"},
                 unique: true, filter: "IsDeleted=0");

        }
    }
}

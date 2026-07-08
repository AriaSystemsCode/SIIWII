using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addtaxratemarketplaceItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TaxRate",
                table: "AppMarketplaceItems",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            //migrationBuilder.CreateIndex(
            //    name: "IX_AppEntities_TenantOwner",
            //    table: "AppEntities",
            //    column: "TenantOwner");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_AppEntities_AbpTenants_TenantOwner",
            //    table: "AppEntities",
            //    column: "TenantOwner",
            //    principalTable: "AbpTenants",
            //    principalColumn: "Id",
            //    onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.DropForeignKey(
            //    name: "FK_AppEntities_AbpTenants_TenantOwner",
            //    table: "AppEntities");

            //migrationBuilder.DropIndex(
            //    name: "IX_AppEntities_TenantOwner",
            //    table: "AppEntities");

            migrationBuilder.DropColumn(
                name: "TaxRate",
                table: "AppMarketplaceItems");
        }
    }
}

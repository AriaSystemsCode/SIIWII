using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddItemListItemDetailFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail",
                column: "AppMarketplaceItemId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail");

            migrationBuilder.DropIndex(
                name: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail");
        }
    }
}

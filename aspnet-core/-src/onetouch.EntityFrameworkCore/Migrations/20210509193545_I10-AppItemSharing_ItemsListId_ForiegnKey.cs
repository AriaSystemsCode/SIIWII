using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class I10AppItemSharing_ItemsListId_ForiegnKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppItemSharing_ItemListId",
                table: "AppItemSharing",
                column: "ItemListId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItemSharing_AppItemsLists_ItemListId",
                table: "AppItemSharing",
                column: "ItemListId",
                principalTable: "AppItemsLists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItemSharing_AppItemsLists_ItemListId",
                table: "AppItemSharing");

            migrationBuilder.DropIndex(
                name: "IX_AppItemSharing_ItemListId",
                table: "AppItemSharing");
        }
    }
}

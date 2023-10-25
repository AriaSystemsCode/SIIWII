using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class ChangeItemSizeScaleParent : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppItemSizeScalesHeader_ParentId",
                table: "AppItemSizeScalesHeader",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItemSizeScalesHeader_AppItemSizeScalesHeader_ParentId",
                table: "AppItemSizeScalesHeader",
                column: "ParentId",
                principalTable: "AppItemSizeScalesHeader",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItemSizeScalesHeader_AppItemSizeScalesHeader_ParentId",
                table: "AppItemSizeScalesHeader");

            migrationBuilder.DropIndex(
                name: "IX_AppItemSizeScalesHeader_ParentId",
                table: "AppItemSizeScalesHeader");
        }
    }
}

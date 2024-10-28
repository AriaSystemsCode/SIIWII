using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addCategoryIdtoFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Category",
                table: "AppFeatures",
                newName: "CategoryCode");

            migrationBuilder.AddColumn<long>(
                name: "CategoryId",
                table: "AppFeatures",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppFeatures_CategoryId",
                table: "AppFeatures",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppFeatures_AppEntities_CategoryId",
                table: "AppFeatures",
                column: "CategoryId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppFeatures_AppEntities_CategoryId",
                table: "AppFeatures");

            migrationBuilder.DropIndex(
                name: "IX_AppFeatures_CategoryId",
                table: "AppFeatures");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "AppFeatures");

            migrationBuilder.RenameColumn(
                name: "CategoryCode",
                table: "AppFeatures",
                newName: "Category");
        }
    }
}

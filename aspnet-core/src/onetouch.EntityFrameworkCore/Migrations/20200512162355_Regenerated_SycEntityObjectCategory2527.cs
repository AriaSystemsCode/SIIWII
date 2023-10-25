using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycEntityObjectCategory2527 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectCategories",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectCategories_ParentId",
                table: "SycEntityObjectCategories",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectCategories_SycEntityObjectCategories_ParentId",
                table: "SycEntityObjectCategories",
                column: "ParentId",
                principalTable: "SycEntityObjectCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectCategories_SycEntityObjectCategories_ParentId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectCategories_ParentId",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SycEntityObjectCategories");
        }
    }
}

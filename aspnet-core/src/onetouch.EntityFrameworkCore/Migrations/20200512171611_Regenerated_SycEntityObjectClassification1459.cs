using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycEntityObjectClassification1459 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectClassifications",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectClassifications_ParentId",
                table: "SycEntityObjectClassifications",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectClassifications_SycEntityObjectClassifications_ParentId",
                table: "SycEntityObjectClassifications",
                column: "ParentId",
                principalTable: "SycEntityObjectClassifications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectClassifications_SycEntityObjectClassifications_ParentId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectClassifications_ParentId",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SycEntityObjectClassifications");
        }
    }
}

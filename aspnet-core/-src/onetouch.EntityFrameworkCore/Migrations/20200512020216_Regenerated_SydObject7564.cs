using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SydObject7564 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Code",
                table: "SydObjects",
                maxLength: 150,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "SydObjects",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_ParentId",
                table: "SydObjects",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SydObjects_ParentId",
                table: "SydObjects",
                column: "ParentId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SydObjects_ParentId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_ParentId",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "Code",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SydObjects");
        }
    }
}

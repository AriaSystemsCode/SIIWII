using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycEntityObjectType2070 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExtraData",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectTypes_ParentId",
                table: "SycEntityObjectTypes",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectTypes_SycEntityObjectTypes_ParentId",
                table: "SycEntityObjectTypes",
                column: "ParentId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectTypes_SycEntityObjectTypes_ParentId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectTypes_ParentId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "ExtraData",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SycEntityObjectTypes");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SysObjectType7031 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ParentId",
                table: "SysObjectTypes",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SysObjectTypes_ParentId",
                table: "SysObjectTypes",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SysObjectTypes_SysObjectTypes_ParentId",
                table: "SysObjectTypes",
                column: "ParentId",
                principalTable: "SysObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SysObjectTypes_SysObjectTypes_ParentId",
                table: "SysObjectTypes");

            migrationBuilder.DropIndex(
                name: "IX_SysObjectTypes_ParentId",
                table: "SysObjectTypes");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SysObjectTypes");
        }
    }
}

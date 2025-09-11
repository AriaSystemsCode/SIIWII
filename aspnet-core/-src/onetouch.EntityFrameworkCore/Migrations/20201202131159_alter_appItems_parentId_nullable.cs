using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class alter_appItems_parentId_nullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_AppItems_ParentId",
                table: "AppItems");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "AppItems",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_AppItems_ParentId",
                table: "AppItems",
                column: "ParentId",
                principalTable: "AppItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_AppItems_ParentId",
                table: "AppItems");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "AppItems",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_AppItems_ParentId",
                table: "AppItems",
                column: "ParentId",
                principalTable: "AppItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

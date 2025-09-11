using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class UpdateMessage_Table : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<long>(
                name: "EntityId",
                table: "AppMessages",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.CreateIndex(
                name: "IX_AppMessages_EntityId",
                table: "AppMessages",
                column: "EntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMessages_AppEntities_EntityId",
                table: "AppMessages",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMessages_AppEntities_EntityId",
                table: "AppMessages");

            migrationBuilder.DropIndex(
                name: "IX_AppMessages_EntityId",
                table: "AppMessages");

            migrationBuilder.AlterColumn<int>(
                name: "EntityId",
                table: "AppMessages",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}

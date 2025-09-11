using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AlterAppItem_ParentEntityId3 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ParentEntityId",
                table: "AppItems",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_ParentEntityId",
                table: "AppItems",
                column: "ParentEntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_AppEntities_ParentEntityId",
                table: "AppItems",
                column: "ParentEntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_AppEntities_ParentEntityId",
                table: "AppItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_ParentEntityId",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "ParentEntityId",
                table: "AppItems");
        }
    }
}

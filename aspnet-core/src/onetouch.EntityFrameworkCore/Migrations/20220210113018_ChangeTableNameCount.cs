using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class ChangeTableNameCount : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityReactionsCount_AppEntities_EntityId",
                table: "AppEntityReactionsCount");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppEntityReactionsCount",
                table: "AppEntityReactionsCount");

            migrationBuilder.RenameTable(
                name: "AppEntityReactionsCount",
                newName: "AppEntityInteractions");

            migrationBuilder.RenameIndex(
                name: "IX_AppEntityReactionsCount_EntityId",
                table: "AppEntityInteractions",
                newName: "IX_AppEntityInteractions_EntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppEntityInteractions",
                table: "AppEntityInteractions",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityInteractions_AppEntities_EntityId",
                table: "AppEntityInteractions",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityInteractions_AppEntities_EntityId",
                table: "AppEntityInteractions");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppEntityInteractions",
                table: "AppEntityInteractions");

            migrationBuilder.RenameTable(
                name: "AppEntityInteractions",
                newName: "AppEntityReactionsCount");

            migrationBuilder.RenameIndex(
                name: "IX_AppEntityInteractions_EntityId",
                table: "AppEntityReactionsCount",
                newName: "IX_AppEntityReactionsCount_EntityId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppEntityReactionsCount",
                table: "AppEntityReactionsCount",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityReactionsCount_AppEntities_EntityId",
                table: "AppEntityReactionsCount",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppEventsGuest_AddEntityId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "EntityId",
                table: "AppEventGuests",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_AppEventGuests_EntityId",
                table: "AppEventGuests",
                column: "EntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEventGuests_AppEntities_EntityId",
                table: "AppEventGuests",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEventGuests_AppEntities_EntityId",
                table: "AppEventGuests");

            migrationBuilder.DropIndex(
                name: "IX_AppEventGuests_EntityId",
                table: "AppEventGuests");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "AppEventGuests");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class _2022_02_21_AppEventGusts : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "EventId",
                table: "AppEventGuests",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_AppEventGuests_EventId",
                table: "AppEventGuests",
                column: "EventId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEventGuests_AppEvents_EventId",
                table: "AppEventGuests",
                column: "EventId",
                principalTable: "AppEvents",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEventGuests_AppEvents_EventId",
                table: "AppEventGuests");

            migrationBuilder.DropIndex(
                name: "IX_AppEventGuests_EventId",
                table: "AppEventGuests");

            migrationBuilder.DropColumn(
                name: "EventId",
                table: "AppEventGuests");
        }
    }
}

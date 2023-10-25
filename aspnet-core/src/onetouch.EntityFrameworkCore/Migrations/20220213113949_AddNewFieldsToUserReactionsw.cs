using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AddNewFieldsToUserReactionsw : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "InteractionType",
                table: "AppEntityUserReactions",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "TenantId",
                table: "AppEntityUserReactions",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityUserReactions_ActionTime",
                table: "AppEntityUserReactions",
                column: "ActionTime");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppEntityUserReactions_ActionTime",
                table: "AppEntityUserReactions");

            migrationBuilder.DropColumn(
                name: "InteractionType",
                table: "AppEntityUserReactions");

            migrationBuilder.DropColumn(
                name: "TenantId",
                table: "AppEntityUserReactions");
        }
    }
}

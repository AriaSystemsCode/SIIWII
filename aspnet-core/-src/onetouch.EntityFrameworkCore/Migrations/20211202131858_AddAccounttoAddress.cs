using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AddAccounttoAddress : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AccountId",
                table: "AppAddresses",
                nullable: false,
                defaultValue: 0L);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AccountId",
                table: "AppAddresses");
        }
    }
}

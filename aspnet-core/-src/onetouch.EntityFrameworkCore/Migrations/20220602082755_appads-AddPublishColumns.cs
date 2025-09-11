using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class appadsAddPublishColumns : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsApproved",
                table: "AppAdvertisements");

            migrationBuilder.AddColumn<bool>(
                name: "PublishOnHomePage",
                table: "AppAdvertisements",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "PublishOnMarketLandingPage",
                table: "AppAdvertisements",
                nullable: false,
                defaultValue: false);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PublishOnHomePage",
                table: "AppAdvertisements");

            migrationBuilder.DropColumn(
                name: "PublishOnMarketLandingPage",
                table: "AppAdvertisements");

            migrationBuilder.AddColumn<bool>(
                name: "IsApproved",
                table: "AppAdvertisements",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}

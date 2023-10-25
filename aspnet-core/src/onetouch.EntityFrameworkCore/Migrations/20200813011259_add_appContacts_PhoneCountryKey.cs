using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_appContacts_PhoneCountryKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Phone1CountryKey",
                table: "AppContacts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone2CountryKey",
                table: "AppContacts",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone3CountryKey",
                table: "AppContacts",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Phone1CountryKey",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone2CountryKey",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone3CountryKey",
                table: "AppContacts");
        }
    }
}

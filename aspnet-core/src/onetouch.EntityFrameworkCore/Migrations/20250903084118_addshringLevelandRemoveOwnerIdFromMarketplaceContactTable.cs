using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addshringLevelandRemoveOwnerIdFromMarketplaceContactTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsHidden",
                table: "AppMarketplaceContacts");

            migrationBuilder.DropColumn(
                name: "OwnerId",
                table: "AppMarketplaceContacts");

            migrationBuilder.AddColumn<int>(
                name: "SharingLevel",
                table: "AppMarketplaceContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SharingLevel",
                table: "AppMarketplaceContacts");

            migrationBuilder.AddColumn<bool>(
                name: "IsHidden",
                table: "AppMarketplaceContacts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "OwnerId",
                table: "AppMarketplaceContacts",
                type: "int",
                nullable: true);
        }
    }
}

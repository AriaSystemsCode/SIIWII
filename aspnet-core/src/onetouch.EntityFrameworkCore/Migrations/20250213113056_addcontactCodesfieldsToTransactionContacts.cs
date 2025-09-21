using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addcontactCodesfieldsToTransactionContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CompanyCode",
                table: "AppTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactCode",
                table: "AppTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CompanyCode",
                table: "AppMarketplaceTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactCode",
                table: "AppMarketplaceTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CompanyCode",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactCode",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "CompanyCode",
                table: "AppMarketplaceTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactCode",
                table: "AppMarketplaceTransactionContacts");
        }
    }
}

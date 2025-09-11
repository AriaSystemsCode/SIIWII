using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressInfoToTransactionContactTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PaymentTermsName",
                table: "AppTransactionHeaders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipViaName",
                table: "AppTransactionHeaders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressCity",
                table: "AppTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressCountryCode",
                table: "AppTransactionContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ContactAddressCountryId",
                table: "AppTransactionContacts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressLine1",
                table: "AppTransactionContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressLine2",
                table: "AppTransactionContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressName",
                table: "AppTransactionContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressPostalCode",
                table: "AppTransactionContacts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactAddressState",
                table: "AppTransactionContacts",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionContacts_ContactAddressCountryId",
                table: "AppTransactionContacts",
                column: "ContactAddressCountryId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_ContactAddressCountryId",
                table: "AppTransactionContacts",
                column: "ContactAddressCountryId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_ContactAddressCountryId",
                table: "AppTransactionContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionContacts_ContactAddressCountryId",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsName",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "ShipViaName",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "ContactAddressCity",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressCountryCode",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressCountryId",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressLine1",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressLine2",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressName",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressPostalCode",
                table: "AppTransactionContacts");

            migrationBuilder.DropColumn(
                name: "ContactAddressState",
                table: "AppTransactionContacts");
        }
    }
}

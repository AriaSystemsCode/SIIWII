using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class renameTransactionContactsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionContacts_AppAddresses_AddressId",
                table: "AppTransactionContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_PhoneTypeId",
                table: "AppTransactionContacts");

            migrationBuilder.RenameColumn(
                name: "PhoneTypeName",
                table: "AppTransactionContacts",
                newName: "ContactPhoneTypeName");

            migrationBuilder.RenameColumn(
                name: "PhoneTypeId",
                table: "AppTransactionContacts",
                newName: "ContactPhoneTypeId");

            migrationBuilder.RenameColumn(
                name: "AddressId",
                table: "AppTransactionContacts",
                newName: "ContactAddressId");

            migrationBuilder.RenameColumn(
                name: "AddressCode",
                table: "AppTransactionContacts",
                newName: "ContactAddressCode");

            migrationBuilder.RenameIndex(
                name: "IX_AppTransactionContacts_PhoneTypeId",
                table: "AppTransactionContacts",
                newName: "IX_AppTransactionContacts_ContactPhoneTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_AppTransactionContacts_AddressId",
                table: "AppTransactionContacts",
                newName: "IX_AppTransactionContacts_ContactAddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionContacts_AppAddresses_ContactAddressId",
                table: "AppTransactionContacts",
                column: "ContactAddressId",
                principalTable: "AppAddresses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_ContactPhoneTypeId",
                table: "AppTransactionContacts",
                column: "ContactPhoneTypeId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionContacts_AppAddresses_ContactAddressId",
                table: "AppTransactionContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_ContactPhoneTypeId",
                table: "AppTransactionContacts");

            migrationBuilder.RenameColumn(
                name: "ContactPhoneTypeName",
                table: "AppTransactionContacts",
                newName: "PhoneTypeName");

            migrationBuilder.RenameColumn(
                name: "ContactPhoneTypeId",
                table: "AppTransactionContacts",
                newName: "PhoneTypeId");

            migrationBuilder.RenameColumn(
                name: "ContactAddressId",
                table: "AppTransactionContacts",
                newName: "AddressId");

            migrationBuilder.RenameColumn(
                name: "ContactAddressCode",
                table: "AppTransactionContacts",
                newName: "AddressCode");

            migrationBuilder.RenameIndex(
                name: "IX_AppTransactionContacts_ContactPhoneTypeId",
                table: "AppTransactionContacts",
                newName: "IX_AppTransactionContacts_PhoneTypeId");

            migrationBuilder.RenameIndex(
                name: "IX_AppTransactionContacts_ContactAddressId",
                table: "AppTransactionContacts",
                newName: "IX_AppTransactionContacts_AddressId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionContacts_AppAddresses_AddressId",
                table: "AppTransactionContacts",
                column: "AddressId",
                principalTable: "AppAddresses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionContacts_AppEntities_PhoneTypeId",
                table: "AppTransactionContacts",
                column: "PhoneTypeId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }
    }
}

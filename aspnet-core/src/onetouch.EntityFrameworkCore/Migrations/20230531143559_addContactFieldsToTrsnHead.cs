using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addContactFieldsToTrsnHead : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "BuyerContactId",
                table: "AppTransactionsHeader",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SellerContactId",
                table: "AppTransactionsHeader",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_BuyerContactId",
                table: "AppTransactionsHeader",
                column: "BuyerContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_SellerContactId",
                table: "AppTransactionsHeader",
                column: "SellerContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionsHeader_AppContacts_BuyerContactId",
                table: "AppTransactionsHeader",
                column: "BuyerContactId",
                principalTable: "AppContacts",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionsHeader_AppContacts_SellerContactId",
                table: "AppTransactionsHeader",
                column: "SellerContactId",
                principalTable: "AppContacts",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionsHeader_AppContacts_BuyerContactId",
                table: "AppTransactionsHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionsHeader_AppContacts_SellerContactId",
                table: "AppTransactionsHeader");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionsHeader_BuyerContactId",
                table: "AppTransactionsHeader");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionsHeader_SellerContactId",
                table: "AppTransactionsHeader");

            migrationBuilder.DropColumn(
                name: "BuyerContactId",
                table: "AppTransactionsHeader");

            migrationBuilder.DropColumn(
                name: "SellerContactId",
                table: "AppTransactionsHeader");
        }
    }
}

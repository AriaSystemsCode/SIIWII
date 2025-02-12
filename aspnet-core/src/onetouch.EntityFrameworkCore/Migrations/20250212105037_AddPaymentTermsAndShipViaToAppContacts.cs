using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentTermsAndShipViaToAppContacts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "PaymentTermsCashOnDelivery",
                table: "AppContacts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTermsCode",
                table: "AppContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PaymentTermsDiscount",
                table: "AppContacts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "PaymentTermsDiscount2",
                table: "AppContacts",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsDiscount2Days",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsDiscountDays",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "PaymentTermsEndOfMonth",
                table: "AppContacts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsEndOfMonthDays",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<long>(
                name: "PaymentTermsId",
                table: "AppContacts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTermsName",
                table: "AppContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsNetDueDays",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "PaymentTermsNextMonthDay",
                table: "AppContacts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTermsPaymentType",
                table: "AppContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "PaymentTermsUseInstallments",
                table: "AppContacts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "ShipViaCode",
                table: "AppContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ShipViaId",
                table: "AppContacts",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipViaName",
                table: "AppContacts",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_PaymentTermsId",
                table: "AppContacts",
                column: "PaymentTermsId");

            migrationBuilder.CreateIndex(
                name: "IX_AppContacts_ShipViaId",
                table: "AppContacts",
                column: "ShipViaId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_PaymentTermsId",
                table: "AppContacts",
                column: "PaymentTermsId",
                principalTable: "AppEntities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_ShipViaId",
                table: "AppContacts",
                column: "ShipViaId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_PaymentTermsId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_ShipViaId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_PaymentTermsId",
                table: "AppContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppContacts_ShipViaId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsCashOnDelivery",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsDiscount",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsDiscount2",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsDiscount2Days",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsDiscountDays",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsEndOfMonth",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsEndOfMonthDays",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsName",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsNetDueDays",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsNextMonthDay",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsPaymentType",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "PaymentTermsUseInstallments",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ShipViaCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ShipViaId",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "ShipViaName",
                table: "AppContacts");
        }
    }
}

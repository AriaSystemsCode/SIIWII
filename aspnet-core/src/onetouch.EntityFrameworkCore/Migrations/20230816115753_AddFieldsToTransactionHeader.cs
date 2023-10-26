using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddFieldsToTransactionHeader : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AvailableDate",
                table: "AppTransactionHeaders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "BuyerDepartment",
                table: "AppTransactionHeaders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentTermsCode",
                table: "AppTransactionHeaders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PaymentTermsId",
                table: "AppTransactionHeaders",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ShipViaCode",
                table: "AppTransactionHeaders",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ShipViaId",
                table: "AppTransactionHeaders",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "StartDate",
                table: "AppTransactionHeaders",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateTable(
                name: "AppTransactionContacts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<long>(type: "bigint", nullable: false),
                    ContactSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactRole = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BranchName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompanySSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    BranchSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    PhoneTypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    PhoneTypeId = table.Column<long>(type: "bigint", nullable: true),
                    AddressId = table.Column<long>(type: "bigint", nullable: true),
                    AddressCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionContacts_AppAddresses_AddressId",
                        column: x => x.AddressId,
                        principalTable: "AppAddresses",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionContacts_AppEntities_PhoneTypeId",
                        column: x => x.PhoneTypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionContacts_AppTransactionHeaders_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppTransactionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionHeaders_PaymentTermsId",
                table: "AppTransactionHeaders",
                column: "PaymentTermsId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionHeaders_ShipViaId",
                table: "AppTransactionHeaders",
                column: "ShipViaId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionContacts_AddressId",
                table: "AppTransactionContacts",
                column: "AddressId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionContacts_PhoneTypeId",
                table: "AppTransactionContacts",
                column: "PhoneTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionContacts_TransactionId",
                table: "AppTransactionContacts",
                column: "TransactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionHeaders_AppEntities_PaymentTermsId",
                table: "AppTransactionHeaders",
                column: "PaymentTermsId",
                principalTable: "AppEntities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionHeaders_AppEntities_ShipViaId",
                table: "AppTransactionHeaders",
                column: "ShipViaId",
                principalTable: "AppEntities",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionHeaders_AppEntities_PaymentTermsId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionHeaders_AppEntities_ShipViaId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropTable(
                name: "AppTransactionContacts");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionHeaders_PaymentTermsId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionHeaders_ShipViaId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "AvailableDate",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "BuyerDepartment",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "PaymentTermsCode",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "PaymentTermsId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "ShipViaCode",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "ShipViaId",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "StartDate",
                table: "AppTransactionHeaders");
        }
    }
}

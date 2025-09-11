using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddMarketplaceTransactionModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppMarketplaceTransactionHeaders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EnteredUserByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerCompanySSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerContactSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerCompanySSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerContactSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerContactEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerContactEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SellerContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BuyerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompleteDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AvailableDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ShipViaName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentTermsName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShipViaCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PaymentTermsCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerDepartment = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerStore = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TotalQuantity = table.Column<long>(type: "bigint", nullable: false),
                    TotalAmount = table.Column<double>(type: "float", nullable: false),
                    CurrencyExchangeRate = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceTransactionHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionHeaders_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceTransactionContacts",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<long>(type: "bigint", nullable: false),
                    ContactSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactEmail = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    ContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactRole = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BranchName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CompanySSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BranchSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactPhoneTypeName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ContactPhoneTypeId = table.Column<long>(type: "bigint", nullable: true),
                    ContactAddressCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactAddressName = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ContactAddressLine1 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ContactAddressLine2 = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true),
                    ContactAddressCity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ContactAddressState = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactAddressPostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ContactAddressCountryCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
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
                    table.PrimaryKey("PK_AppMarketplaceTransactionContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionContacts_AppEntities_ContactPhoneTypeId",
                        column: x => x.ContactPhoneTypeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionContacts_AppMarketplaceTransactionHeaders_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppMarketplaceTransactionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceTransactionDetails",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    TransactionId = table.Column<long>(type: "bigint", nullable: false),
                    TransactionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LineNo = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    GrossPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    NetPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(8,3)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(17,3)", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    NoOfPrePacks = table.Column<long>(type: "bigint", nullable: true),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    ManufacturerCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceTransactionDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionDetails_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionDetails_AppMarketplaceTransactionDetails_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceTransactionDetails",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceTransactionDetails_AppMarketplaceTransactionHeaders_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppMarketplaceTransactionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceTransactionContacts_ContactPhoneTypeId",
                table: "AppMarketplaceTransactionContacts",
                column: "ContactPhoneTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceTransactionContacts_TransactionId",
                table: "AppMarketplaceTransactionContacts",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceTransactionDetails_ParentId",
                table: "AppMarketplaceTransactionDetails",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceTransactionDetails_TransactionId",
                table: "AppMarketplaceTransactionDetails",
                column: "TransactionId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceTransactionContacts");

            migrationBuilder.DropTable(
                name: "AppMarketplaceTransactionDetails");

            migrationBuilder.DropTable(
                name: "AppMarketplaceTransactionHeaders");
        }
    }
}

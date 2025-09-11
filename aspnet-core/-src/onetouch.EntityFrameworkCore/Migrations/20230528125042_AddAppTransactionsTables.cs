using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddAppTransactionsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppTransactionsHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EnteredUserByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerId = table.Column<long>(type: "bigint", nullable: true),
                    BuyerName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerId = table.Column<long>(type: "bigint", nullable: true),
                    SellerName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LanguageId = table.Column<long>(type: "bigint", nullable: true),
                    LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SellerPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BuyerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PriceLevel = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionsHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppContacts_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "AppContacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppContacts_SellerId",
                        column: x => x.SellerId,
                        principalTable: "AppContacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppTransactionsDetail",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TransactionId = table.Column<long>(type: "bigint", nullable: false),
                    TransactionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LineNo = table.Column<int>(type: "int", nullable: false),
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    GrossPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    NetPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    Discount = table.Column<decimal>(type: "decimal(8,3)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(17,3)", nullable: false),
                    ItemId = table.Column<long>(type: "bigint", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
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
                    table.PrimaryKey("PK_AppTransactionsDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionsDetail_AppTransactionsHeader_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppTransactionsHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsDetail_TransactionId",
                table: "AppTransactionsDetail",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_BuyerId",
                table: "AppTransactionsHeader",
                column: "BuyerId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_CurrencyId",
                table: "AppTransactionsHeader",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_LanguageId",
                table: "AppTransactionsHeader",
                column: "LanguageId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_SellerId",
                table: "AppTransactionsHeader",
                column: "SellerId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTransactionsDetail");

            migrationBuilder.DropTable(
                name: "AppTransactionsHeader");
        }
    }
}

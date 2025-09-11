using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AdjustTransactionTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTransactionsDetail");

            migrationBuilder.DropTable(
                name: "AppTransactionsHeader");

            migrationBuilder.CreateTable(
                name: "AppTransactionHeaders",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EnteredUserByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerCompanySSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    BuyerContactSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    SellerCompanySSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    SellerContactSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    SellerContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerContactEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    LanguageId = table.Column<long>(type: "bigint", nullable: true),
                    LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerContactEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    SellerContactPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    BuyerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerContactName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PriceLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CompleteDate = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionHeaders", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionHeaders_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionHeaders_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTransactionHeaders_AppEntities_LanguageId",
                        column: x => x.LanguageId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppTransactionDetails",
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
                    ItemSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionDetails_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTransactionDetails_AppTransactionHeaders_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppTransactionHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionDetails_TransactionId",
                table: "AppTransactionDetails",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionHeaders_CurrencyId",
                table: "AppTransactionHeaders",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionHeaders_LanguageId",
                table: "AppTransactionHeaders",
                column: "LanguageId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTransactionDetails");

            migrationBuilder.DropTable(
                name: "AppTransactionHeaders");

            migrationBuilder.CreateTable(
                name: "AppTransactionsHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    BuyerContactId = table.Column<long>(type: "bigint", nullable: true),
                    BuyerId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: true),
                    LanguageId = table.Column<long>(type: "bigint", nullable: true),
                    SellerContactId = table.Column<long>(type: "bigint", nullable: true),
                    SellerId = table.Column<long>(type: "bigint", nullable: true),
                    BuyerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BuyerName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EnteredUserByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    LanguageCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    PriceLevel = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SellerCompanyName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerEMailAddress = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SellerName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerPhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionsHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppContacts_BuyerContactId",
                        column: x => x.BuyerContactId,
                        principalTable: "AppContacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppContacts_BuyerId",
                        column: x => x.BuyerId,
                        principalTable: "AppContacts",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppTransactionsHeader_AppContacts_SellerContactId",
                        column: x => x.SellerContactId,
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
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    TransactionId = table.Column<long>(type: "bigint", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(17,3)", nullable: false),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Discount = table.Column<decimal>(type: "decimal(8,3)", nullable: false),
                    GrossPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemDescription = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ItemId = table.Column<long>(type: "bigint", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    LineNo = table.Column<int>(type: "int", nullable: false),
                    NetPrice = table.Column<decimal>(type: "decimal(15,3)", nullable: false),
                    Note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Quantity = table.Column<double>(type: "float", nullable: false),
                    SSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    TransactionCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTransactionsDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTransactionsDetail_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTransactionsDetail_AppTransactionsHeader_TransactionId",
                        column: x => x.TransactionId,
                        principalTable: "AppTransactionsHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsDetail_EntityId",
                table: "AppTransactionsDetail",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsDetail_TransactionId",
                table: "AppTransactionsDetail",
                column: "TransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_BuyerContactId",
                table: "AppTransactionsHeader",
                column: "BuyerContactId");

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
                name: "IX_AppTransactionsHeader_SellerContactId",
                table: "AppTransactionsHeader",
                column: "SellerContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsHeader_SellerId",
                table: "AppTransactionsHeader",
                column: "SellerId");
        }
    }
}

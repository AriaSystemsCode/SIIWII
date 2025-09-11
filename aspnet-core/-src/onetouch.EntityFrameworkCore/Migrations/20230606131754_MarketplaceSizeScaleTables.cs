using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class MarketplaceSizeScaleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemList",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SharingLevel = table.Column<byte>(type: "tinyint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceItemList", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemList_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItems",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Variations = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StockAvailability = table.Column<long>(type: "bigint", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    SharingLevel = table.Column<byte>(type: "tinyint", nullable: false),
                    TimeStamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItems_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItems_AppMarketplaceItems_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceItems",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemSelectors",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Key = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    SelectedId = table.Column<long>(type: "bigint", nullable: false),
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
                    table.PrimaryKey("PK_AppMarketplaceItemSelectors", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppTransactionsHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    EnteredUserByRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    BuyerId = table.Column<long>(type: "bigint", nullable: true),
                    BuyerContactId = table.Column<long>(type: "bigint", nullable: true),
                    BuyerName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    SellerId = table.Column<long>(type: "bigint", nullable: true),
                    SellerContactId = table.Column<long>(type: "bigint", nullable: true),
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
                name: "AppMarketplaceItemsListDetail",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppMarketplaceItemsListId = table.Column<long>(type: "bigint", nullable: false),
                    ItemsListCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AppMarketplaceItemId = table.Column<long>(type: "bigint", nullable: false),
                    ItemCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    State = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    AppMarketplaceItemSSIN = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceItemsListDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItemList_AppMarketplaceItemsListId",
                        column: x => x.AppMarketplaceItemsListId,
                        principalTable: "AppMarketplaceItemList",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemPrices",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    AppMarketplaceItemId = table.Column<long>(type: "bigint", nullable: false),
                    AppMarketplaceItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CurrencyId = table.Column<long>(type: "bigint", nullable: true),
                    CurrencyCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppMarketplaceItemPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemPrices_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemPrices_AppMarketplaceItems_AppMarketplaceItemId",
                        column: x => x.AppMarketplaceItemId,
                        principalTable: "AppMarketplaceItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemSharing",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppMarketplaceItemId = table.Column<long>(type: "bigint", nullable: true),
                    AppMarketplaceItemListId = table.Column<long>(type: "bigint", nullable: true),
                    SharedTenantId = table.Column<long>(type: "bigint", nullable: true),
                    SharedUserId = table.Column<long>(type: "bigint", nullable: true),
                    SharedUserEMail = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceItemSharing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSharing_AbpUsers_SharedUserId",
                        column: x => x.SharedUserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSharing_AppMarketplaceItemList_AppMarketplaceItemListId",
                        column: x => x.AppMarketplaceItemListId,
                        principalTable: "AppMarketplaceItemList",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSharing_AppMarketplaceItems_AppMarketplaceItemId",
                        column: x => x.AppMarketplaceItemId,
                        principalTable: "AppMarketplaceItems",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppMarketplaceSizeScalesHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SizeScaleCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoOfDimensions = table.Column<int>(type: "int", nullable: false),
                    SizeScaleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion1Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion2Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion3Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    AppMarketplaceItemId = table.Column<long>(type: "bigint", nullable: false),
                    AppMarketplaceItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppMarketplaceSizeScalesHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceSizeScalesHeader_AppMarketplaceItems_AppMarketplaceItemId",
                        column: x => x.AppMarketplaceItemId,
                        principalTable: "AppMarketplaceItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceSizeScalesHeader_AppMarketplaceSizeScalesHeader_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceSizeScalesHeader",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceSizeScalesHeader_AppSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppSizeScalesHeader",
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

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemSizeScalesDetails",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SizeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: false),
                    SizeRatio = table.Column<int>(type: "int", nullable: false),
                    D1Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    D2Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    D3Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeId = table.Column<long>(type: "bigint", nullable: true),
                    DimensionName = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppMarketplaceItemSizeScalesDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSizeScalesDetails_AppEntities_SizeId",
                        column: x => x.SizeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppMarketplaceSizeScalesHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemPrices_AppMarketplaceItemId",
                table: "AppMarketplaceItemPrices",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemPrices_CurrencyId",
                table: "AppMarketplaceItemPrices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItems_ParentId",
                table: "AppMarketplaceItems",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSharing_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharing",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSharing_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharing",
                column: "AppMarketplaceItemListId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSharing_SharedUserId",
                table: "AppMarketplaceItemSharing",
                column: "SharedUserId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSizeScalesDetails_SizeId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSizeScalesDetails_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeScaleId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetail",
                column: "AppMarketplaceItemsListId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceSizeScalesHeader_AppMarketplaceItemId",
                table: "AppMarketplaceSizeScalesHeader",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceSizeScalesHeader_ParentId",
                table: "AppMarketplaceSizeScalesHeader",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceSizeScalesHeader",
                column: "SizeScaleId");

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceItemPrices");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemSelectors");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemSharing");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemsListDetail");

            migrationBuilder.DropTable(
                name: "AppTransactionsDetail");

            migrationBuilder.DropTable(
                name: "AppMarketplaceSizeScalesHeader");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemList");

            migrationBuilder.DropTable(
                name: "AppTransactionsHeader");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItems");
        }
    }
}

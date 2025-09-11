using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addMarketplacePrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemPrices_AppMarketplaceItemId",
                table: "AppMarketplaceItemPrices",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemPrices_CurrencyId",
                table: "AppMarketplaceItemPrices",
                column: "CurrencyId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceItemPrices");
        }
    }
}

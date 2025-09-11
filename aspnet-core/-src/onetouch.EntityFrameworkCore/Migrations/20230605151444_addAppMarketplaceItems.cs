using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addAppMarketplaceItems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "AppMarketplaceItemId",
                table: "AppItemSharing",
                type: "bigint",
                nullable: true);

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

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSharing_AppMarketplaceItemId",
                table: "AppItemSharing",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItems_ParentId",
                table: "AppMarketplaceItems",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItemSharing_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppItemSharing",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItemSharing_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppItemSharing");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItemSharing_AppMarketplaceItemId",
                table: "AppItemSharing");

            migrationBuilder.DropColumn(
                name: "AppMarketplaceItemId",
                table: "AppItemSharing");
        }
    }
}

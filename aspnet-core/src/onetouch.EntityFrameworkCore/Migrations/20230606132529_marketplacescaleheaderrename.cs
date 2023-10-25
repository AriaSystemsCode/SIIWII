using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class marketplacescaleheaderrename : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropTable(
                name: "AppMarketplaceSizeScalesHeader");

            migrationBuilder.CreateTable(
                name: "AppMarketplaceItemSizeScalesHeader",
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
                    table.PrimaryKey("PK_AppMarketplaceItemSizeScalesHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemSizeScalesHeader_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceItemSizeScalesHeader",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItems_AppMarketplaceItemId",
                        column: x => x.AppMarketplaceItemId,
                        principalTable: "AppMarketplaceItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceItemSizeScalesHeader_AppSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppSizeScalesHeader",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "AppMarketplaceItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_ParentId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "SizeScaleId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeScaleId",
                principalTable: "AppMarketplaceItemSizeScalesHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropTable(
                name: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.CreateTable(
                name: "AppMarketplaceSizeScalesHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AppMarketplaceItemId = table.Column<long>(type: "bigint", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: true),
                    AppMarketplaceItemCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Dimesion1Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion2Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion3Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoOfDimensions = table.Column<int>(type: "int", nullable: false),
                    SizeScaleCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeScaleName = table.Column<string>(type: "nvarchar(max)", nullable: true)
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

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeScaleId",
                principalTable: "AppMarketplaceSizeScalesHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

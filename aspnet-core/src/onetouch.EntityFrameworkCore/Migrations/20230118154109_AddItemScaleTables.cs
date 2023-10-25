using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddItemScaleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            

            migrationBuilder.CreateTable(
                name: "AppItemSizeScalesHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SizeScaleCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoOfDimensions = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    AppItemId = table.Column<long>(type: "bigint", nullable: false),
                    SizeScaleName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: true),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion1Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion2Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion3Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
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
                    table.PrimaryKey("PK_AppItemSizeScalesHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemSizeScalesHeader_AppItems_AppItemId",
                        column: x => x.AppItemId,
                        principalTable: "AppItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppItemSizeScalesHeader_AppSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppSizeScalesHeader",
                        principalColumn: "Id");
                });

           
            migrationBuilder.CreateTable(
                name: "AppItemSizeScalesDetails",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    SizeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: false),
                    SizeRatio = table.Column<int>(type: "int", nullable: false),
                    Position = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppItemSizeScalesDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemSizeScalesDetails_AppEntities_SizeId",
                        column: x => x.SizeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppItemSizeScalesDetails_AppItemSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppItemSizeScalesHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSizeScalesDetails_SizeId",
                table: "AppItemSizeScalesDetails",
                column: "SizeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSizeScalesDetails_SizeScaleId",
                table: "AppItemSizeScalesDetails",
                column: "SizeScaleId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSizeScalesHeader_AppItemId",
                table: "AppItemSizeScalesHeader",
                column: "AppItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSizeScalesHeader_SizeScaleId",
                table: "AppItemSizeScalesHeader",
                column: "SizeScaleId");

          
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItemPrices_AppEntities_CurrencyId",
                table: "AppItemPrices");

            migrationBuilder.DropForeignKey(
                name: "FK_AppItemPrices_AppItems_AppItemId",
                table: "AppItemPrices");

            migrationBuilder.DropTable(
                name: "AppItemSizeScalesDetails");

            migrationBuilder.DropTable(
                name: "AppSizeScalesDetail");

            migrationBuilder.DropTable(
                name: "AppItemSizeScalesHeader");

            migrationBuilder.DropTable(
                name: "AppSizeScalesHeader");
        }
    }
}

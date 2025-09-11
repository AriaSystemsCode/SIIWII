using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addSizeScaleTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppSizeScalesHeader",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    Code = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NoOfDimensions = table.Column<int>(type: "int", nullable: false),
                    IsDefault = table.Column<bool>(type: "bit", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion1Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion2Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Dimesion3Name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AppSizeScalesHeaderFkId = table.Column<long>(type: "bigint", nullable: true),
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
                    table.PrimaryKey("PK_AppSizeScalesHeader", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppSizeScalesHeader_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppSizeScalesHeader_AppSizeScalesHeader_AppSizeScalesHeaderFkId",
                        column: x => x.AppSizeScalesHeaderFkId,
                        principalTable: "AppSizeScalesHeader",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "AppSizeScalesDetail",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: true),
                    SizeScaleId = table.Column<long>(type: "bigint", nullable: false),
                    SizeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
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
                    table.PrimaryKey("PK_AppSizeScalesDetail", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppSizeScalesDetail_AppEntities_SizeId",
                        column: x => x.SizeId,
                        principalTable: "AppEntities",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppSizeScalesDetail_AppSizeScalesHeader_SizeScaleId",
                        column: x => x.SizeScaleId,
                        principalTable: "AppSizeScalesHeader",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppSizeScalesDetail_SizeId",
                table: "AppSizeScalesDetail",
                column: "SizeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppSizeScalesDetail_SizeScaleId",
                table: "AppSizeScalesDetail",
                column: "SizeScaleId");

            migrationBuilder.CreateIndex(
                name: "IX_AppSizeScalesHeader_AppSizeScalesHeaderFkId",
                table: "AppSizeScalesHeader",
                column: "AppSizeScalesHeaderFkId");

            migrationBuilder.CreateIndex(
                name: "IX_AppSizeScalesHeader_EntityId",
                table: "AppSizeScalesHeader",
                column: "EntityId");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_AppItemPrices_AppEntities_CurrencyId",
            //    table: "AppItemPrices",
            //    column: "CurrencyId",
            //    principalTable: "AppEntities",
            //    principalColumn: "Id");

            //migrationBuilder.AddForeignKey(
            //    name: "FK_AppItemPrices_AppItems_AppItemId",
            //    table: "AppItemPrices",
            //    column: "AppItemId",
            //    principalTable: "AppItems",
            //    principalColumn: "Id",
            //    onDelete: ReferentialAction.Cascade);
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
                name: "AppSizeScalesDetail");

            migrationBuilder.DropTable(
                name: "AppSizeScalesHeader");
        }
    }
}

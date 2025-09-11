using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppAppitemPriceTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppItemPrices",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    TenantId = table.Column<int>(nullable: true),
                    Code = table.Column<string>(maxLength: 50, nullable: true),
                    Price = table.Column<decimal>(nullable: false),
                    AppItemId = table.Column<long>(nullable: false),
                    AppItemCode = table.Column<string>(nullable: true),
                    CurrencyId = table.Column<long>(nullable: true),
                    CurrencyCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppItemPrices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemPrices_AppItems_AppItemId",
                        column: x => x.AppItemId,
                        principalTable: "AppItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppItemPrices_AppEntities_CurrencyId",
                        column: x => x.CurrencyId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppItemPrices_CurrencyId",
                table: "AppItemPrices",
                column: "CurrencyId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemPrices_AppItemId_Code_CurrencyCode",
                table: "AppItemPrices",
                columns: new[] { "AppItemId", "Code", "CurrencyCode" });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppItemPrices");
        }
    }
}

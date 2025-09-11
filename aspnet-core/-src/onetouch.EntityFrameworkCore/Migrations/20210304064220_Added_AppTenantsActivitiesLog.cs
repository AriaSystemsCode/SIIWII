using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_AppTenantsActivitiesLog : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppTenantsActivitiesLogs",
                columns: table => new
                {
                    Id = table.Column<int>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(nullable: true),
                    ActivityDate = table.Column<DateTime>(nullable: false),
                    Units = table.Column<int>(nullable: false),
                    UnitPrice = table.Column<decimal>(nullable: false),
                    Amount = table.Column<decimal>(nullable: false),
                    Billed = table.Column<bool>(nullable: false),
                    IsManual = table.Column<bool>(nullable: false),
                    InvoiceNumber = table.Column<string>(maxLength: 50, nullable: true),
                    InvoiceDate = table.Column<DateTime>(nullable: false),
                    SycServiceId = table.Column<int>(nullable: true),
                    SycApplicationId = table.Column<int>(nullable: true),
                    AppTransactionId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTenantsActivitiesLogs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTenantsActivitiesLogs_AppTransactions_AppTransactionId",
                        column: x => x.AppTransactionId,
                        principalTable: "AppTransactions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppTenantsActivitiesLogs_SycApplications_SycApplicationId",
                        column: x => x.SycApplicationId,
                        principalTable: "SycApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppTenantsActivitiesLogs_SycServices_SycServiceId",
                        column: x => x.SycServiceId,
                        principalTable: "SycServices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_AppTransactionId",
                table: "AppTenantsActivitiesLogs",
                column: "AppTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycApplicationId",
                table: "AppTenantsActivitiesLogs",
                column: "SycApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycServiceId",
                table: "AppTenantsActivitiesLogs",
                column: "SycServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_TenantId",
                table: "AppTenantsActivitiesLogs",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTenantsActivitiesLogs");
        }
    }
}

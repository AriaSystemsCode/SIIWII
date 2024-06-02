using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantActivityLogTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppTenantActivitiesLog",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    TenantName = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    UserId = table.Column<long>(type: "bigint", nullable: false),
                    ActivityType = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AppSubscriptionPlanHeaderId = table.Column<long>(type: "bigint", nullable: false),
                    AppSubscriptionPlanCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    ActivityDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    FeatureCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    FeatureName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Billable = table.Column<bool>(type: "bit", nullable: false),
                    Invoiced = table.Column<bool>(type: "bit", nullable: false),
                    Reference = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Qty = table.Column<long>(type: "bigint", nullable: false),
                    ConsumedQty = table.Column<long>(type: "bigint", nullable: false),
                    RemainingQty = table.Column<long>(type: "bigint", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    InvoiceDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    InvoiceNumber = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: true),
                    CreditOrUsage = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    Month = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Year = table.Column<string>(type: "nvarchar(4)", maxLength: 4, nullable: true),
                    CreditId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTenantActivitiesLog", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTenantActivitiesLog_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTenantActivitiesLog_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                        column: x => x.AppSubscriptionPlanHeaderId,
                        principalTable: "AppSubscriptionPlanHeaders",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppTenantActivitiesLog_AppTenantActivitiesLog_CreditId",
                        column: x => x.CreditId,
                        principalTable: "AppTenantActivitiesLog",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantActivitiesLog_AppSubscriptionPlanHeaderId",
                table: "AppTenantActivitiesLog",
                column: "AppSubscriptionPlanHeaderId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantActivitiesLog_CreditId",
                table: "AppTenantActivitiesLog",
                column: "CreditId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantActivitiesLog_TenantName_ActivityType_CreditOrUsage_Year_Month",
                table: "AppTenantActivitiesLog",
                columns: new[] { "TenantName", "ActivityType", "CreditOrUsage", "Year", "Month" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTenantActivitiesLog");
        }
    }
}

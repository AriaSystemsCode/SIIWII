using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSubscriptionPlansTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppTenantSubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false),
                    TenantName = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    AppSubscriptionHeaderId = table.Column<long>(type: "bigint", nullable: false),
                    SubscriptionPlanCode = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    CurrentPeriodStartDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CurrentPeriodEndDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BillingPeriod = table.Column<string>(type: "nvarchar(30)", maxLength: 30, nullable: false),
                    AllowOverAge = table.Column<bool>(type: "bit", nullable: false),
                    AppSubscriptionPlanHeaderId = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppTenantSubscriptionPlans", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppTenantSubscriptionPlans_AppEntities_Id",
                        column: x => x.Id,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                        column: x => x.AppSubscriptionPlanHeaderId,
                        principalTable: "AppSubscriptionPlanHeaders",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans",
                column: "AppSubscriptionPlanHeaderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppTenantSubscriptionPlans");
        }
    }
}

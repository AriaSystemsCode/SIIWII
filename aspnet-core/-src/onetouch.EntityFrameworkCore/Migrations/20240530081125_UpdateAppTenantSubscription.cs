using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAppTenantSubscription : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantActivitiesLog_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantActivitiesLog_AppTenantActivitiesLog_CreditId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantActivitiesLog_AppSubscriptionPlanHeaderId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantActivitiesLog_CreditId",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantActivitiesLog_TenantName_ActivityType_CreditOrUsage_Year_Month",
                table: "AppTenantActivitiesLog");

            migrationBuilder.DropColumn(
                name: "AppSubscriptionHeaderId",
                table: "AppTenantSubscriptionPlans");

            migrationBuilder.AlterColumn<string>(
                name: "BillingPeriod",
                table: "AppTenantSubscriptionPlans",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(30)",
                oldMaxLength: 30);

            migrationBuilder.AlterColumn<long>(
                name: "AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "InvoiceDate",
                table: "AppTenantActivitiesLog",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");

            migrationBuilder.AlterColumn<long>(
                name: "CreditId",
                table: "AppTenantActivitiesLog",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans",
                column: "AppSubscriptionPlanHeaderId",
                principalTable: "AppSubscriptionPlanHeaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans");

            migrationBuilder.AlterColumn<string>(
                name: "BillingPeriod",
                table: "AppTenantSubscriptionPlans",
                type: "nvarchar(30)",
                maxLength: 30,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<long>(
                name: "AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans",
                type: "bigint",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddColumn<long>(
                name: "AppSubscriptionHeaderId",
                table: "AppTenantSubscriptionPlans",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AlterColumn<DateTime>(
                name: "InvoiceDate",
                table: "AppTenantActivitiesLog",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified),
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "CreditId",
                table: "AppTenantActivitiesLog",
                type: "bigint",
                nullable: false,
                defaultValue: 0L,
                oldClrType: typeof(long),
                oldType: "bigint",
                oldNullable: true);

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

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantActivitiesLog_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantActivitiesLog",
                column: "AppSubscriptionPlanHeaderId",
                principalTable: "AppSubscriptionPlanHeaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantActivitiesLog_AppTenantActivitiesLog_CreditId",
                table: "AppTenantActivitiesLog",
                column: "CreditId",
                principalTable: "AppTenantActivitiesLog",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantSubscriptionPlans_AppSubscriptionPlanHeaders_AppSubscriptionPlanHeaderId",
                table: "AppTenantSubscriptionPlans",
                column: "AppSubscriptionPlanHeaderId",
                principalTable: "AppSubscriptionPlanHeaders",
                principalColumn: "Id");
        }
    }
}

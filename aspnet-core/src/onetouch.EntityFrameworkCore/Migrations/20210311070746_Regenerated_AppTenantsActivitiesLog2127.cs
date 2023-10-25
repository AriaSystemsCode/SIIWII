using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_AppTenantsActivitiesLog2127 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_AppTransactions_AppTransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycApplications_SycApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_SycPlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_AppTransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_SycApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_SycPlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "AppTransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "SycApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "SycPlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.AddColumn<int>(
                name: "ApplicationId",
                table: "AppTenantsActivitiesLogs",
                nullable: true);
            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "AppTenantsActivitiesLogs",
                nullable: true);
            

            migrationBuilder.AddColumn<int>(
                name: "PlanId",
                table: "AppTenantsActivitiesLogs",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TransactionId",
                table: "AppTenantsActivitiesLogs",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_ApplicationId",
                table: "AppTenantsActivitiesLogs",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_PlanId",
                table: "AppTenantsActivitiesLogs",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_TransactionId",
                table: "AppTenantsActivitiesLogs",
                column: "TransactionId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycApplications_ApplicationId",
                table: "AppTenantsActivitiesLogs",
                column: "ApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_PlanId",
                table: "AppTenantsActivitiesLogs",
                column: "PlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_AppTransactions_TransactionId",
                table: "AppTenantsActivitiesLogs",
                column: "TransactionId",
                principalTable: "AppTransactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycApplications_ApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_PlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_AppTransactions_TransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_ApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_PlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_TransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "ApplicationId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "TransactionId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.AddColumn<int>(
                name: "AppTransactionId",
                table: "AppTenantsActivitiesLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycApplicationId",
                table: "AppTenantsActivitiesLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycPlanId",
                table: "AppTenantsActivitiesLogs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_AppTransactionId",
                table: "AppTenantsActivitiesLogs",
                column: "AppTransactionId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycApplicationId",
                table: "AppTenantsActivitiesLogs",
                column: "SycApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycPlanId",
                table: "AppTenantsActivitiesLogs",
                column: "SycPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_AppTransactions_AppTransactionId",
                table: "AppTenantsActivitiesLogs",
                column: "AppTransactionId",
                principalTable: "AppTransactions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycApplications_SycApplicationId",
                table: "AppTenantsActivitiesLogs",
                column: "SycApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_SycPlanId",
                table: "AppTenantsActivitiesLogs",
                column: "SycPlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

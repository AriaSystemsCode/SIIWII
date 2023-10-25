using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_AppTenantsActivitiesLog4554 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SycPlanId",
                table: "AppTenantsActivitiesLogs",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycPlanId",
                table: "AppTenantsActivitiesLogs",
                column: "SycPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_SycPlanId",
                table: "AppTenantsActivitiesLogs",
                column: "SycPlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycPlans_SycPlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_SycPlanId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "SycPlanId",
                table: "AppTenantsActivitiesLogs");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_AppTenantPlan9802 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantPlans_SycPlans_SycPlanId",
                table: "AppTenantPlans");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantPlans_SycPlanId",
                table: "AppTenantPlans");

            migrationBuilder.DropColumn(
                name: "SycPlanId",
                table: "AppTenantPlans");

            migrationBuilder.AddColumn<int>(
                name: "PlanId",
                table: "AppTenantPlans",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantPlans_PlanId",
                table: "AppTenantPlans",
                column: "PlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantPlans_SycPlans_PlanId",
                table: "AppTenantPlans",
                column: "PlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantPlans_SycPlans_PlanId",
                table: "AppTenantPlans");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantPlans_PlanId",
                table: "AppTenantPlans");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "AppTenantPlans");

            migrationBuilder.AddColumn<int>(
                name: "SycPlanId",
                table: "AppTenantPlans",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantPlans_SycPlanId",
                table: "AppTenantPlans",
                column: "SycPlanId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantPlans_SycPlans_SycPlanId",
                table: "AppTenantPlans",
                column: "SycPlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

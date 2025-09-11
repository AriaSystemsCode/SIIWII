using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycPlanService7541 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycApplications_SycApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycPlans_SycPlanId",
                table: "SycPlanServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycServices_SycServiceId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_SycApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_SycPlanId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_SycServiceId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "SycApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "SycPlanId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "SycServiceId",
                table: "SycPlanServices");

            migrationBuilder.AddColumn<int>(
                name: "ApplicationId",
                table: "SycPlanServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "PlanId",
                table: "SycPlanServices",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ServiceId",
                table: "SycPlanServices",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_ApplicationId",
                table: "SycPlanServices",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_PlanId",
                table: "SycPlanServices",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_ServiceId",
                table: "SycPlanServices",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycApplications_ApplicationId",
                table: "SycPlanServices",
                column: "ApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycPlans_PlanId",
                table: "SycPlanServices",
                column: "PlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycServices_ServiceId",
                table: "SycPlanServices",
                column: "ServiceId",
                principalTable: "SycServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycApplications_ApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycPlans_PlanId",
                table: "SycPlanServices");

            migrationBuilder.DropForeignKey(
                name: "FK_SycPlanServices_SycServices_ServiceId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_ApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_PlanId",
                table: "SycPlanServices");

            migrationBuilder.DropIndex(
                name: "IX_SycPlanServices_ServiceId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "ApplicationId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "PlanId",
                table: "SycPlanServices");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "SycPlanServices");

            migrationBuilder.AddColumn<int>(
                name: "SycApplicationId",
                table: "SycPlanServices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycPlanId",
                table: "SycPlanServices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "SycServiceId",
                table: "SycPlanServices",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycApplicationId",
                table: "SycPlanServices",
                column: "SycApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycPlanId",
                table: "SycPlanServices",
                column: "SycPlanId");

            migrationBuilder.CreateIndex(
                name: "IX_SycPlanServices_SycServiceId",
                table: "SycPlanServices",
                column: "SycServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycApplications_SycApplicationId",
                table: "SycPlanServices",
                column: "SycApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycPlans_SycPlanId",
                table: "SycPlanServices",
                column: "SycPlanId",
                principalTable: "SycPlans",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlanServices_SycServices_SycServiceId",
                table: "SycPlanServices",
                column: "SycServiceId",
                principalTable: "SycServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycPlan8476 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycPlans_SycApplications_SycApplicationId",
                table: "SycPlans");

            migrationBuilder.DropIndex(
                name: "IX_SycPlans_SycApplicationId",
                table: "SycPlans");

            migrationBuilder.DropColumn(
                name: "SycApplicationId",
                table: "SycPlans");

            migrationBuilder.AddColumn<int>(
                name: "ApplicationId",
                table: "SycPlans",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycPlans_ApplicationId",
                table: "SycPlans",
                column: "ApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlans_SycApplications_ApplicationId",
                table: "SycPlans",
                column: "ApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycPlans_SycApplications_ApplicationId",
                table: "SycPlans");

            migrationBuilder.DropIndex(
                name: "IX_SycPlans_ApplicationId",
                table: "SycPlans");

            migrationBuilder.DropColumn(
                name: "ApplicationId",
                table: "SycPlans");

            migrationBuilder.AddColumn<int>(
                name: "SycApplicationId",
                table: "SycPlans",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycPlans_SycApplicationId",
                table: "SycPlans",
                column: "SycApplicationId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycPlans_SycApplications_SycApplicationId",
                table: "SycPlans",
                column: "SycApplicationId",
                principalTable: "SycApplications",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

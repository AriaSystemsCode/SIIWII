using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_AppTenantsActivitiesLog4929 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycServices_SycServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_SycServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "SycServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.AddColumn<int>(
                name: "ServiceId",
                table: "AppTenantsActivitiesLogs",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_ServiceId",
                table: "AppTenantsActivitiesLogs",
                column: "ServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycServices_ServiceId",
                table: "AppTenantsActivitiesLogs",
                column: "ServiceId",
                principalTable: "SycServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycServices_ServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropIndex(
                name: "IX_AppTenantsActivitiesLogs_ServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.DropColumn(
                name: "ServiceId",
                table: "AppTenantsActivitiesLogs");

            migrationBuilder.AddColumn<int>(
                name: "SycServiceId",
                table: "AppTenantsActivitiesLogs",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTenantsActivitiesLogs_SycServiceId",
                table: "AppTenantsActivitiesLogs",
                column: "SycServiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTenantsActivitiesLogs_SycServices_SycServiceId",
                table: "AppTenantsActivitiesLogs",
                column: "SycServiceId",
                principalTable: "SycServices",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

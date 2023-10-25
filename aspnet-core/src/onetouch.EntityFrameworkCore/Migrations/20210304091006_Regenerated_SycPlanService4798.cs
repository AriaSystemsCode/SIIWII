using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycPlanService4798 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinmumUnits",
                table: "SycPlanServices");

            migrationBuilder.AddColumn<int>(
                name: "MinimumUnits",
                table: "SycPlanServices",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinimumUnits",
                table: "SycPlanServices");

            migrationBuilder.AddColumn<int>(
                name: "MinmumUnits",
                table: "SycPlanServices",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_codes_SycEntityObjectClassification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectClassifications",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectClassifications",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectClassifications");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectClassifications");
        }
    }
}

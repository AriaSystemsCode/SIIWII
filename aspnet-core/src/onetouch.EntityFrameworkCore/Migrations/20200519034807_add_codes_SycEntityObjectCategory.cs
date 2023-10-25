using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_codes_SycEntityObjectCategory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectCategories",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectCategories",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectCategories");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectCategories");
        }
    }
}

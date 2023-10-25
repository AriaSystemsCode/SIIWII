using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_AppMessages : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "AppMessages");

            migrationBuilder.AddColumn<string>(
                name: "EntityIdCode",
                table: "AppMessages",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "AppMessages",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EntityIdCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "AppMessages");

            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

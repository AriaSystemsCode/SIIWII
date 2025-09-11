using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_codes_SycEntityObjectType : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SydObjectIdCode",
                table: "SycEntityObjectTypes",
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "SydObjectIdCode",
                table: "SycEntityObjectTypes");
        }
    }
}

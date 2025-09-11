using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AlterAppEntityExtraData_EntityObjectTypeName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EntityObjectTypeName",
                table: "AppEntityExtraData",
                maxLength: 250,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EntityObjectTypeName",
                table: "AppEntityExtraData");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class alter_table_appItems_add_MinimumPriceAndMaximumPrice : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "MaximumPrice",
                table: "AppItems",
                type: "decimal(15, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumPrice",
                table: "AppItems",
                type: "decimal(15, 3)",
                nullable: false,
                defaultValue: 0m);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaximumPrice",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "MinimumPrice",
                table: "AppItems");
        }
    }
}

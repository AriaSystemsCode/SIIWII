using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddPositionFieldstoAppItemSizes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Position",
                table: "AppItemSizeScalesDetails",
                newName: "D3Position");

            migrationBuilder.AddColumn<string>(
                name: "D1Position",
                table: "AppItemSizeScalesDetails",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "D2Position",
                table: "AppItemSizeScalesDetails",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "D1Position",
                table: "AppItemSizeScalesDetails");

            migrationBuilder.DropColumn(
                name: "D2Position",
                table: "AppItemSizeScalesDetails");

            migrationBuilder.RenameColumn(
                name: "D3Position",
                table: "AppItemSizeScalesDetails",
                newName: "Position");
        }
    }
}

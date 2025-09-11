using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddSSINIDToSydobjectTable3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SSINIdentifierCode",
                table: "SydObjects",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SycDefaultIdentifierCode",
                table: "SydObjects",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SycDefaultIdentifierId",
                table: "SydObjects",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SSINIdentifierCode",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SycDefaultIdentifierCode",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SycDefaultIdentifierId",
                table: "SydObjects");
        }
    }
}

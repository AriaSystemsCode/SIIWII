using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddentityInfotoEntitySharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "EntityCode",
                table: "AppEntitySharings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectTypeCode",
                table: "AppEntitySharings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SharedTenantName",
                table: "AppEntitySharings",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SharedUserName",
                table: "AppEntitySharings",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EntityCode",
                table: "AppEntitySharings");

            migrationBuilder.DropColumn(
                name: "EntityObjectTypeCode",
                table: "AppEntitySharings");

            migrationBuilder.DropColumn(
                name: "SharedTenantName",
                table: "AppEntitySharings");

            migrationBuilder.DropColumn(
                name: "SharedUserName",
                table: "AppEntitySharings");
        }
    }
}

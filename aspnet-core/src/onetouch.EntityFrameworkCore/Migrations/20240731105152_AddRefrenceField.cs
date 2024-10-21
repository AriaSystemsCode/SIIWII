using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddRefrenceField : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Reference",
                table: "AppTransactionHeaders",
                type: "nvarchar(50)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Reference",
                table: "AppMarketplaceTransactionHeaders",
                type: "nvarchar(50)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Reference",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "Reference",
                table: "AppMarketplaceTransactionHeaders");
        }
    }
}

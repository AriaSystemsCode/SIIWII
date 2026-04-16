using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addSellerSSINToItemPrices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SellerSSIN",
                table: "AppItemPrices",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SellerSSIN",
                table: "AppItemPrices");
        }
    }
}

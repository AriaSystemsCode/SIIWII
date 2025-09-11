using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddTotalsFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BuyerStore",
                table: "AppTransactionHeaders",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "TotalAmount",
                table: "AppTransactionHeaders",
                type: "float",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<long>(
                name: "TotalQuantity",
                table: "AppTransactionHeaders",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BuyerStore",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "TotalAmount",
                table: "AppTransactionHeaders");

            migrationBuilder.DropColumn(
                name: "TotalQuantity",
                table: "AppTransactionHeaders");
        }
    }
}

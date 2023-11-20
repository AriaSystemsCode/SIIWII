using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddNoOfParentIdToTransactionDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ParentId",
                table: "AppTransactionDetails",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionDetails_ParentId",
                table: "AppTransactionDetails",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionDetails_AppTransactionDetails_ParentId",
                table: "AppTransactionDetails",
                column: "ParentId",
                principalTable: "AppTransactionDetails",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionDetails_AppTransactionDetails_ParentId",
                table: "AppTransactionDetails");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionDetails_ParentId",
                table: "AppTransactionDetails");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "AppTransactionDetails");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addEntityfieldToTransactionDetail : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "EntityId",
                table: "AppTransactionsDetail",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_AppTransactionsDetail_EntityId",
                table: "AppTransactionsDetail",
                column: "EntityId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppTransactionsDetail_AppEntities_EntityId",
                table: "AppTransactionsDetail",
                column: "EntityId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppTransactionsDetail_AppEntities_EntityId",
                table: "AppTransactionsDetail");

            migrationBuilder.DropIndex(
                name: "IX_AppTransactionsDetail_EntityId",
                table: "AppTransactionsDetail");

            migrationBuilder.DropColumn(
                name: "EntityId",
                table: "AppTransactionsDetail");
        }
    }
}

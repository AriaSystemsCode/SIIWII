using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addIdentifierIdtoAppItem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SycIdentifierId",
                table: "AppItems",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_SycIdentifierId",
                table: "AppItems",
                column: "SycIdentifierId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_SycIdentifierDefinitions_SycIdentifierId",
                table: "AppItems",
                column: "SycIdentifierId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_SycIdentifierDefinitions_SycIdentifierId",
                table: "AppItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_SycIdentifierId",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "SycIdentifierId",
                table: "AppItems");
        }
    }
}

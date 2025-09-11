using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddEntityReactionTest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppEntityInteractions_EntityId",
                table: "AppEntityInteractions");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityInteractions_EntityId",
                table: "AppEntityInteractions",
                column: "EntityId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_AppEntityInteractions_EntityId",
                table: "AppEntityInteractions");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityInteractions_EntityId",
                table: "AppEntityInteractions",
                column: "EntityId");
        }
    }
}

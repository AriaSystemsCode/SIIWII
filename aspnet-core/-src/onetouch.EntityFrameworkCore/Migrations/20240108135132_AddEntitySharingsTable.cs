using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddEntitySharingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntitySharings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    SharedTenantId = table.Column<long>(type: "bigint", nullable: true),
                    SharedUserId = table.Column<long>(type: "bigint", nullable: true),
                    SharedUserEMail = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntitySharings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntitySharings_AbpUsers_SharedUserId",
                        column: x => x.SharedUserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppEntitySharings_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitySharings_EntityId",
                table: "AppEntitySharings",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitySharings_SharedUserId",
                table: "AppEntitySharings",
                column: "SharedUserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntitySharings");
        }
    }
}

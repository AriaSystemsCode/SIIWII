using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addratingtable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntityRatings",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    UserSSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    EntitySSIN = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: false),
                    EntityObjectTypeId = table.Column<long>(type: "bigint", nullable: false),
                    EntityObjectTypeCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObjectCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ObjectId = table.Column<long>(type: "bigint", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityRatings", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityRatings_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityRatings_SycEntityObjectTypes_EntityObjectTypeId",
                        column: x => x.EntityObjectTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntityRatings_SydObjects_ObjectId",
                        column: x => x.ObjectId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRatings_EntityId",
                table: "AppEntityRatings",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRatings_EntityObjectTypeId",
                table: "AppEntityRatings",
                column: "EntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityRatings_ObjectId",
                table: "AppEntityRatings",
                column: "ObjectId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityRatings");
        }
    }
}

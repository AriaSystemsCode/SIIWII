using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_AppEntityCategory_And_AppEntityClassification : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntityCategories",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(nullable: false),
                    EntityIdCode = table.Column<string>(nullable: true),
                    EntityObjectCategoryId = table.Column<int>(nullable: false),
                    EntityObjectCategoryIdCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityCategories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityCategories_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntityCategories_SycEntityObjectCategories_EntityObjectCategoryId",
                        column: x => x.EntityObjectCategoryId,
                        principalTable: "SycEntityObjectCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityClassifications",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(nullable: false),
                    EntityIdCode = table.Column<string>(nullable: true),
                    EntityObjectClassificationId = table.Column<int>(nullable: false),
                    EntityObjectClassificationIdCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityClassifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityClassifications_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntityClassifications_SycEntityObjectClassifications_EntityObjectClassificationId",
                        column: x => x.EntityObjectClassificationId,
                        principalTable: "SycEntityObjectClassifications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityCategories_EntityId",
                table: "AppEntityCategories",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityCategories_EntityObjectCategoryId",
                table: "AppEntityCategories",
                column: "EntityObjectCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityClassifications_EntityId",
                table: "AppEntityClassifications",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityClassifications_EntityObjectClassificationId",
                table: "AppEntityClassifications",
                column: "EntityObjectClassificationId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityCategories");

            migrationBuilder.DropTable(
                name: "AppEntityClassifications");
        }
    }
}

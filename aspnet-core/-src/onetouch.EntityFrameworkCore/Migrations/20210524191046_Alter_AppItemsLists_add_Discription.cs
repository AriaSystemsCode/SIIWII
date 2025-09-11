using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Alter_AppItemsLists_add_Discription : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AppItemsLists",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(250)",
                oldMaxLength: 250,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Description",
                table: "AppItemsLists",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AppEntitiesRelationships",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(nullable: false),
                    EntityCode = table.Column<string>(maxLength: 50, nullable: true),
                    EntityTypeCode = table.Column<string>(maxLength: 50, nullable: true),
                    EntityTable = table.Column<string>(maxLength: 150, nullable: true),
                    TenantId = table.Column<int>(nullable: true),
                    ContactId = table.Column<long>(nullable: true),
                    RelatedEntityId = table.Column<long>(nullable: false),
                    RelatedEntityCode = table.Column<string>(maxLength: 50, nullable: true),
                    RelatedEntityTypeCode = table.Column<string>(maxLength: 50, nullable: true),
                    RelatedEntityTable = table.Column<string>(maxLength: 150, nullable: true),
                    RelatedTenantId = table.Column<int>(nullable: true),
                    RelatedContactId = table.Column<long>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntitiesRelationships", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntitiesRelationships_AppContacts_ContactId",
                        column: x => x.ContactId,
                        principalTable: "AppContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntitiesRelationships_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntitiesRelationships_AppContacts_RelatedContactId",
                        column: x => x.RelatedContactId,
                        principalTable: "AppContacts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntitiesRelationships_AppEntities_RelatedEntityId",
                        column: x => x.RelatedEntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitiesRelationships_ContactId",
                table: "AppEntitiesRelationships",
                column: "ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitiesRelationships_EntityId",
                table: "AppEntitiesRelationships",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitiesRelationships_RelatedContactId",
                table: "AppEntitiesRelationships",
                column: "RelatedContactId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntitiesRelationships_RelatedEntityId",
                table: "AppEntitiesRelationships",
                column: "RelatedEntityId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntitiesRelationships");

            migrationBuilder.DropColumn(
                name: "Description",
                table: "AppItemsLists");

            migrationBuilder.AlterColumn<string>(
                name: "Name",
                table: "AppItemsLists",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true,
                oldClrType: typeof(string),
                oldNullable: true);
        }
    }
}

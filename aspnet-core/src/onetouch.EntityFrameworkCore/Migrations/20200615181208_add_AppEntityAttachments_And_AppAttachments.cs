using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_AppEntityAttachments_And_AppAttachments : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppAttachments",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(nullable: true),
                    Code = table.Column<string>(nullable: true),
                    Name = table.Column<string>(nullable: true),
                    Attachment = table.Column<string>(nullable: true),
                    Attributes = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppAttachments", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityAttachments",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AttachmentPath = table.Column<string>(nullable: true),
                    OriginalName = table.Column<string>(nullable: true),
                    EntityId = table.Column<long>(nullable: false),
                    EntityIdCode = table.Column<string>(nullable: true),
                    AttachmentId = table.Column<long>(nullable: false),
                    AttachmentIdCode = table.Column<string>(nullable: true),
                    AttachmentCategoryId = table.Column<long>(nullable: false),
                    AttachmentCategoryIdCode = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityAttachments_SycAttachmentCategories_AttachmentCategoryId",
                        column: x => x.AttachmentCategoryId,
                        principalTable: "SycAttachmentCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityAttachments_AppAttachments_AttachmentId",
                        column: x => x.AttachmentId,
                        principalTable: "AppAttachments",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityAttachments_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAttachments_AttachmentCategoryId",
                table: "AppEntityAttachments",
                column: "AttachmentCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAttachments_AttachmentId",
                table: "AppEntityAttachments",
                column: "AttachmentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityAttachments_EntityId",
                table: "AppEntityAttachments",
                column: "EntityId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityAttachments");

            migrationBuilder.DropTable(
                name: "AppAttachments");
        }
    }
}

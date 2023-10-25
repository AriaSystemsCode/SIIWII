using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class add_SycAttachmentCategories_EntityObjectTypeId : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "EntityObjectTypeId",
                table: "SycAttachmentCategories",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycAttachmentCategories_EntityObjectTypeId",
                table: "SycAttachmentCategories",
                column: "EntityObjectTypeId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId",
                table: "SycAttachmentCategories",
                column: "EntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId",
                table: "SycAttachmentCategories");

            migrationBuilder.DropIndex(
                name: "IX_SycAttachmentCategories_EntityObjectTypeId",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "EntityObjectTypeId",
                table: "SycAttachmentCategories");
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycAttachmentCategory1292 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "ParentId",
                table: "SycAttachmentCategories",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentIdCode",
                table: "SycAttachmentCategories",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycAttachmentCategories_ParentId",
                table: "SycAttachmentCategories",
                column: "ParentId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycAttachmentCategories_SycAttachmentCategories_ParentId",
                table: "SycAttachmentCategories",
                column: "ParentId",
                principalTable: "SycAttachmentCategories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycAttachmentCategories_SycAttachmentCategories_ParentId",
                table: "SycAttachmentCategories");

            migrationBuilder.DropIndex(
                name: "IX_SycAttachmentCategories_ParentId",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "ParentId",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "ParentIdCode",
                table: "SycAttachmentCategories");
        }
    }
}

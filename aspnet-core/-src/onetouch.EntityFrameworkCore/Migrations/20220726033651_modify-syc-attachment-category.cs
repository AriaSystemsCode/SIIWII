using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class modifysycattachmentcategory : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AspectRatio",
                table: "SycAttachmentCategories",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "MaxFileSize",
                table: "SycAttachmentCategories",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Message",
                table: "SycAttachmentCategories",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "SycAttachmentCategories",
                nullable: false,
                defaultValue: 0);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AspectRatio",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "MaxFileSize",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "Message",
                table: "SycAttachmentCategories");

            migrationBuilder.DropColumn(
                name: "Type",
                table: "SycAttachmentCategories");
        }
    }
}

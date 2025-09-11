using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class remove_AppEntityAttachments_AttachmentPath_And_OriginalName : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AttachmentPath",
                table: "AppEntityAttachments");

            migrationBuilder.DropColumn(
                name: "OriginalName",
                table: "AppEntityAttachments");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "AttachmentPath",
                table: "AppEntityAttachments",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "OriginalName",
                table: "AppEntityAttachments",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

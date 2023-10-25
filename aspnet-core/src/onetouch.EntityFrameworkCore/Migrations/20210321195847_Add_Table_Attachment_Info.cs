using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_Table_Attachment_Info : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AttachmentInfo",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(nullable: true),
                    RefID = table.Column<long>(nullable: true),
                    AttachDate = table.Column<DateTime>(nullable: true),
                    AttachedByContactID = table.Column<long>(nullable: true),
                    AttachedByResourceID = table.Column<long>(nullable: true),
                    ContentType = table.Column<string>(nullable: true),
                    CreatorType = table.Column<int>(nullable: true),
                    FileSize = table.Column<long>(nullable: true),
                    FullPath = table.Column<string>(nullable: true),
                    ImpersonatorCreatorResourceID = table.Column<int>(nullable: true),
                    OpportunityID = table.Column<long>(nullable: true),
                    ParentID = table.Column<long>(nullable: true),
                    ParentType = table.Column<int>(nullable: true),
                    Publish = table.Column<int>(nullable: true),
                    Title = table.Column<string>(nullable: true),
                    Type = table.Column<string>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttachmentInfo", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttachmentInfo_TenantId",
                table: "AttachmentInfo",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttachmentInfo");
        }
    }
}

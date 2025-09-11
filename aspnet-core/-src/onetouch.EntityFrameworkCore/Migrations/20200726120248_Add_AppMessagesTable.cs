using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_AppMessagesTable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            
            migrationBuilder.CreateTable(
                name: "AppMessages",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CreationTime = table.Column<DateTime>(nullable: false),
                    CreatorUserId = table.Column<long>(nullable: true),
                    LastModificationTime = table.Column<DateTime>(nullable: true),
                    LastModifierUserId = table.Column<long>(nullable: true),
                    IsDeleted = table.Column<bool>(nullable: false),
                    DeleterUserId = table.Column<long>(nullable: true),
                    DeletionTime = table.Column<DateTime>(nullable: true),
                    TenantId = table.Column<int>(nullable: true),
                    Sender = table.Column<int>(nullable: true),
                    To = table.Column<string>(nullable: true),
                    CC = table.Column<string>(nullable: true),
                    BCC = table.Column<string>(nullable: true),
                    Subject = table.Column<string>(nullable: true),
                    Body = table.Column<string>(nullable: true),
                    SendDate = table.Column<DateTime>(nullable: false),
                    ReceiveDate = table.Column<DateTime>(nullable: false),
                    EntityId = table.Column<int>(nullable: true),
                    EntityCode = table.Column<string>(nullable: true),
                    ParentId = table.Column<long>(nullable: true),
                    ParentCode = table.Column<string>(nullable: true),
                    ThreadId = table.Column<int>(nullable: true),
                    ContactId = table.Column<int>(nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMessages", x => x.Id);
                });
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMessages");

        }
    }
}

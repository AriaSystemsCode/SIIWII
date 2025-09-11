using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Added_AppEntity : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntities",
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
                    Name = table.Column<string>(nullable: false),
                    Code = table.Column<string>(nullable: false),
                    Description = table.Column<string>(nullable: true),
                    ExtraData = table.Column<string>(nullable: true),
                    SycEntityObjectTypeId = table.Column<int>(nullable: false),
                    SycEntityObjectStatusId = table.Column<int>(nullable: true),
                    SydObjectId = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntities_SycEntityObjectStatuses_SycEntityObjectStatusId",
                        column: x => x.SycEntityObjectStatusId,
                        principalTable: "SycEntityObjectStatuses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppEntities_SycEntityObjectTypes_SycEntityObjectTypeId",
                        column: x => x.SycEntityObjectTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntities_SydObjects_SydObjectId",
                        column: x => x.SydObjectId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SycEntityObjectStatusId",
                table: "AppEntities",
                column: "SycEntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SycEntityObjectTypeId",
                table: "AppEntities",
                column: "SycEntityObjectTypeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_SydObjectId",
                table: "AppEntities",
                column: "SydObjectId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntities_TenantId",
                table: "AppEntities",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntities");
        }
    }
}

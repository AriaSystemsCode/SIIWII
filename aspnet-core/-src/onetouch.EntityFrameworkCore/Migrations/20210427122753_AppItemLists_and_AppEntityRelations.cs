using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppItemLists_and_AppEntityRelations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppItemsLists",
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
                    TenantId = table.Column<int>(nullable: false),
                    Code = table.Column<string>(maxLength: 50, nullable: false),
                    Name = table.Column<string>(maxLength: 250, nullable: true),
                    SharingLevel = table.Column<byte>(nullable: false),
                    EntityId = table.Column<long>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppItemsLists", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemsLists_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppItemsListDetails",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemsListId = table.Column<long>(nullable: false),
                    ItemsListCode = table.Column<string>(maxLength: 50, nullable: true),
                    ItemId = table.Column<long>(nullable: false),
                    ItemCode = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppItemsListDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemsListDetails_AppItems_ItemId",
                        column: x => x.ItemId,
                        principalTable: "AppItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppItemsListDetails_AppItemsLists_ItemsListId",
                        column: x => x.ItemsListId,
                        principalTable: "AppItemsLists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppItemsListDetails_ItemId",
                table: "AppItemsListDetails",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemsListDetails_ItemsListId",
                table: "AppItemsListDetails",
                column: "ItemsListId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemsLists_EntityId",
                table: "AppItemsLists",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemsLists_TenantId",
                table: "AppItemsLists",
                column: "TenantId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppItemsListDetails");

            migrationBuilder.DropTable(
                name: "AppItemsLists");
        }
    }
}

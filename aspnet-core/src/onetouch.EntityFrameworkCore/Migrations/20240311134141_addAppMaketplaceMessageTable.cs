using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class addAppMaketplaceMessageTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppMarketplaceMessages",
                columns: table => new
                {
                    Id = table.Column<long>(type: "bigint", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SenderId = table.Column<long>(type: "bigint", nullable: false),
                    Subject = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Body = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BodyFormat = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SendDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    EntityId = table.Column<long>(type: "bigint", nullable: false),
                    EntityCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    ParentId = table.Column<long>(type: "bigint", nullable: true),
                    ThreadId = table.Column<long>(type: "bigint", nullable: true),
                    OriginalMessageId = table.Column<long>(type: "bigint", nullable: true),
                    CreationTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatorUserId = table.Column<long>(type: "bigint", nullable: true),
                    LastModificationTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    LastModifierUserId = table.Column<long>(type: "bigint", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false),
                    DeleterUserId = table.Column<long>(type: "bigint", nullable: true),
                    DeletionTime = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppMarketplaceMessages", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceMessages_AbpUsers_SenderId",
                        column: x => x.SenderId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceMessages_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppMarketplaceMessages_AppMarketplaceMessages_ParentId",
                        column: x => x.ParentId,
                        principalTable: "AppMarketplaceMessages",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AppMarketplaceMessages_AppMarketplaceMessages_ThreadId",
                        column: x => x.ThreadId,
                        principalTable: "AppMarketplaceMessages",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceMessages_EntityId",
                table: "AppMarketplaceMessages",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceMessages_ParentId",
                table: "AppMarketplaceMessages",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceMessages_SenderId",
                table: "AppMarketplaceMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMarketplaceMessages_ThreadId",
                table: "AppMarketplaceMessages",
                column: "ThreadId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppMarketplaceMessages");
        }
    }
}

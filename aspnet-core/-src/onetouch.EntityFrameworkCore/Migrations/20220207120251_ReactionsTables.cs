using System;
using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class ReactionsTables : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AppEntityReactionsCount",
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
                    EntityId = table.Column<long>(nullable: false),
                    ReactionsCount = table.Column<long>(nullable: false),
                    EntityCommentsCount = table.Column<long>(nullable: false),
                    ViewersCount = table.Column<long>(nullable: false),
                    LikeCount = table.Column<int>(nullable: false),
                    CelebrateCount = table.Column<int>(nullable: false),
                    LoverCount = table.Column<int>(nullable: false),
                    InsightfulCount = table.Column<int>(nullable: false),
                    CuriousCount = table.Column<int>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityReactionsCount", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityReactionsCount_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AppEntityUserReactions",
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
                    EntityId = table.Column<long>(nullable: false),
                    UserId = table.Column<long>(nullable: false),
                    ReactionSelected = table.Column<int>(nullable: false),
                    ActionTime = table.Column<DateTime>(nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityUserReactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityUserReactions_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityUserReactions_AbpUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityReactionsCount_EntityId",
                table: "AppEntityReactionsCount",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityUserReactions_EntityId",
                table: "AppEntityUserReactions",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityUserReactions_UserId",
                table: "AppEntityUserReactions",
                column: "UserId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityReactionsCount");

            migrationBuilder.DropTable(
                name: "AppEntityUserReactions");
        }
    }
}

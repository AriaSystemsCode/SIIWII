using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppItemSharing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<byte>(
                name: "ItemType",
                table: "AppItems",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.AddColumn<long>(
                name: "ListingItemId",
                table: "AppItems",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "PublishedListingItemId",
                table: "AppItems",
                nullable: true);

            migrationBuilder.AddColumn<byte>(
                name: "SharingLevel",
                table: "AppItems",
                nullable: false,
                defaultValue: (byte)0);

            migrationBuilder.CreateTable(
                name: "AppItemSharing",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ItemId = table.Column<long>(nullable: true),
                    ItemListId = table.Column<long>(nullable: true),
                    SharedTenantId = table.Column<long>(nullable: true),
                    SharedUserId = table.Column<long>(nullable: true),
                    SharedUserEMail = table.Column<string>(maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppItemSharing", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppItemSharing_AppItems_ItemId",
                        column: x => x.ItemId,
                        principalTable: "AppItems",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AppItemSharing_AbpUsers_SharedUserId",
                        column: x => x.SharedUserId,
                        principalTable: "AbpUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_ItemType",
                table: "AppItems",
                column: "ItemType");

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_ListingItemId",
                table: "AppItems",
                column: "ListingItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_PublishedListingItemId",
                table: "AppItems",
                column: "PublishedListingItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItems_SharingLevel",
                table: "AppItems",
                column: "SharingLevel");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSharing_ItemId",
                table: "AppItemSharing",
                column: "ItemId");

            migrationBuilder.CreateIndex(
                name: "IX_AppItemSharing_SharedUserId",
                table: "AppItemSharing",
                column: "SharedUserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_AppItems_ListingItemId",
                table: "AppItems",
                column: "ListingItemId",
                principalTable: "AppItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppItems_AppItems_PublishedListingItemId",
                table: "AppItems",
                column: "PublishedListingItemId",
                principalTable: "AppItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_AppItems_ListingItemId",
                table: "AppItems");

            migrationBuilder.DropForeignKey(
                name: "FK_AppItems_AppItems_PublishedListingItemId",
                table: "AppItems");

            migrationBuilder.DropTable(
                name: "AppItemSharing");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_ItemType",
                table: "AppItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_ListingItemId",
                table: "AppItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_PublishedListingItemId",
                table: "AppItems");

            migrationBuilder.DropIndex(
                name: "IX_AppItems_SharingLevel",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "ItemType",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "ListingItemId",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "PublishedListingItemId",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "SharingLevel",
                table: "AppItems");
        }
    }
}

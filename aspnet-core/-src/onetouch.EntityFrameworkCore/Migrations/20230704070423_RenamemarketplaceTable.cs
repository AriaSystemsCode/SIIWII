using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class RenamemarketplaceTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemList_AppEntities_Id",
                table: "AppMarketplaceItemList");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharing_AbpUsers_SharedUserId",
                table: "AppMarketplaceItemSharing");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharing_AppMarketplaceItemList_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharing");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharing_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharing");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppEntities_SizeId",
                table: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemSizeScalesHeader_ParentId",
                table: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItemList_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetail");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemsListDetail",
                table: "AppMarketplaceItemsListDetail");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScalesHeader",
                table: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScalesDetails",
                table: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSharing",
                table: "AppMarketplaceItemSharing");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemList",
                table: "AppMarketplaceItemList");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemsListDetail",
                newName: "AppMarketplaceItemsListDetails");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSizeScalesHeader",
                newName: "AppMarketplaceItemSizeScaleHeaders");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSizeScalesDetails",
                newName: "AppMarketplaceItemSizeScaleDetails");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSharing",
                newName: "AppMarketplaceItemSharings");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemList",
                newName: "AppMarketplaceItemLists");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetails",
                newName: "IX_AppMarketplaceItemsListDetails_AppMarketplaceItemsListId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetails",
                newName: "IX_AppMarketplaceItemsListDetails_AppMarketplaceItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                newName: "IX_AppMarketplaceItemSizeScaleHeaders_SizeScaleId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_ParentId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                newName: "IX_AppMarketplaceItemSizeScaleHeaders_ParentId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                newName: "IX_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScalesDetails_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleDetails",
                newName: "IX_AppMarketplaceItemSizeScaleDetails_SizeScaleId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScalesDetails_SizeId",
                table: "AppMarketplaceItemSizeScaleDetails",
                newName: "IX_AppMarketplaceItemSizeScaleDetails_SizeId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharing_SharedUserId",
                table: "AppMarketplaceItemSharings",
                newName: "IX_AppMarketplaceItemSharings_SharedUserId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharing_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharings",
                newName: "IX_AppMarketplaceItemSharings_AppMarketplaceItemListId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharing_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharings",
                newName: "IX_AppMarketplaceItemSharings_AppMarketplaceItemId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemsListDetails",
                table: "AppMarketplaceItemsListDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScaleHeaders",
                table: "AppMarketplaceItemSizeScaleHeaders",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScaleDetails",
                table: "AppMarketplaceItemSizeScaleDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSharings",
                table: "AppMarketplaceItemSharings",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemLists",
                table: "AppMarketplaceItemLists",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemLists_AppEntities_Id",
                table: "AppMarketplaceItemLists",
                column: "Id",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharings_AbpUsers_SharedUserId",
                table: "AppMarketplaceItemSharings",
                column: "SharedUserId",
                principalTable: "AbpUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharings_AppMarketplaceItemLists_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharings",
                column: "AppMarketplaceItemListId",
                principalTable: "AppMarketplaceItemLists",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharings_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharings",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleDetails_AppEntities_SizeId",
                table: "AppMarketplaceItemSizeScaleDetails",
                column: "SizeId",
                principalTable: "AppEntities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleDetails_AppMarketplaceItemSizeScaleHeaders_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleDetails",
                column: "SizeScaleId",
                principalTable: "AppMarketplaceItemSizeScaleHeaders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItemSizeScaleHeaders_ParentId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                column: "ParentId",
                principalTable: "AppMarketplaceItemSizeScaleHeaders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleHeaders",
                column: "SizeScaleId",
                principalTable: "AppSizeScalesHeader",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemsListDetails_AppMarketplaceItemLists_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetails",
                column: "AppMarketplaceItemsListId",
                principalTable: "AppMarketplaceItemLists",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemsListDetails_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetails",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemLists_AppEntities_Id",
                table: "AppMarketplaceItemLists");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharings_AbpUsers_SharedUserId",
                table: "AppMarketplaceItemSharings");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharings_AppMarketplaceItemLists_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharings");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSharings_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharings");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleDetails_AppEntities_SizeId",
                table: "AppMarketplaceItemSizeScaleDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleDetails_AppMarketplaceItemSizeScaleHeaders_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItemSizeScaleHeaders_ParentId",
                table: "AppMarketplaceItemSizeScaleHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScaleHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemSizeScaleHeaders_AppSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScaleHeaders");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemsListDetails_AppMarketplaceItemLists_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMarketplaceItemsListDetails_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemsListDetails",
                table: "AppMarketplaceItemsListDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScaleHeaders",
                table: "AppMarketplaceItemSizeScaleHeaders");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScaleDetails",
                table: "AppMarketplaceItemSizeScaleDetails");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemSharings",
                table: "AppMarketplaceItemSharings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_AppMarketplaceItemLists",
                table: "AppMarketplaceItemLists");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemsListDetails",
                newName: "AppMarketplaceItemsListDetail");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSizeScaleHeaders",
                newName: "AppMarketplaceItemSizeScalesHeader");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSizeScaleDetails",
                newName: "AppMarketplaceItemSizeScalesDetails");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemSharings",
                newName: "AppMarketplaceItemSharing");

            migrationBuilder.RenameTable(
                name: "AppMarketplaceItemLists",
                newName: "AppMarketplaceItemList");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemsListDetails_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetail",
                newName: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemsListId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemsListDetails_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail",
                newName: "IX_AppMarketplaceItemsListDetail_AppMarketplaceItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScaleHeaders_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesHeader",
                newName: "IX_AppMarketplaceItemSizeScalesHeader_SizeScaleId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScaleHeaders_ParentId",
                table: "AppMarketplaceItemSizeScalesHeader",
                newName: "IX_AppMarketplaceItemSizeScalesHeader_ParentId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScaleHeaders_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScalesHeader",
                newName: "IX_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScaleDetails_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails",
                newName: "IX_AppMarketplaceItemSizeScalesDetails_SizeScaleId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSizeScaleDetails_SizeId",
                table: "AppMarketplaceItemSizeScalesDetails",
                newName: "IX_AppMarketplaceItemSizeScalesDetails_SizeId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharings_SharedUserId",
                table: "AppMarketplaceItemSharing",
                newName: "IX_AppMarketplaceItemSharing_SharedUserId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharings_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharing",
                newName: "IX_AppMarketplaceItemSharing_AppMarketplaceItemListId");

            migrationBuilder.RenameIndex(
                name: "IX_AppMarketplaceItemSharings_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharing",
                newName: "IX_AppMarketplaceItemSharing_AppMarketplaceItemId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemsListDetail",
                table: "AppMarketplaceItemsListDetail",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScalesHeader",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSizeScalesDetails",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemSharing",
                table: "AppMarketplaceItemSharing",
                column: "Id");

            migrationBuilder.AddPrimaryKey(
                name: "PK_AppMarketplaceItemList",
                table: "AppMarketplaceItemList",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemList_AppEntities_Id",
                table: "AppMarketplaceItemList",
                column: "Id",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharing_AbpUsers_SharedUserId",
                table: "AppMarketplaceItemSharing",
                column: "SharedUserId",
                principalTable: "AbpUsers",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharing_AppMarketplaceItemList_AppMarketplaceItemListId",
                table: "AppMarketplaceItemSharing",
                column: "AppMarketplaceItemListId",
                principalTable: "AppMarketplaceItemList",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSharing_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSharing",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppEntities_SizeId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeId",
                principalTable: "AppEntities",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesDetails_AppMarketplaceItemSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesDetails",
                column: "SizeScaleId",
                principalTable: "AppMarketplaceItemSizeScalesHeader",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItemSizeScalesHeader_ParentId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "ParentId",
                principalTable: "AppMarketplaceItemSizeScalesHeader",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemSizeScalesHeader_AppSizeScalesHeader_SizeScaleId",
                table: "AppMarketplaceItemSizeScalesHeader",
                column: "SizeScaleId",
                principalTable: "AppSizeScalesHeader",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItemList_AppMarketplaceItemsListId",
                table: "AppMarketplaceItemsListDetail",
                column: "AppMarketplaceItemsListId",
                principalTable: "AppMarketplaceItemList",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMarketplaceItemsListDetail_AppMarketplaceItems_AppMarketplaceItemId",
                table: "AppMarketplaceItemsListDetail",
                column: "AppMarketplaceItemId",
                principalTable: "AppMarketplaceItems",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

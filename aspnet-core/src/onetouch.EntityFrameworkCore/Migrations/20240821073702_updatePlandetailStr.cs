using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updatePlandetailStr : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppSubscriptionPlanDetails_AppEntities_Id",
                table: "AppSubscriptionPlanDetails");

            //migrationBuilder.AlterColumn<long>(
            //    name: "Id",
            //    table: "AppSubscriptionPlanDetails",
            //    type: "bigint",
            //    nullable: false,
            //    oldClrType: typeof(long),
            //    oldType: "bigint")
            //    .Annotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreationTime",
                table: "AppSubscriptionPlanDetails",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<long>(
                name: "CreatorUserId",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeleterUserId",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletionTime",
                table: "AppSubscriptionPlanDetails",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AppSubscriptionPlanDetails",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModificationTime",
                table: "AppSubscriptionPlanDetails",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "LastModifierUserId",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "AppSubscriptionPlanDetails",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreationTime",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "CreatorUserId",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "DeleterUserId",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "DeletionTime",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "LastModificationTime",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "LastModifierUserId",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "AppSubscriptionPlanDetails");

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "AppSubscriptionPlanDetails",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldType: "bigint")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AddForeignKey(
                name: "FK_AppSubscriptionPlanDetails_AppEntities_Id",
                table: "AppSubscriptionPlanDetails",
                column: "Id",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

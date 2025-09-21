using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updateEntityLogStru : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "CreationTime",
                table: "AppEntityLog",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<long>(
                name: "CreatorUserId",
                table: "AppEntityLog",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "DeleterUserId",
                table: "AppEntityLog",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DeletionTime",
                table: "AppEntityLog",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsDeleted",
                table: "AppEntityLog",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "LastModificationTime",
                table: "AppEntityLog",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "LastModifierUserId",
                table: "AppEntityLog",
                type: "bigint",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CreationTime",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "CreatorUserId",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "DeleterUserId",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "DeletionTime",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "IsDeleted",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "LastModificationTime",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "LastModifierUserId",
                table: "AppEntityLog");
        }
    }
}

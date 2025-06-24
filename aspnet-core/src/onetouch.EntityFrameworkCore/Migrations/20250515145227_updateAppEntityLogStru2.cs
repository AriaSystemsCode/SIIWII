using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class updateAppEntityLogStru2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ReadyToBeSent",
                table: "AppEntityLog");

            migrationBuilder.AddColumn<string>(
                name: "EntityObjectStatusCode",
                table: "AppEntityLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "EntityObjectStatusId",
                table: "AppEntityLog",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ObjectCode",
                table: "AppEntityLog",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "ObjectId",
                table: "AppEntityLog",
                type: "bigint",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityLog_EntityObjectStatusId",
                table: "AppEntityLog",
                column: "EntityObjectStatusId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityLog_ObjectId",
                table: "AppEntityLog",
                column: "ObjectId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityLog_SycEntityObjectStatuses_EntityObjectStatusId",
                table: "AppEntityLog",
                column: "EntityObjectStatusId",
                principalTable: "SycEntityObjectStatuses",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityLog_SydObjects_ObjectId",
                table: "AppEntityLog",
                column: "ObjectId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityLog_SycEntityObjectStatuses_EntityObjectStatusId",
                table: "AppEntityLog");

            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityLog_SydObjects_ObjectId",
                table: "AppEntityLog");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityLog_EntityObjectStatusId",
                table: "AppEntityLog");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityLog_ObjectId",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "EntityObjectStatusCode",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "EntityObjectStatusId",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "ObjectCode",
                table: "AppEntityLog");

            migrationBuilder.DropColumn(
                name: "ObjectId",
                table: "AppEntityLog");

            migrationBuilder.AddColumn<bool>(
                name: "ReadyToBeSent",
                table: "AppEntityLog",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}

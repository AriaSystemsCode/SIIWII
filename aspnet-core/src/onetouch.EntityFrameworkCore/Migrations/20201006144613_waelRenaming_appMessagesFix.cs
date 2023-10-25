using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_appMessagesFix : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactId",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "ParentCode",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "Sender",
                table: "AppMessages");

            migrationBuilder.AlterColumn<long>(
                name: "ThreadId",
                table: "AppMessages",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "AppMessages",
                maxLength: 250,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "EntityCode",
                table: "AppMessages",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<long>(
                name: "SenderId",
                table: "AppMessages",
                nullable: false,
                defaultValue: 0L);

            migrationBuilder.AddColumn<long>(
                name: "UserId",
                table: "AppMessages",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_AppMessages_ParentId",
                table: "AppMessages",
                column: "ParentId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMessages_SenderId",
                table: "AppMessages",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMessages_ThreadId",
                table: "AppMessages",
                column: "ThreadId");

            migrationBuilder.CreateIndex(
                name: "IX_AppMessages_UserId",
                table: "AppMessages",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppMessages_AppMessages_ParentId",
                table: "AppMessages",
                column: "ParentId",
                principalTable: "AppMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMessages_AbpUsers_SenderId",
                table: "AppMessages",
                column: "SenderId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMessages_AppMessages_ThreadId",
                table: "AppMessages",
                column: "ThreadId",
                principalTable: "AppMessages",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppMessages_AbpUsers_UserId",
                table: "AppMessages",
                column: "UserId",
                principalTable: "AbpUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppMessages_AppMessages_ParentId",
                table: "AppMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMessages_AbpUsers_SenderId",
                table: "AppMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMessages_AppMessages_ThreadId",
                table: "AppMessages");

            migrationBuilder.DropForeignKey(
                name: "FK_AppMessages_AbpUsers_UserId",
                table: "AppMessages");

            migrationBuilder.DropIndex(
                name: "IX_AppMessages_ParentId",
                table: "AppMessages");

            migrationBuilder.DropIndex(
                name: "IX_AppMessages_SenderId",
                table: "AppMessages");

            migrationBuilder.DropIndex(
                name: "IX_AppMessages_ThreadId",
                table: "AppMessages");

            migrationBuilder.DropIndex(
                name: "IX_AppMessages_UserId",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "SenderId",
                table: "AppMessages");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "AppMessages");

            migrationBuilder.AlterColumn<int>(
                name: "ThreadId",
                table: "AppMessages",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Subject",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldMaxLength: 250);

            migrationBuilder.AlterColumn<string>(
                name: "EntityCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ContactId",
                table: "AppMessages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ParentCode",
                table: "AppMessages",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Sender",
                table: "AppMessages",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}

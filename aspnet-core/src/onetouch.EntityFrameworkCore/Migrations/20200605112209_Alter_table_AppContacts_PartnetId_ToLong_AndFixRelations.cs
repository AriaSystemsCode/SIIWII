using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Alter_table_AppContacts_PartnetId_ToLong_AndFixRelations : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts");

            migrationBuilder.AlterColumn<long>(
                name: "PartnerId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppContacts_ParentId",
                table: "AppContacts",
                column: "ParentId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "AppContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppContacts_ParentId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppContacts_PartnerId",
                table: "AppContacts");

            migrationBuilder.AlterColumn<int>(
                name: "PartnerId",
                table: "AppContacts",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts",
                column: "ParentId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}

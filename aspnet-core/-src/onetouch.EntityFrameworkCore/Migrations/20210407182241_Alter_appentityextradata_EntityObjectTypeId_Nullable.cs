using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Alter_appentityextradata_EntityObjectTypeId_Nullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityExtraData_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntityExtraData");

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectTypeId",
                table: "AppEntityExtraData",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityExtraData_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntityExtraData",
                column: "EntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityExtraData_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntityExtraData");

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectTypeId",
                table: "AppEntityExtraData",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityExtraData_SycEntityObjectTypes_EntityObjectTypeId",
                table: "AppEntityExtraData",
                column: "EntityObjectTypeId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

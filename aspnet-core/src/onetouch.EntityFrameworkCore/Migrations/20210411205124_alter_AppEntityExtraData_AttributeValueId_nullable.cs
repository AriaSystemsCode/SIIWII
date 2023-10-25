using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class alter_AppEntityExtraData_AttributeValueId_nullable : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityExtraData_AppEntities_AttributeValueId",
                table: "AppEntityExtraData");

            migrationBuilder.AlterColumn<long>(
                name: "AttributeValueId",
                table: "AppEntityExtraData",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityExtraData_AppEntities_AttributeValueId",
                table: "AppEntityExtraData",
                column: "AttributeValueId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityExtraData_AppEntities_AttributeValueId",
                table: "AppEntityExtraData");

            migrationBuilder.AlterColumn<long>(
                name: "AttributeValueId",
                table: "AppEntityExtraData",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityExtraData_AppEntities_AttributeValueId",
                table: "AppEntityExtraData",
                column: "AttributeValueId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

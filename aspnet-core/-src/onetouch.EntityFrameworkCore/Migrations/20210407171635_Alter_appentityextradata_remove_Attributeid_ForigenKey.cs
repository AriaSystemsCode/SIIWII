using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Alter_appentityextradata_remove_Attributeid_ForigenKey : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppEntityExtraData_SydObjects_AttributeId",
                table: "AppEntityExtraData");

            migrationBuilder.DropIndex(
                name: "IX_AppEntityExtraData_AttributeId",
                table: "AppEntityExtraData");

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_AppEntityExtraData_AttributeId",
                table: "AppEntityExtraData",
                column: "AttributeId");

            migrationBuilder.AddForeignKey(
                name: "FK_AppEntityExtraData_SydObjects_AttributeId",
                table: "AppEntityExtraData",
                column: "AttributeId",
                principalTable: "SydObjects",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

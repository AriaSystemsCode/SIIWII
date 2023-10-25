using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Link_objType_Idstructure : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycEntityObjectTypes_SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes",
                column: "SycIdentifierDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycEntityObjectTypes_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes",
                column: "SycIdentifierDefinitionId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycEntityObjectTypes_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropIndex(
                name: "IX_SycEntityObjectTypes_SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes");

            migrationBuilder.DropColumn(
                name: "SycIdentifierDefinitionId",
                table: "SycEntityObjectTypes");
        }
    }
}

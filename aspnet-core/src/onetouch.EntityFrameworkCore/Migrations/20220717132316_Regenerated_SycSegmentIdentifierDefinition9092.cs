using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Regenerated_SycSegmentIdentifierDefinition9092 : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SycSegmentIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions",
                column: "SycIdentifierDefinitionId");

            migrationBuilder.AddForeignKey(
                name: "FK_SycSegmentIdentifierDefinitions_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions",
                column: "SycIdentifierDefinitionId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SycSegmentIdentifierDefinitions_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions");

            migrationBuilder.DropIndex(
                name: "IX_SycSegmentIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions");

            migrationBuilder.DropColumn(
                name: "SycIdentifierDefinitionId",
                table: "SycSegmentIdentifierDefinitions");
        }
    }
}

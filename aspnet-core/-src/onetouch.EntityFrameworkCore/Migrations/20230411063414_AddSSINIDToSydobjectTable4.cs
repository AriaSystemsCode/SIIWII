using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddSSINIDToSydobjectTable4 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.DropColumn(
                name: "SSINIdentifier",
                table: "SydObjects");

            migrationBuilder.RenameColumn(
                name: "SycIdentifierDefinitionId",
                table: "SydObjects",
                newName: "SSINIdentifierId");

            migrationBuilder.RenameIndex(
                name: "IX_SydObjects_SycIdentifierDefinitionId",
                table: "SydObjects",
                newName: "IX_SydObjects_SSINIdentifierId");

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_SycDefaultIdentifierId",
                table: "SydObjects",
                column: "SycDefaultIdentifierId");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifierId",
                table: "SydObjects",
                column: "SSINIdentifierId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycDefaultIdentifierId",
                table: "SydObjects",
                column: "SycDefaultIdentifierId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifierId",
                table: "SydObjects");

            migrationBuilder.DropForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycDefaultIdentifierId",
                table: "SydObjects");

            migrationBuilder.DropIndex(
                name: "IX_SydObjects_SycDefaultIdentifierId",
                table: "SydObjects");

            migrationBuilder.RenameColumn(
                name: "SSINIdentifierId",
                table: "SydObjects",
                newName: "SycIdentifierDefinitionId");

            migrationBuilder.RenameIndex(
                name: "IX_SydObjects_SSINIdentifierId",
                table: "SydObjects",
                newName: "IX_SydObjects_SycIdentifierDefinitionId");

            migrationBuilder.AddColumn<long>(
                name: "SSINIdentifier",
                table: "SydObjects",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_SydObjects_SSINIdentifier",
                table: "SydObjects",
                column: "SSINIdentifier");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SSINIdentifier",
                table: "SydObjects",
                column: "SSINIdentifier",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SycIdentifierDefinitions_SycIdentifierDefinitionId",
                table: "SydObjects",
                column: "SycIdentifierDefinitionId",
                principalTable: "SycIdentifierDefinitions",
                principalColumn: "Id");
        }
    }
}

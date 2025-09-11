using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class AppItemChildsAndExtraData : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MaximumPrice",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "MinimumPrice",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "Variations",
                table: "AppItems");

            migrationBuilder.DropColumn(
                name: "ExtraData",
                table: "AppEntities");

            migrationBuilder.CreateTable(
                name: "AppEntityExtraData",
                columns: table => new
                {
                    Id = table.Column<long>(nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    EntityId = table.Column<long>(nullable: false),
                    EntityCode = table.Column<string>(maxLength: 50, nullable: true),
                    EntityObjectTypeId = table.Column<long>(nullable: false),
                    EntityObjectTypeCode = table.Column<string>(maxLength: 50, nullable: true),
                    AttributeId = table.Column<long>(nullable: false),
                    AttributeCode = table.Column<string>(maxLength: 50, nullable: true),
                    AttributeValueId = table.Column<long>(nullable: false),
                    AttributeValue = table.Column<string>(maxLength: 50, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AppEntityExtraData", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AppEntityExtraData_SydObjects_AttributeId",
                        column: x => x.AttributeId,
                        principalTable: "SydObjects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AppEntityExtraData_AppEntities_AttributeValueId",
                        column: x => x.AttributeValueId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_AppEntityExtraData_AppEntities_EntityId",
                        column: x => x.EntityId,
                        principalTable: "AppEntities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.NoAction);
                    table.ForeignKey(
                        name: "FK_AppEntityExtraData_SycEntityObjectTypes_EntityObjectTypeId",
                        column: x => x.EntityObjectTypeId,
                        principalTable: "SycEntityObjectTypes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityExtraData_AttributeId",
                table: "AppEntityExtraData",
                column: "AttributeId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityExtraData_AttributeValueId",
                table: "AppEntityExtraData",
                column: "AttributeValueId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityExtraData_EntityId",
                table: "AppEntityExtraData",
                column: "EntityId");

            migrationBuilder.CreateIndex(
                name: "IX_AppEntityExtraData_EntityObjectTypeId",
                table: "AppEntityExtraData",
                column: "EntityObjectTypeId");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AppEntityExtraData");

            migrationBuilder.AddColumn<decimal>(
                name: "MaximumPrice",
                table: "AppItems",
                type: "decimal(15, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "MinimumPrice",
                table: "AppItems",
                type: "decimal(15, 3)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Variations",
                table: "AppItems",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExtraData",
                table: "AppEntities",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}

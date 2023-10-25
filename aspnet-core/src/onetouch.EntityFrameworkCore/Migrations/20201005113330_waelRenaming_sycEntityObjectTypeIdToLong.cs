using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_sycEntityObjectTypeIdToLong : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
    name: "FK_SycEntityObjectTypes_SycEntityObjectTypes_ParentId",
    table: "SycEntityObjectTypes");

            migrationBuilder.DropForeignKey(
name: "FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId",
table: "SycAttachmentCategories");

            migrationBuilder.DropForeignKey(
name: "FK_AppEntities_SycEntityObjectTypes_EntityObjectTypeId",
table: "AppEntities");

            migrationBuilder.DropPrimaryKey("PK_SycEntityObjectTypes", "SycEntityObjectTypes");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "SycEntityObjectTypes",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SycEntityObjectTypes",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectTypeId",
                table: "SycAttachmentCategories",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "EntityObjectTypeId",
                table: "AppEntities",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");


            migrationBuilder.AddPrimaryKey("PK_SycEntityObjectTypes", "SycEntityObjectTypes", "Id");

            migrationBuilder.AddForeignKey(
    name: "FK_SycEntityObjectTypes_SycEntityObjectTypes_ParentId",
    table: "SycEntityObjectTypes",
    column: "ParentId",
    principalTable: "SycEntityObjectTypes",
    principalColumn: "Id",
    onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
    name: "FK_SycAttachmentCategories_SycEntityObjectTypes_EntityObjectTypeId",
    table: "SycAttachmentCategories",
    column: "EntityObjectTypeId",
    principalTable: "SycEntityObjectTypes",
    principalColumn: "Id",
    onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
       name: "FK_AppEntities_SycEntityObjectTypes_EntityObjectTypeId",
       table: "AppEntities",
       column: "EntityObjectTypeId",
       principalTable: "SycEntityObjectTypes",
       principalColumn: "Id",
       onDelete: ReferentialAction.Cascade);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ParentId",
                table: "SycEntityObjectTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SycEntityObjectTypes",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "EntityObjectTypeId",
                table: "SycAttachmentCategories",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "EntityObjectTypeId",
                table: "AppEntities",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}

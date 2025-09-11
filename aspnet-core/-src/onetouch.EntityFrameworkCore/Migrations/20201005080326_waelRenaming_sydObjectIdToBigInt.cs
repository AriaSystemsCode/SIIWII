using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_sydObjectIdToBigInt : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
     
            migrationBuilder.DropForeignKey(
    name: "FK_SycEntityObjectTypes_SydObjects_ObjectId",
    table: "SycEntityObjectTypes");

            migrationBuilder.DropForeignKey(
name: "FK_SycEntityObjectStatuses_SydObjects_ObjectId",
table: "SycEntityObjectStatuses");

            migrationBuilder.DropForeignKey(
name: "FK_SycEntityObjectClassifications_SydObjects_ObjectId",
table: "SycEntityObjectClassifications");

            migrationBuilder.DropForeignKey(
name: "FK_SycEntityObjectCategories_SydObjects_ObjectId",
table: "SycEntityObjectCategories");

            migrationBuilder.DropForeignKey(
name: "FK_AppEntities_SydObjects_ObjectId",
table: "AppEntities");

            migrationBuilder.DropForeignKey(
name: "FK_SydObjects_SydObjects_ParentId",
table: "SydObjects");

            migrationBuilder.DropPrimaryKey("PK_SydObjects", "SydObjects");

           

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "SydObjects",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);



            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SydObjects",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");



            migrationBuilder.AlterColumn<long>(
                name: "ObjectId",
                table: "SycEntityObjectTypes",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<long>(
                name: "ObjectId",
                table: "SycEntityObjectStatuses",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<long>(
                name: "ObjectId",
                table: "SycEntityObjectClassifications",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "ObjectId",
                table: "SycEntityObjectCategories",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<long>(
                name: "ObjectId",
                table: "AppEntities",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey("PK_SydObjects", "SydObjects", "Id");

            migrationBuilder.AddForeignKey(
    name: "FK_SycEntityObjectTypes_SydObjects_ObjectId",
    table: "SycEntityObjectTypes",
    column: "ObjectId",
    principalTable: "SydObjects",
    principalColumn: "Id",
    onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
    name: "FK_SycEntityObjectStatuses_SydObjects_ObjectId",
    table: "SycEntityObjectStatuses",
    column: "ObjectId",
    principalTable: "SydObjects",
    principalColumn: "Id",
    onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
    name: "FK_SycEntityObjectClassifications_SydObjects_ObjectId",
    table: "SycEntityObjectClassifications",
    column: "ObjectId",
    principalTable: "SydObjects",
    principalColumn: "Id",
    onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
          name: "FK_SycEntityObjectCategories_SydObjects_ObjectId",
          table: "SycEntityObjectCategories",
          column: "ObjectId",
          principalTable: "SydObjects",
          principalColumn: "Id",
          onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
    name: "FK_AppEntities_SydObjects_ObjectId",
    table: "AppEntities",
    column: "ObjectId",
    principalTable: "SydObjects",
    principalColumn: "Id",
    onDelete: ReferentialAction.Cascade);


            migrationBuilder.AddForeignKey(
name: "FK_SydObjects_SydObjects_ParentId",
table: "SydObjects",
column: "ParentId",
principalTable: "SydObjects",
principalColumn: "Id",
onDelete: ReferentialAction.Restrict);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ParentId",
                table: "SydObjects",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SydObjects",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectTypes",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AlterColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectStatuses",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AlterColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectClassifications",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "ObjectId",
                table: "SycEntityObjectCategories",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));

            migrationBuilder.AlterColumn<int>(
                name: "ObjectId",
                table: "AppEntities",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}

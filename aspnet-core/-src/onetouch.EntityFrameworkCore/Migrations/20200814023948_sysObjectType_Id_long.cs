using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class sysObjectType_Id_long : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey("FK_SysObjectTypes_SysObjectTypes_ParentId", "SysObjectTypes");
            migrationBuilder.DropForeignKey("FK_SydObjects_SysObjectTypes_SysObjectTypeId", "SydObjects");
            migrationBuilder.DropPrimaryKey("PK_SysObjectTypes", "SysObjectTypes");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "SysObjectTypes",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Id",
                table: "SysObjectTypes",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int")
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");



            migrationBuilder.AlterColumn<long>(
                name: "SysObjectTypeId",
                table: "SydObjects",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddPrimaryKey("PK_SysObjectTypes", "SysObjectTypes", "Id");
            migrationBuilder.AddForeignKey(
                name: "FK_SysObjectTypes_SysObjectTypes_ParentId",
                table: "SysObjectTypes",
                column: "ParentId",
                principalTable: "SysObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_SydObjects_SysObjectTypes_SysObjectTypeId",
                table: "SydObjects",
                column: "SysObjectTypeId",
                principalTable: "SysObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "ParentId",
                table: "SysObjectTypes",
                type: "int",
                nullable: true,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "Id",
                table: "SysObjectTypes",
                type: "int",
                nullable: false,
                oldClrType: typeof(long))
                .Annotation("SqlServer:Identity", "1, 1")
                .OldAnnotation("SqlServer:Identity", "1, 1");

            migrationBuilder.AlterColumn<int>(
                name: "SysObjectTypeId",
                table: "SydObjects",
                type: "int",
                nullable: false,
                oldClrType: typeof(long));
        }
    }
}

using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class Add_table_AppContacts_FixNullableFields : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_CurrencyId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_LanguageId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone1TypeId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone2TypeId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone3TypeId",
                table: "AppContacts");

            migrationBuilder.AlterColumn<long>(
                name: "Phone3TypeId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "Phone2TypeId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "Phone1TypeId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<int>(
                name: "PartnerId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "LanguageId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AlterColumn<long>(
                name: "CurrencyId",
                table: "AppContacts",
                nullable: true,
                oldClrType: typeof(long),
                oldType: "bigint");

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_CurrencyId",
                table: "AppContacts",
                column: "CurrencyId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_LanguageId",
                table: "AppContacts",
                column: "LanguageId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts",
                column: "ParentId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone1TypeId",
                table: "AppContacts",
                column: "Phone1TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone2TypeId",
                table: "AppContacts",
                column: "Phone2TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone3TypeId",
                table: "AppContacts",
                column: "Phone3TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_CurrencyId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_LanguageId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone1TypeId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone2TypeId",
                table: "AppContacts");

            migrationBuilder.DropForeignKey(
                name: "FK_AppContacts_AppEntities_Phone3TypeId",
                table: "AppContacts");

            migrationBuilder.AlterColumn<long>(
                name: "Phone3TypeId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Phone2TypeId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "Phone1TypeId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "PartnerId",
                table: "AppContacts",
                type: "int",
                nullable: false,
                oldClrType: typeof(int),
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "ParentId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "LanguageId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AlterColumn<long>(
                name: "CurrencyId",
                table: "AppContacts",
                type: "bigint",
                nullable: false,
                oldClrType: typeof(long),
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_CurrencyId",
                table: "AppContacts",
                column: "CurrencyId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_LanguageId",
                table: "AppContacts",
                column: "LanguageId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_ParentId",
                table: "AppContacts",
                column: "ParentId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_SycEntityObjectTypes_PartnerId",
                table: "AppContacts",
                column: "PartnerId",
                principalTable: "SycEntityObjectTypes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone1TypeId",
                table: "AppContacts",
                column: "Phone1TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone2TypeId",
                table: "AppContacts",
                column: "Phone2TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_AppContacts_AppEntities_Phone3TypeId",
                table: "AppContacts",
                column: "Phone3TypeId",
                principalTable: "AppEntities",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}

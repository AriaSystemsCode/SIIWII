using Microsoft.EntityFrameworkCore.Migrations;

namespace onetouch.Migrations
{
    public partial class waelRenaming_AppContactAndEntityCategoryAndEntityClass_fixing : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyIdCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "LanguageIdCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone1TypeIdName",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone2TypeIdName",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone3TypeIdName",
                table: "AppContacts");

            migrationBuilder.AlterColumn<string>(
                name: "EntityObjectCategoryCode",
                table: "AppEntityCategories",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EntityCode",
                table: "AppEntityCategories",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrencyCode",
                table: "AppContacts",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LanguageCode",
                table: "AppContacts",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone1TypeName",
                table: "AppContacts",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone2TypeName",
                table: "AppContacts",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone3TypeName",
                table: "AppContacts",
                maxLength: 250,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CurrencyCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "LanguageCode",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone1TypeName",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone2TypeName",
                table: "AppContacts");

            migrationBuilder.DropColumn(
                name: "Phone3TypeName",
                table: "AppContacts");

            migrationBuilder.AlterColumn<string>(
                name: "EntityObjectCategoryCode",
                table: "AppEntityCategories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "EntityCode",
                table: "AppEntityCategories",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CurrencyIdCode",
                table: "AppContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LanguageIdCode",
                table: "AppContacts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone1TypeIdName",
                table: "AppContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone2TypeIdName",
                table: "AppContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Phone3TypeIdName",
                table: "AppContacts",
                type: "nvarchar(250)",
                maxLength: 250,
                nullable: true);
        }
    }
}

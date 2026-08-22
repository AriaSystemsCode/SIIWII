using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddconsiderAsMember : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ConsiderAsTeamMember",
                table: "AppContactRelationshipInfo",
                type: "bit",
                nullable: false,
                defaultValue: false);

         
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ConsiderAsTeamMember",
                table: "AppContactRelationshipInfo");

         
        }
    }
}

using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace onetouch.Migrations
{
    /// <inheritdoc />
    public partial class AddRolesToRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
         
            migrationBuilder.AddColumn<string> (
                name: "RequesterMarketplaceRole",
                table: "AppContactRelationshipInfo",
                type: "nvarchar(50)",
                nullable: true);
            migrationBuilder.AddColumn<string>(
               name: "RecipientMarketplaceRole",
               table: "AppContactRelationshipInfo",
               type: "nvarchar(50)",
               nullable: true);
          
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            
            migrationBuilder.DropColumn(
                name: "RequesterMarketplaceRole",
                table: "AppContactRelationshipInfo");

            migrationBuilder.DropColumn(
                name: "RecipientMarketplaceRole",
                table: "AppContactRelationshipInfo");

          
        }
    }
}

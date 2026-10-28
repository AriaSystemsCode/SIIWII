using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261028120000_ConsolidateStringDropdown")]
    public class ConsolidateStringDropdown : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261028_ConsolidateStringDropdown.sql";
            using var stream = typeof(ConsolidateStringDropdown).Assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException("String--Dropdown consolidation SQL was not embedded.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("Restoring the retired String--dropDownList type requires a database backup.");
        }
    }
}

using System;
using System.IO;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using onetouch.EntityFrameworkCore;

namespace onetouch.Migrations
{
    [DbContext(typeof(onetouchDbContext))]
    [Migration("20261020120000_StringDropdownDateFormat")]
    public class StringDropdownDateFormat : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            const string resourceName = "onetouch.Migrations.Seed.20261020_SeedStringDropdownDateFormat.sql";
            using var stream = typeof(StringDropdownDateFormat).Assembly.GetManifestResourceStream(resourceName)
                ?? throw new InvalidOperationException("String--dropDownList seed SQL was not embedded.");
            using var reader = new StreamReader(stream);
            migrationBuilder.Sql(reader.ReadToEnd());
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            throw new NotSupportedException("String--dropDownList migration requires a database backup for rollback.");
        }
    }
}

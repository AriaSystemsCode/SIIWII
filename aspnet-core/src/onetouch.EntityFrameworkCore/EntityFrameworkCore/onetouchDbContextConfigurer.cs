using System.Data.Common;
using Microsoft.EntityFrameworkCore;

namespace onetouch.EntityFrameworkCore
{
    public static class onetouchDbContextConfigurer
    {
        public static void Configure(DbContextOptionsBuilder<onetouchDbContext> builder, string connectionString)
        {
            builder.UseSqlServer(connectionString);
        }

        public static void Configure(DbContextOptionsBuilder<onetouchDbContext> builder, DbConnection connection)
        {
            builder.UseSqlServer(connection);
        }
    }
}
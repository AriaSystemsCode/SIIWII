using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using onetouch.Configuration;
using onetouch.Web;

namespace onetouch.EntityFrameworkCore
{
    /* This class is needed to run "dotnet ef ..." commands from command line on development. Not used anywhere else */
    public class onetouchDbContextFactory : IDesignTimeDbContextFactory<onetouchDbContext>
    {
        public onetouchDbContext CreateDbContext(string[] args)
        {
            var builder = new DbContextOptionsBuilder<onetouchDbContext>();
            var configuration = AppConfigurations.Get(WebContentDirectoryFinder.CalculateContentRootFolder(), addUserSecrets: true);

            onetouchDbContextConfigurer.Configure(builder, configuration.GetConnectionString(onetouchConsts.ConnectionStringName));

            return new onetouchDbContext(builder.Options);
        }
    }
}
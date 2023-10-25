using Abp.Dependency;
using Castle.MicroKernel.Registration;
using Castle.Windsor.MsDependencyInjection;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using onetouch.Configuration;
using onetouch.EntityFrameworkCore;
using onetouch.Identity;
using onetouch.Web;

namespace onetouch.Test.Base.DependencyInjection
{
    public static class ServiceCollectionRegistrar
    {
        public static void Register(IIocManager iocManager)
        {
            RegisterIdentity(iocManager);

            //var builder = new DbContextOptionsBuilder<onetouchDbContext>();

            //var inMemorySqlite = new SqliteConnection("Data Source=:memory:");
            //builder.UseSqlite(inMemorySqlite);

            //iocManager.IocContainer.Register(
            //    Component
            //        .For<DbContextOptions<onetouchDbContext>>()
            //        .Instance(builder.Options)
            //        .LifestyleSingleton()
            //);

            //inMemorySqlite.Open();

            //new onetouchDbContext(builder.Options).Database.EnsureCreated();

            var builder = new DbContextOptionsBuilder<onetouchDbContext>();
            builder.UseSqlServer("Server=NEXUS-D\\SQL2019; Database=onetouchDevDb3_test;User ID=sa;Password=Aria@2020;");
            iocManager.IocContainer.Register(
                Component
                    .For<DbContextOptions<onetouchDbContext>>()
                    .Instance(builder.Options)
                    .LifestyleSingleton()
            );
            
             new onetouchDbContext(builder.Options);
        }

        private static void RegisterIdentity(IIocManager iocManager)
        {
            var services = new ServiceCollection();

            IdentityRegistrar.Register(services);

            WindsorRegistrationHelper.CreateServiceProvider(iocManager.IocContainer, services);
        }
    }
}

using System;
using System.Linq;
using System.Threading.Tasks;
using Abp;
using Abp.Authorization.Users;
using Abp.EntityFrameworkCore.Extensions;
using Abp.Events.Bus;
using Abp.Events.Bus.Entities;
using Abp.Modules;
using Abp.MultiTenancy;
using Abp.Runtime.Session;
using Abp.TestBase;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users;
using onetouch.EntityFrameworkCore;
using onetouch.MultiTenancy;
using onetouch.Test.Base.TestData;

namespace onetouch.Test.Base
{
    /// <summary>
    /// This is base class for all our test classes.
    /// It prepares ABP system, modules and a fake, in-memory database.
    /// Seeds database with initial data.
    /// Provides methods to easily work with <see cref="onetouchDbContext"/>.
    /// </summary>
    public abstract class AppTestBase<T> : AbpIntegratedTestBase<T> where T : AbpModule
    {
        protected AppTestBase()
        {
            SeedTestData();
            LoginAsDefaultTenantAdmin();
        }

        private void SeedTestData()
        {
            void NormalizeDbContext(onetouchDbContext context)
            {
                context.EntityChangeEventHelper = NullEntityChangeEventHelper.Instance;
                context.EventBus = NullEventBus.Instance;
                context.SuppressAutoSetTenantId = true;
            }

            //Seed initial data for default tenant
            AbpSession.TenantId = 1;

            UsingDbContext(context =>
            {
                NormalizeDbContext(context);
                new TestDataBuilder(context, 1).Create();
                CreateHostObjectEntityTypes(context);
                CreateHostCodeStructures(context);
            });
         


        }
        private void CreateHostObjectEntityTypes(onetouchDbContext _context)
        {
            #region Add missing SydObjects

            var ObjectTypeCodeEntity = _context.SysObjectTypes.IgnoreQueryFilters().FirstOrDefault(
                r => r.Code == "ENTITY");
            if (ObjectTypeCodeEntity == null || ObjectTypeCodeEntity.Id == 0)
            {
                ObjectTypeCodeEntity = new SystemObjects.SysObjectType
                {
                    Code = "ENTITY",
                    Name = "Entity",
                };
                _context.SysObjectTypes.Add(ObjectTypeCodeEntity);
                _context.SaveChanges();
            }

            var sydObjects_Category = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
                r => r.Code == "CATEGORY");
            if (sydObjects_Category == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_Category = new SystemObjects.SydObject
                {
                    Code = "CATEGORY",
                    Name = "Category",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_Category);
                _context.SaveChanges();
            }
            
            var sydObjects_Department = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
                r => r.Code == "DEPARTMENT");
            if (sydObjects_Department == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_Department = new SystemObjects.SydObject
                {
                    Code = "DEPARTMENT",
                    Name = "Department",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_Department);
                _context.SaveChanges();
            }

            var sydObjects_Classification = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
           r => r.Code == "CLASSIFICATION");
            if (sydObjects_Classification == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_Classification = new SystemObjects.SydObject
                {
                    Code = "CLASSIFICATION",
                    Name = "Classification",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_Classification);
                _context.SaveChanges();
            }
            #endregion Add missing SydObjects

            #region Add missing sycEntityObjectTypes
            var parents = "ITEM,ITEM,ITEM,ITEM,CATEGORY,DEPARTMENT,CLASSIFICATION,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT".ToUpper().Split(',');
            var codes = "PRODUCTVARIATION,PRODUCT,LISTINGVARIATION,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,TenantBranch,TenantAddress,TenantContact,ManualAccount,ManualAccountBranch,ManualAccountAddress,ManualAccountContact".ToUpper().Split(',');
            var names = "Product Variation,Product,Listing Variation,Listing,Category,Department,Classification,Tenant Branch,Tenant Address,Tenant Contact,Manual Account,Manual Account Branch,Manual Account Address,Manual Account Contact".Split(',');

            for (int i = 0; i < codes.Length; i++)
            {
                var sydObjects = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
                    r => r.Code == parents[i]);

                var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().FirstOrDefault(
                    r => r.TenantId == null && r.Code == codes[i]);

                if (sydObjects != null && sydObjects.Id > 0 &&
                    sycEntityObjectTypes == null)
                {
                    sycEntityObjectTypes = new SystemObjects.SycEntityObjectType()
                    {
                        Code = codes[i],
                        Name = names[i],
                        ObjectId = sydObjects.Id,
                        ObjectCode = sydObjects.Code,

                    };
                    _context.SycEntityObjectTypes.Add(sycEntityObjectTypes);
                    _context.SaveChanges();
                }
            }
            #endregion add missing entity object types

        }


        private void CreateHostCodeStructures(onetouchDbContext _context)
        {

            #region get all sycEntityObjectTypes
            var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().ToListAsync().Result;
            foreach (var sycEntityObjectType in sycEntityObjectTypes)
            {
                #region add code identifier 
                var codeStructure = _context.SycIdentifierDefinitions.IgnoreQueryFilters().FirstOrDefault(
                    r => r.TenantId == null && r.Code == sycEntityObjectType.Code);
                if (codeStructure == null)
                {
                    var newSycIdentifierDefinition = new SycIdentifierDefinitions.SycIdentifierDefinition
                    {
                        Code = sycEntityObjectType.Code,
                        MaxLength = 50,
                        MaxSegmentLength = 50,
                        MinSegmentLength = 0,

                        IsTenantLevel = false,
                        NumberOfSegments = 1
                    };
                    newSycIdentifierDefinition = _context.SycIdentifierDefinitions.Add(newSycIdentifierDefinition).Entity;
                    _context.SaveChanges();

                    sycEntityObjectType.SycIdentifierDefinitionId = newSycIdentifierDefinition.Id;
                    //_context.SycEntityObjectTypes.Update(sycEntityObjectType);
                    _context.SaveChanges();
                    bool isAutoGenerated = false;
                    //if ("TENANTCONTACT|MANUALACCOUNT|MANUALACCOUNTCONTACT|MANUALACCOUNTBRANCH|".Trim().ToUpper().Contains(sycEntityObjectType.Code.Trim().ToUpper() + "|"))
                    { isAutoGenerated = true; }

                    var newSycSegmentIdentifierDefinition = new SycSegmentIdentifierDefinitions.SycSegmentIdentifierDefinition
                    {
                        Code = newSycIdentifierDefinition.Code,
                        Name = newSycIdentifierDefinition.Code,
                        SegmentNumber = 1,
                        SegmentHeader = "",
                        SegmentMask = "",
                        SegmentLength = 50,
                        SegmentType = "String",
                        IsAutoGenerated = isAutoGenerated,
                        IsEditable = true,
                        IsVisible = true,
                        CodeStartingValue = 0,
                        LookOrFieldName = "",
                        SycIdentifierDefinitionId = newSycIdentifierDefinition.Id,
                    };
                    newSycSegmentIdentifierDefinition = _context.SycSegmentIdentifierDefinitions.Add(newSycSegmentIdentifierDefinition).Entity;
                    _context.SaveChanges();

                }
                #endregion add code identifier 
            }

            #endregion get all sycEntityObjectTypes

        }


        protected IDisposable UsingTenantId(int? tenantId)
        {
            var previousTenantId = AbpSession.TenantId;
            AbpSession.TenantId = tenantId;
            return new DisposeAction(() => AbpSession.TenantId = previousTenantId);
        }

        protected void UsingDbContext(Action<onetouchDbContext> action)
        {
            UsingDbContext(AbpSession.TenantId, action);
        }

        protected Task UsingDbContextAsync(Func<onetouchDbContext, Task> action)
        {
            return UsingDbContextAsync(AbpSession.TenantId, action);
        }

        protected TResult UsingDbContext<TResult>(Func<onetouchDbContext, TResult> func)
        {
            return UsingDbContext(AbpSession.TenantId, func);
        }

        protected Task<TResult> UsingDbContextAsync<TResult>(Func<onetouchDbContext, Task<TResult>> func)
        {
            return UsingDbContextAsync(AbpSession.TenantId, func);
        }

        protected void UsingDbContext(int? tenantId, Action<onetouchDbContext> action)
        {
            using (UsingTenantId(tenantId))
            {
                using (var context = LocalIocManager.Resolve<onetouchDbContext>())
                {
                    action(context);
                    context.SaveChanges();
                }
            }
        }

        protected async Task UsingDbContextAsync(int? tenantId, Func<onetouchDbContext, Task> action)
        {
            using (UsingTenantId(tenantId))
            {
                using (var context = LocalIocManager.Resolve<onetouchDbContext>())
                {
                    await action(context);
                    await context.SaveChangesAsync();
                }
            }
        }

        protected TResult UsingDbContext<TResult>(int? tenantId, Func<onetouchDbContext, TResult> func)
        {
            TResult result;

            using (UsingTenantId(tenantId))
            {
                using (var context = LocalIocManager.Resolve<onetouchDbContext>())
                {
                    result = func(context);
                    context.SaveChanges();
                }
            }

            return result;
        }

        protected async Task<TResult> UsingDbContextAsync<TResult>(int? tenantId, Func<onetouchDbContext, Task<TResult>> func)
        {
            TResult result;

            using (UsingTenantId(tenantId))
            {
                using (var context = LocalIocManager.Resolve<onetouchDbContext>())
                {
                    result = await func(context);
                    await context.SaveChangesAsync();
                }
            }

            return result;
        }

        #region Login

        protected void LoginAsHostAdmin()
        {
            LoginAsHost(AbpUserBase.AdminUserName);
        }

        protected void LoginAsDefaultTenantAdmin()
        {
            LoginAsTenant(AbpTenantBase.DefaultTenantName, AbpUserBase.AdminUserName);
        }

        protected void LoginAsHost(string userName)
        {
            AbpSession.TenantId = null;

            var user = UsingDbContext(context => context.Users.FirstOrDefault(u => u.TenantId == AbpSession.TenantId && u.UserName == userName));
            if (user == null)
            {
                throw new Exception("There is no user: " + userName + " for host.");
            }

            AbpSession.UserId = user.Id;
        }

        protected void LoginAsTenant(string tenancyName, string userName)
        {
            AbpSession.TenantId = null;

            var tenant = UsingDbContext(context => context.Tenants.FirstOrDefault(t => t.TenancyName == tenancyName));
            if (tenant == null)
            {
                throw new Exception("There is no tenant: " + tenancyName);
            }

            AbpSession.TenantId = tenant.Id;

            var user = UsingDbContext(context => context.Users.FirstOrDefault(u => u.TenantId == AbpSession.TenantId && u.UserName == userName));
            if (user == null)
            {
                throw new Exception("There is no user: " + userName + " for tenant: " + tenancyName);
            }

            AbpSession.UserId = user.Id;
        }

        #endregion

        #region GetCurrentUser

        /// <summary>
        /// Gets current user if <see cref="IAbpSession.UserId"/> is not null.
        /// Throws exception if it's null.
        /// </summary>
        protected User GetCurrentUser()
        {
            var userId = AbpSession.GetUserId();
            return UsingDbContext(context => context.Users.Single(u => u.Id == userId));
        }

        /// <summary>
        /// Gets current user if <see cref="IAbpSession.UserId"/> is not null.
        /// Throws exception if it's null.
        /// </summary>
        protected async Task<User> GetCurrentUserAsync()
        {
            var userId = AbpSession.GetUserId();
            return await UsingDbContext(context => context.Users.SingleAsync(u => u.Id == userId));
        }

        #endregion

        #region GetCurrentTenant

        /// <summary>
        /// Gets current tenant if <see cref="IAbpSession.TenantId"/> is not null.
        /// Throws exception if there is no current tenant.
        /// </summary>
        protected Tenant GetCurrentTenant()
        {
            var tenantId = AbpSession.GetTenantId();
            return UsingDbContext(null, context => context.Tenants.Single(t => t.Id == tenantId));
        }

        /// <summary>
        /// Gets current tenant if <see cref="IAbpSession.TenantId"/> is not null.
        /// Throws exception if there is no current tenant.
        /// </summary>
        protected async Task<Tenant> GetCurrentTenantAsync()
        {
            var tenantId = AbpSession.GetTenantId();
            return await UsingDbContext(null, context => context.Tenants.SingleAsync(t => t.Id == tenantId));
        }

        #endregion

        #region GetTenant / GetTenantOrNull

        protected Tenant GetTenant(string tenancyName)
        {
            return UsingDbContext(null, context => context.Tenants.Single(t => t.TenancyName == tenancyName));
        }

        protected async Task<Tenant> GetTenantAsync(string tenancyName)
        {
            return await UsingDbContext(null, async context => await context.Tenants.SingleAsync(t => t.TenancyName == tenancyName));
        }

        protected Tenant GetTenantOrNull(string tenancyName)
        {
            return UsingDbContext(null, context => context.Tenants.FirstOrDefault(t => t.TenancyName == tenancyName));
        }

        protected async Task<Tenant> GetTenantOrNullAsync(string tenancyName)
        {
            return await UsingDbContext(null, async context => await context.Tenants.FirstOrDefaultAsync(t => t.TenancyName == tenancyName));
        }

        #endregion

        #region GetRole

        protected Role GetRole(string roleName)
        {
            return UsingDbContext(context => context.Roles.Single(r => r.Name == roleName && r.TenantId == AbpSession.TenantId));
        }

        protected async Task<Role> GetRoleAsync(string roleName)
        {
            return await UsingDbContext(async context => await context.Roles.SingleAsync(r => r.Name == roleName && r.TenantId == AbpSession.TenantId));
        }

        #endregion

        #region GetUserByUserName

        protected User GetUserByUserName(string userName)
        {
            var user = GetUserByUserNameOrNull(userName);
            if (user == null)
            {
                throw new Exception("Can not find a user with username: " + userName);
            }

            return user;
        }

        protected async Task<User> GetUserByUserNameAsync(string userName)
        {
            var user = await GetUserByUserNameOrNullAsync(userName);
            if (user == null)
            {
                throw new Exception("Can not find a user with username: " + userName);
            }

            return user;
        }

        protected User GetUserByUserNameOrNull(string userName)
        {
            return UsingDbContext(context =>
                context.Users.FirstOrDefault(u =>
                    u.UserName == userName &&
                    u.TenantId == AbpSession.TenantId
                    ));
        }

        protected async Task<User> GetUserByUserNameOrNullAsync(string userName, bool includeRoles = false)
        {
            return await UsingDbContextAsync(async context =>
                await context.Users
                    .IncludeIf(includeRoles, u => u.Roles)
                    .FirstOrDefaultAsync(u =>
                            u.UserName == userName &&
                            u.TenantId == AbpSession.TenantId
                    ));
        }

        #endregion
    }
}
using System;
using System.Linq;
using Abp;
using Abp.Authorization;
using Abp.Authorization.Roles;
using Abp.Authorization.Users;
using Abp.MultiTenancy;
using Abp.Localization;
using Abp.Notifications;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users;
using onetouch.EntityFrameworkCore;
using onetouch.Notifications;
using onetouch.SystemObjects.Dtos;

namespace onetouch.Migrations.Seed.Host
{
    public class HostRoleAndUserCreator
    {
        private readonly onetouchDbContext _context;

        public HostRoleAndUserCreator(onetouchDbContext context)
        {
            _context = context;
        }

        public void Create()
        {
            CreateHostRoleAndUsers();
            CreateHostObjectEntityTypes();
            CreateHostCodeStructures();
            CreateHostFileExt();
            CreateHostSystemData();
            CreateHostObjectEntityStatus();
        }

        private void CreateHostRoleAndUsers()
        {
            //Admin role for host

            var adminRoleForHost = _context.Roles.IgnoreQueryFilters().FirstOrDefault(r => r.TenantId == null && r.Name == StaticRoleNames.Host.Admin);
            if (adminRoleForHost == null)
            {
                adminRoleForHost = _context.Roles.Add(new Role(null, StaticRoleNames.Host.Admin, StaticRoleNames.Host.Admin) { IsStatic = true, IsDefault = true }).Entity;
                _context.SaveChanges();
            }

            //admin user for host

            var adminUserForHost = _context.Users.IgnoreQueryFilters().FirstOrDefault(u => u.TenantId == null && u.UserName == AbpUserBase.AdminUserName);
            if (adminUserForHost == null)
            {
                var user = new User
                {
                    TenantId = null,
                    UserName = AbpUserBase.AdminUserName,
                    Name = "admin",
                    Surname = "admin",
                    EmailAddress = "admin@aspnetzero.com",
                    IsEmailConfirmed = true,
                    ShouldChangePasswordOnNextLogin = false,
                    IsActive = true,
                    Password = "AM4OLBpptxBYmM79lGOX9egzZk3vIQU3d/gFCJzaBjAPXzYIK3tQ2N7X4fcrHtElTw==" //123qwe
                };

                user.SetNormalizedNames();

                adminUserForHost = _context.Users.Add(user).Entity;
                _context.SaveChanges();

                //Assign Admin role to admin user
                _context.UserRoles.Add(new UserRole(null, adminUserForHost.Id, adminRoleForHost.Id));
                _context.SaveChanges();

                //User account of admin user
                _context.UserAccounts.Add(new UserAccount
                {
                    TenantId = null,
                    UserId = adminUserForHost.Id,
                    UserName = AbpUserBase.AdminUserName,
                    EmailAddress = adminUserForHost.EmailAddress
                });

                _context.SaveChanges();

                //Notification subscriptions
                _context.NotificationSubscriptions.Add(new NotificationSubscriptionInfo(SequentialGuidGenerator.Instance.Create(), null, adminUserForHost.Id, AppNotificationNames.NewTenantRegistered));
                _context.NotificationSubscriptions.Add(new NotificationSubscriptionInfo(SequentialGuidGenerator.Instance.Create(), null, adminUserForHost.Id, AppNotificationNames.NewUserRegistered));

                _context.SaveChanges();
            }
        }

        private void CreateHostObjectEntityTypes()
        {
            #region Add missing SydObjects

            var ObjectTypeCodeEntity = _context.SysObjectTypes.IgnoreQueryFilters().FirstOrDefault(
                r => r.Code == "ENTITY");
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

            var sydObjects_Listing = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
         r => r.Code == "LISTING");
            if (sydObjects_Listing == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_Listing = new SystemObjects.SydObject
                {
                    Code = "LISTING",
                    Name = "Listing",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_Listing);
                _context.SaveChanges();
            }
            //T-SII-20230222.0003,1 MMT 02/28/2023 Internal Server Error during your request - when saving a new size scale[Start]
            var sydObjects_SizeScale = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
             r => r.Code == "SCALE");
            if (sydObjects_SizeScale == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_SizeScale = new SystemObjects.SydObject
                {
                    Code = "SCALE",
                    Name = "Scale",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_SizeScale);
                _context.SaveChanges();
            }
            //T-SII-20230222.0003,1 MMT 02/28/2023 Internal Server Error during your request - when saving a new size scale[End]
            #endregion Add missing SydObjects

            #region Add missing sycEntityObjectTypes
            var parents = "ITEM,ITEM,ITEM,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,SCALE".ToUpper().Split(',');
            var codes = "PRODUCTVARIATION,PRODUCT,LISTINGVARIATION,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,TenantBranch,TenantAddress,TenantContact,ManualAccount,ManualAccountBranch,ManualAccountAddress,ManualAccountContact,SIZESCALE".ToUpper().Split(',');
            var names = "Product Variation,Product,Listing Variation,Listing,Category,Department,Classification,Tenant Branch,Tenant Address,Tenant Contact,Manual Account,Manual Account Branch,Manual Account Address,Manual Account Contact,Size Scale".Split(',');

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

        private void CreateHostObjectEntityStatus()
        {


            #region Add  sycEntityObject status for listing
            var ObjectCode = "ITEMS-LIST";
            var codes = "HOLD,ACTIVE,CANCELLED,DRAFT".ToUpper().Split(',');
            var names = "Hold,Active,Cancelled,Draft".Split(',');
            
            for (int i = 0; i < codes.Length; i++)
            {
                var sydObjects = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
                    r => r.Code == ObjectCode);
                if (sydObjects != null && sydObjects.Id > 0)
                {
                    var SycEntityObjectStatuses = _context.SycEntityObjectStatuses.IgnoreQueryFilters().FirstOrDefault(
                        r => r.TenantId == null && r.Code == codes[i] && r.ObjectId == sydObjects.Id);

                    if (sydObjects != null && sydObjects.Id > 0 &&
                        SycEntityObjectStatuses == null)
                    {
                        SycEntityObjectStatuses = new SystemObjects.SycEntityObjectStatus()
                        {
                            Code = codes[i],
                            Name = names[i],
                            ObjectId = sydObjects.Id,
                            ObjectCode = sydObjects.Code,
                            IsDefault = codes[i]=="ACTIVE"?true:false

                        };
                        _context.SycEntityObjectStatuses.Add(SycEntityObjectStatuses);
                        _context.SaveChanges();
                    }
                }
            }
            #endregion add missing entity object types

        }
        private void CreateHostCodeStructures()
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
                    if ("CATEGORY|DEPARTMENT|CLASSIFICATION|POST|TENANTCONTACT|MANUALACCOUNT|MANUALACCOUNTCONTACT|MANUALACCOUNTBRANCH|".Trim().ToUpper().Contains(sycEntityObjectType.Code.Trim().ToUpper()+"|"))
                    { isAutoGenerated = true; }
                    bool isVisible = true;
                    if ("CATEGORY|DEPARTMENT|CLASSIFICATION|".Trim().ToUpper().Contains(sycEntityObjectType.Code.Trim().ToUpper() + "|"))
                    { isVisible = false; }

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
                        IsVisible = isVisible,
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


        private void CreateHostFileExt()
        {

            #region Add missing SycAttachmentCategories
            var type = "1,1,1,1,0,0,1,0,0,0,1,1,1".ToUpper().Split(',');
            var maxLength = "5,5,5,5,NULL,NULL,5,NULL,NULL,NULL,5,5,5".ToUpper().Split(',');
            var aspectRatio = "1:1,200:49,127:100,127:100,NULL,NULL,200:49,NULL,NULL,NULL,200:49,6:5,3:1".ToUpper().Split(',');
            var entityObjectType = "PARTNER,PARTNER,PARTNER,PERSON,PRODUCT,MESSAGE,PERSON,PARTNER,NULL,NULL,NULL,NULL,NULL".ToUpper().Split(',');
            var parent = "NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,IMAGE".ToUpper().Split(',');
            var codes = "LOGO,BANNER,IMAGE,PHOTO,IMAGE,FILE,COVER-PHOTO,VIDEO,FILE,DEFAULT-IMAGE,COVER,CTASLIDER,AUTOSLIDERQ".ToUpper().Split(',');
            var names = "Logo,Banner,Image,Photo,Image,File,Cover Photo,Video,File,Default-image,Cover,CTASlider, AutoSlider".Split(',');

            for (int i = 0; i < codes.Length; i++)
            {
                var sycAttachmentCategories = _context.SycAttachmentCategories.IgnoreQueryFilters().FirstOrDefault(
                    r => r.Code == codes[i]);
                var xx = int.Parse(type[i]);
                if (sycAttachmentCategories == null || sycAttachmentCategories.Id == 0  )
                {   
                    sycAttachmentCategories = new SystemObjects.SycAttachmentCategory
                    {
                        Code = codes[i],
                        Name = names[i],
                        AspectRatio = maxLength[i] == "NULL" ? null : aspectRatio[i],
                        MaxFileSize = null
                    };

                    if (type[i] != "0")
                    { sycAttachmentCategories.Type = (AttachmentType)int.Parse(type[i]); }

                    if (aspectRatio[i] != "NULL")
                    { sycAttachmentCategories.MaxFileSize = int.Parse(maxLength[i]); }

                    if (entityObjectType[i] != "NULL")
                    {
                        var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().FirstOrDefault(
                          r => r.TenantId == null && r.Code == entityObjectType[i]);

                        sycAttachmentCategories.EntityObjectTypeId = sycEntityObjectTypes.Id;
                    }
                    if (parent[i] != "NULL")
                    {
                        var sycEntityObjectTypes = _context.SycAttachmentCategories.IgnoreQueryFilters().FirstOrDefault(
                          r => r.Code == parent[i]);
                        sycAttachmentCategories.ParentId = sycEntityObjectTypes.Id;
                    }
                    _context.SycAttachmentCategories.Add(sycAttachmentCategories);
                    _context.SaveChanges();
                }
            }
            #endregion SycAttachmentCategories


            #region Add missing SycAttachmentCategories
            var extType = "1,1,1,1".ToUpper().Split(',');
            var extension = "png,jpg,jpeg,webp".ToUpper().Split(',');
            var extNames = "PNG,JPG,JPEG,WEBP".Split(',');

            for (int i = 0; i < extNames.Length; i++)
            {
                var sycAttachmentTypes = _context.SycAttachmentTypes.IgnoreQueryFilters().FirstOrDefault(
                    r => r.Name == extNames[i]);

                if (sycAttachmentTypes == null || sycAttachmentTypes.Id == 0)
                {
                    sycAttachmentTypes = new SystemObjects.SycAttachmentType
                    { 
                        Name = extNames[i],
                        Extension = extension[i],
                        Type = (AttachmentType)int.Parse(type[i])

                    };
                     
                    _context.SycAttachmentTypes.Add(sycAttachmentTypes);
                    _context.SaveChanges();
                }
            }
            #endregion SycAttachmentCategories


        }

        private void CreateHostSystemData()
        {
            #region Add missing SycEntityObjectTypes
            var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().ToList();
            if (sycEntityObjectTypes == null || sycEntityObjectTypes.Count > 0)
            {
                var languagesList = _context.Languages.IgnoreQueryFilters().ToList();
                if (languagesList != null)
                {
                    foreach (var sycEntityObjectType in sycEntityObjectTypes)
                    {

                        foreach (var lang in languagesList)
                        {
                            var sycEntityObjectTypeExist = _context.LanguageTexts.FirstOrDefaultAsync(x => x.Key == ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + sycEntityObjectType.Name).Trim().ToUpper() && x.LanguageName == lang.Name).Result;
                            if (sycEntityObjectTypeExist == null ||
                                (sycEntityObjectTypeExist != null && sycEntityObjectTypeExist.Id == 0))
                            {
                                ApplicationLanguageText entity = new ApplicationLanguageText();

                                entity.Key = ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + sycEntityObjectType.Name).Trim().ToUpper();
                                entity.Source = "onetouch";
                                entity.Value = sycEntityObjectType.Name;
                                entity.LanguageName = lang.Name;
                                entity.TenantId = sycEntityObjectType.TenantId;
                                _context.LanguageTexts.Add(entity);

                            }
                        }

                    }
                }
                _context.SaveChanges();
            }
            #endregion SycEntityObjectTypes

        }

    }
}
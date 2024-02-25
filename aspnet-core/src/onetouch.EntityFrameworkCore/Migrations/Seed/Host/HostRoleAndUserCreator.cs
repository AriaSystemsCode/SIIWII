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
using Castle.MicroKernel.Registration;
using onetouch.SystemObjects;
using PayPalCheckoutSdk.Orders;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
            CreateHostReportSystemData();
            //MMT-Iteration37[Start]
            CreateMessagesCategories();
            //MMT-Iteration37[End]
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
            #region iteration 31 add contact/person,Group and Business
            var sydObjects_Contact = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
           r => r.Code == "CONTACT");
            if (sydObjects_Contact == null && sydObjects_Contact.Id > 0)
            {
                var sycEntityObjectType_Contact = new SystemObjects.SycEntityObjectType
                {
                    Code = "PERSONAL",
                    Name = "Personal",
                    ObjectCode = sydObjects_Contact.Code,
                    ObjectId = sydObjects_Contact.Id
                };
                _context.SycEntityObjectTypes.Add(sycEntityObjectType_Contact);
                _context.SaveChanges();
            }
            #endregion

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


            //Iteration#29,1 MMT News Digest changes[Start]
            var sycIdentifierDefinitionsObj = _context.SycIdentifierDefinitions.FirstOrDefault(
             r => r.Code == "NEWSDIGEST");
            if (sycIdentifierDefinitionsObj == null)
            {
                sycIdentifierDefinitionsObj = new SycIdentifierDefinitions.SycIdentifierDefinition
                {
                    Code = "NEWSDIGEST",
                    IsTenantLevel = false,
                    TenantId = null,
                    NumberOfSegments = 1,
                    MaxLength = 50,
                    MaxSegmentLength = 50,
                    MinSegmentLength = 0
                };
                _context.SycIdentifierDefinitions.Add(sycIdentifierDefinitionsObj);
                _context.SaveChanges();
            }
            var sycIdentifierDefinitionsObject = _context.SycIdentifierDefinitions.FirstOrDefault(
            r => r.Code == "NEWSDIGEST");
            var sydObjects_Post = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
            r => r.Name == "Post");
            var ObjectTypeCodeData = _context.SysObjectTypes.IgnoreQueryFilters().FirstOrDefault(
               r => r.Code == "DATA");
            var sydObjects_NewsDigest = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
             r => r.Code == "NEWSDIGEST");
            if (sydObjects_NewsDigest == null && ObjectTypeCodeData != null && ObjectTypeCodeData.Id > 0 && sydObjects_Post != null && sydObjects_Post.Id > 0)
            {
                sydObjects_NewsDigest = new SystemObjects.SydObject
                {
                    Code = "NEWSDIGEST",
                    Name = "News Digest",
                    ObjectTypeCode = ObjectTypeCodeData.Code,
                    ObjectTypeId = ObjectTypeCodeData.Id,
                    ParentCode = sydObjects_Post.Code,
                    ParentId = sydObjects_Post.Id
                };
                _context.SydObjects.Add(sydObjects_NewsDigest);
                _context.SaveChanges();
                var sydObjects_NewDigestObj = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
                  r => r.Code == "NEWSDIGEST");

                var sycEntityObjectTypes_Post = _context.SycEntityObjectTypes.IgnoreQueryFilters().FirstOrDefault(
              r => r.TenantId == null && r.Code == "POST");

                var sycEntityObjectTypes_News = _context.SycEntityObjectTypes.IgnoreQueryFilters().FirstOrDefault(
                               r => r.TenantId == null && r.Code == "NEWSDIGEST");
                if (sycEntityObjectTypes_News == null && sydObjects_NewDigestObj != null && sydObjects_NewDigestObj.Id > 0
                    && sycEntityObjectTypes_Post != null && sycEntityObjectTypes_Post.Id > 0)
                {
                    sycEntityObjectTypes_News = new SystemObjects.SycEntityObjectType()
                    {
                        Code = "NEWSDIGEST",
                        Name = "News Digest",
                        ObjectId = sydObjects_NewDigestObj.Id,
                        ObjectCode = sydObjects_NewDigestObj.Code,
                        ParentId = sycEntityObjectTypes_Post.Id,
                        ParentCode = sycEntityObjectTypes_Post.Code,
                        SycIdentifierDefinitionId = sycIdentifierDefinitionsObject == null ? null : sycIdentifierDefinitionsObject.Id
                    };
                    _context.SycEntityObjectTypes.Add(sycEntityObjectTypes_News);
                    _context.SaveChanges();

                }
            }

            //Iteration#29,1 MMT News Digest changes[End]
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
            //MMT33[Start]
            var sydObjects_Transaction = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
        r => r.Code == "TRANSACTION");
            if (sydObjects_Transaction == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_Transaction = new SystemObjects.SydObject
                {
                    Code = "TRANSACTION",
                    Name = "Transaction",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_Transaction);
                _context.SaveChanges();
            }
            //MMT33[End]
            #endregion Add missing SydObjects

            #region Add missing sycEntityObjectTypes
            var parents = "LOOKUP,ITEM,ITEM,ITEM,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,CONTACT,SCALE,TRANSACTION,TRANSACTION,LOOKUP".ToUpper().Split(',');
            var codes = "BACKGROUND,PRODUCTVARIATION,PRODUCT,LISTINGVARIATION,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,TenantBranch,TenantAddress,TenantContact,ManualAccount,ManualAccountBranch,ManualAccountAddress,ManualAccountContact,SIZESCALE,SALESORDER,PURCHASEORDER,SHIPVIA".ToUpper().Split(',');
            var names = "Background,Product Variation,Product,Listing Variation,Listing,Category,Department,Classification,Tenant Branch,Tenant Address,Tenant Contact,Manual Account,Manual Account Branch,Manual Account Address,Manual Account Contact,Size Scale,Sales Order,Purchase Order,Ship Via".Split(',');

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
                            IsDefault = codes[i] == "ACTIVE" ? true : false

                        };
                        _context.SycEntityObjectStatuses.Add(SycEntityObjectStatuses);
                        _context.SaveChanges();
                    }
                }
            }
            #endregion add missing entity object types
            //MMT33[Start]
            #region Add  sycEntityObject status for listing
            ObjectCode = "TRANSACTION";
            codes = "HOLD,ACTIVE,CANCELLED,DRAFT,COMPLETE,OPEN".ToUpper().Split(',');
            names = "Hold,Active,Cancelled,Draft,Complete,Open".Split(',');

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
                            IsDefault = codes[i] == "OPEN" ? true : false

                        };
                        _context.SycEntityObjectStatuses.Add(SycEntityObjectStatuses);
                        _context.SaveChanges();
                    }
                }
            }
            #endregion add missing entity object types
            //MMT33[End]

        }

        private void CreateHostCodeStructures()
        {

            #region get all sycEntityObjectTypes
            var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(e => e.SycIdentifierDefinitionId == null || e.SycIdentifierDefinitionId < 1).ToListAsync().Result;
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
                    if ("CATEGORY|DEPARTMENT|CLASSIFICATION|POST|TENANTCONTACT|MANUALACCOUNT|MANUALACCOUNTCONTACT|MANUALACCOUNTBRANCH|".Trim().ToUpper().Contains(sycEntityObjectType.Code.Trim().ToUpper() + "|"))
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
            var type = "1,1,1,1,1,1,0,0,1,0,0,0,1,1,1".ToUpper().Split(',');
            var maxLength = "5,5,5,5,5,5,NULL,NULL,5,NULL,NULL,NULL,5,5,5".ToUpper().Split(',');
            var aspectRatio = "1.29,0.772,1:1,200:49,127:100,127:100,NULL,NULL,200:49,NULL,NULL,NULL,200:49,6:5,3:1".ToUpper().Split(',');
            var entityObjectType = "BACKGROUND,BACKGROUND,PARTNER,PARTNER,PARTNER,PERSON,PRODUCT,MESSAGE,PERSON,PARTNER,NULL,NULL,NULL,NULL,NULL".ToUpper().Split(',');
            var parent = "NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,IMAGE".ToUpper().Split(',');
            var codes = "LETTER-LANDSCAPE,LETTER-PORTRAIT,LOGO,BANNER,IMAGE,PHOTO,IMAGE,FILE,COVER-PHOTO,VIDEO,FILE,DEFAULT-IMAGE,COVER,CTASLIDER,AUTOSLIDERQ".ToUpper().Split(',');
            var names = "Letter Landscape,Letter Portrait,Logo,Banner,Image,Photo,Image,File,Cover Photo,Video,File,Default-image,Cover,CTASlider, AutoSlider".Split(',');

            for (int i = 0; i < codes.Length; i++)
            {
                var sycAttachmentCategories = _context.SycAttachmentCategories.IgnoreQueryFilters().FirstOrDefault(
                    r => r.Code == codes[i]);
                var xx = int.Parse(type[i]);
                if (sycAttachmentCategories == null || sycAttachmentCategories.Id == 0)
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
            var keyList = _context.LanguageTexts.Select(e => e.Key).ToList();

            var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(e => !keyList.Contains(("SYCENTITYOBJECTTYPES-NAME-" + e.Id.ToString() + "-" + e.Name).Trim().ToUpper())).ToList();
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

        private void CreateHostReportSystemData()
        {
            #region Add sydReports
            var keyList = _context.LanguageTexts.Select(e => e.Key).ToList();

            //var sycEntityObjectTypes = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "OrderConfirmationForm1").ToList();
            //if (sycEntityObjectTypes == null || sycEntityObjectTypes.Count < 1)
            //{
            //    SycReport sycReport = new SycReport();
            //    sycReport.Name = "OrderConfirmationForm1";

            //    sycReport.Code = "7";
            //    sycReport.Name = "OrderConfirmationForm1";
            //    sycReport.Description = "Order confirmation form 1";
            //    sycReport.Thumbnail = "Order confirmation form 1";
            //    sycReport.EntityObjectTypeId = 97;

            //    _context.SycReports.Add(sycReport);


            //    _context.SaveChanges();
            //}

            var sycReports = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate8").ToList();
            if (sycReports == null || sycReports.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate8";

                sycReport.Code = "7";
                sycReport.Name = "ProductsCatalogTemplate8";
                sycReport.Description = "(8 Products Per Page) Layout - Landscape Orientation";
                sycReport.Thumbnail = "ProductsCatalogTemplate8";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports9 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate9").ToList();
            if (sycReports9 == null || sycReports9.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate9";

                sycReport.Code = "7";
                sycReport.Name = "ProductsCatalogTemplate9";
                sycReport.Description = "(6 Products Per Page) Layout - Portrait Orientation";
                sycReport.Thumbnail = "ProductsCatalogTemplate9";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports10 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate10").ToList();
            if (sycReports10 == null || sycReports10.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate10";

                sycReport.Code = "7";
                sycReport.Name = "ProductsCatalogTemplate10";
                sycReport.Description = "1 Product per page - Without ATS";
                sycReport.Thumbnail = "ProductsCatalogTemplate10";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports11 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate11").ToList();
            if (sycReports11 == null || sycReports10.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate11";

                sycReport.Code = "7";
                sycReport.Name = "ProductsCatalogTemplate11";
                sycReport.Description = "1 Product per page - With ATS";
                sycReport.Thumbnail = "ProductsCatalogTemplate11";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }
            #endregion SycEntityObjectTypes

        }
        //MMT-Iteration37[Start]
        private void CreateMessagesCategories()
        {
            var messageObject =  _context.SydObjects.Where(z => z.Code == "MESSAGE" && z.IsDeleted == false).FirstOrDefault();
            if (messageObject != null)
            {
                var primaryObject = _context.SycEntityObjectCategories.Where(z => z.Code == "PRIMARY-MESSAGE" && z.ObjectId == messageObject.Id).FirstOrDefault();
                if (primaryObject == null)
                {
                    primaryObject = new SycEntityObjectCategory();
                    primaryObject.ObjectId = messageObject.Id;
                    primaryObject.ParentId = null;
                    primaryObject.TenantId = null;
                    primaryObject.Name = "Primary Message";
                    primaryObject.ObjectCode = messageObject.Code;
                    primaryObject.Code = "PRIMARY-MESSAGE";
                    primaryObject.IsDefault = false;
                    _context.SycEntityObjectCategories.Add(primaryObject);
                    _context.SaveChanges();
                }
                var updateCategory = _context.SycEntityObjectCategories.Where(z => z.Code == "UPDATE-MESSAGE" && z.ObjectId == messageObject.Id).FirstOrDefault();
                if (updateCategory == null)
                {
                    updateCategory = new SycEntityObjectCategory();
                    updateCategory.ObjectId = messageObject.Id;
                    updateCategory.ParentId = null;
                    updateCategory.TenantId = null;
                    updateCategory.Name = "Update Message";
                    updateCategory.ObjectCode = messageObject.Code;
                    updateCategory.Code = "UPDATE-MESSAGE";
                    updateCategory.IsDefault = false;
                    _context.SycEntityObjectCategories.Add(updateCategory);
                    _context.SaveChanges();
                }

            }
        }
        //MMT-Iteration37[End]

    }
}
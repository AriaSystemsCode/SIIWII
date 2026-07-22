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
using Abp.Runtime.Session;
using onetouch.Configuration;
using System.IO;
using System.Threading.Tasks;
using Abp.Domain.Entities;
using System.Collections.Generic;
using Abp.Threading;


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
            //CreateHostSystemData();
            
            CreateHostObjectEntityStatus();
            CreateHostReportSystemData();
            //MMT-Iteration37[Start]
            //CreateMessagesCategories();
            //MMT-Iteration37[End]
            SeedExtraAttributes();
            AsyncHelper.RunSync(() => CreateHostSystemData());

        }

        private async Task AddMissingTextsAsync<T>(
    IQueryable<T> query,
    string keyPrefix,
    List<ApplicationLanguage> languages,
    HashSet<string> existingKeys)
    where T : class, IEntity<long>
        {
            var items = await query.IgnoreQueryFilters().ToListAsync();

            if (!items.Any())
                return;

            foreach (var item in items)
            {
                var id = item.Id;
                var name = item.GetType().GetProperty("Name")?.GetValue(item)?.ToString();

                if (string.IsNullOrWhiteSpace(name))
                    continue;

                var baseKey = (keyPrefix + id + "-" + name).Trim().ToUpper();

                foreach (var lang in languages)
                {
                    var compositeKey = baseKey + "_" + lang.Name;

                    if (existingKeys.Contains(compositeKey))
                        continue;

                    _context.LanguageTexts.Add(new ApplicationLanguageText
                    {
                        Key = baseKey,
                        Source = "onetouch",
                        Value = name,
                        LanguageName = lang.Name,
                        TenantId = item.GetType().GetProperty("TenantId")?.GetValue(item) as int?
                    });

                    existingKeys.Add(compositeKey); // prevent duplicates in same run
                }
            }
        }
        private async Task CreateHostSystemData()
        {
            // ✅ Restrict supported languages
            var languagesList = await _context.Languages
                .IgnoreQueryFilters()
                //.Where(l => l.Name == "en" || l.Name == "ar")
                .ToListAsync();

            if (!languagesList.Any())
                return;

            // ✅ Load existing keys once (FAST lookup)
            var existingKeys = _context.LanguageTexts
                .IgnoreQueryFilters()
                .Select(x => x.Key + "_" + x.LanguageName)
                .ToHashSet();

            await AddMissingTextsAsync(
                _context.SycEntityObjectTypes,
                "SYCENTITYOBJECTTYPES-NAME-",
                languagesList,
                existingKeys
            );

            await AddMissingTextsAsync(
                _context.SycEntityObjectClassifications,
                "SYCENTITYOBJECTCLASSIFICATIONS-NAME-",
                languagesList,
                existingKeys
            );

            await AddMissingTextsAsync(
                _context.SycEntityObjectCategories,
                "SYCENTITYOBJECTCATEGORIES-NAME-",
                languagesList,
                existingKeys
            );

            await _context.SaveChangesAsync();
        }
        public void SeedExtraAttributes()
        {
            var assetsPath = Path.Combine(Directory.GetCurrentDirectory(), "Assets");

            if (!Directory.Exists(assetsPath))
                return;

            // 1. Read all XML files and extract ObjectCode and ParentCode
            var xmlFiles = Directory.GetFiles(assetsPath, "*.xml")
                .Select(file =>
                {
                    var fileInfo = new FileInfo(file);

                    string name = Path.GetFileNameWithoutExtension(file);

                    // Split by double underscore "__"
                    string objectCode = null;
                    string parentCode = null;
                    string code = null;
                    string remainder = null;

                    var parts = name.Split(new string[] { "_" }, StringSplitOptions.None);

                    if (parts.Length == 4)
                    {
                        objectCode = string.IsNullOrWhiteSpace(parts[0]) ? null : parts[0].ToUpper();
                        parentCode = string.IsNullOrWhiteSpace(parts[1]) ? null : parts[1].ToUpper();
                        code = string.IsNullOrWhiteSpace(parts[2]) ? null : parts[2].ToUpper();
                        remainder = parts[3];
                    }
                    else
                    {
                        return null; // invalid file
                    }

                    // Extract ParentCode (everything before the last underscore)
                    //int lastUnderscore = remainder.LastIndexOf('_');
                    //if (lastUnderscore < 0) return null;

                    //string parentCode = remainder.Substring(0, lastUnderscore).ToUpper();

                    // Determine the effective file time
                    DateTime? fileTime = TryParseDateTimeFromFileName(name);

                    return new
                    {
                        ObjectCode = objectCode,
                        ParentCode = parentCode,
                        Code = code,
                        Path = file,
                        FileTime = fileTime
                    };
                })
                .Where(x => x != null)
                // 2. Group by ObjectCode + ParentCode
                .GroupBy(x => new { x.ObjectCode, x.ParentCode, x.Code })
                // 3. Pick the file with the latest FileTime in each group
                .ToDictionary(
                    g => g.Key,
                    g => g.OrderByDescending(x => x.FileTime).First()
                );

            if (!xmlFiles.Any()) return;

            // 2. Load matching DB records
            var items = _context.SycEntityObjectTypes.ToList();

            // 3. Update ExtraAttributes
            foreach (var item in items)
            {
                var key = new
                {
                    ObjectCode = item.ObjectCode == null ? null : item.ObjectCode.ToUpper(),
                    ParentCode = item.ParentCode == null ? null : item.ParentCode.ToUpper(),
                    Code = (item.Code ?? "").ToUpper()
                };

                if (xmlFiles.TryGetValue(key, out var file))
                {
                    string xml = File.ReadAllText(file.Path);

                    if (!string.IsNullOrWhiteSpace(xml))
                    {
                        // Compare file time with DB record update time
                        DateTime dbUpdateTime = item.LastModificationTime ?? item.CreationTime;

                        if (file.FileTime > dbUpdateTime || string.IsNullOrEmpty(item.ExtraAttributes))
                        {
                            item.ExtraAttributes = xml;
                            item.LastModificationTime = file.FileTime;

                        }
                    }
                }
            }

            _context.SaveChanges();
        }


        // Custom parser for filenames like "HOST-2021-05-05 064208.6066667"
        private DateTime? TryParseDateTimeFromFileName(string fileName)
        {
            var parts = fileName.Split('_');
            if (parts.Length < 2)
                return null;

            string dateTimeStr = string.Join("_", parts.Skip(3)); // "2021-05-05 064208.6066667"

            // Split date and time
            var dtParts = dateTimeStr.Split(' ');
            if (dtParts.Length != 2)
                return null;

            string datePart = dtParts[0]; // "2021-05-05"
            string timePart = dtParts[1]; // "064208.6066667"

            // Parse as "yyyy-MM-ddHHmmss.fffffff"
            if (DateTime.TryParseExact(
                datePart + timePart,
                "yyyy-MM-ddHHmmss.fffffff",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None,
                out DateTime result))
            {
                return result;
            }

            return null;
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
            //MMT40[Start]
            var sydObjects_MarketplaceRelationship = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
        r => r.Code == "MARKETPLACECONTACTRELATIONSHIP");
            if (sydObjects_MarketplaceRelationship == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_MarketplaceRelationship = new SystemObjects.SydObject
                {
                    Code = "MARKETPLACECONTACTRELATIONSHIP",
                    Name = "Marketplace Contact Relationship",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_MarketplaceRelationship);
                _context.SaveChanges();
            }
            //     var sydObjects_Address = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
            //r => r.Code == "ADDRESS");
            //     if (sydObjects_Address == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            //     {
            //         sydObjects_Address = new SystemObjects.SydObject
            //         {
            //             Code = "ADDRESS",
            //             Name = "Address",
            //             ObjectTypeCode = ObjectTypeCodeEntity.Code,
            //             ObjectTypeId = ObjectTypeCodeEntity.Id
            //         };
            //         _context.SydObjects.Add(sydObjects_Address);
            //         _context.SaveChanges();
            //     }
            //MMT40[End]
            //STANDARDFEATURE,STANDARDSUBSCRIPTIONPLAN,TENANTACTIVITYLOG
            var sydObjects_StandardFeature = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
       r => r.Code == "STANDARDFEATURE");
            if (sydObjects_StandardFeature == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_StandardFeature = new SystemObjects.SydObject
                {
                    Code = "STANDARDFEATURE",
                    Name = "Standard Feature",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_StandardFeature);
                _context.SaveChanges();
            }
            var sydObjects_StandardSubscriptionPlan = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
      r => r.Code == "STANDARDSUBSCRIPTIONPLAN");
            if (sydObjects_StandardSubscriptionPlan == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_StandardSubscriptionPlan = new SystemObjects.SydObject
                {
                    Code = "STANDARDSUBSCRIPTIONPLAN",
                    Name = "Standard Subscription Plan",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_StandardSubscriptionPlan);
                _context.SaveChanges();
            }
            var sydObjects_TenantActivityLog = _context.SydObjects.IgnoreQueryFilters().FirstOrDefault(
      r => r.Code == "TENANTACTIVITYLOG");
            if (sydObjects_TenantActivityLog == null && ObjectTypeCodeEntity != null && ObjectTypeCodeEntity.Id > 0)
            {
                sydObjects_TenantActivityLog = new SystemObjects.SydObject
                {
                    Code = "TENANTACTIVITYLOG",
                    Name = "Tenant Activity Log",
                    ObjectTypeCode = ObjectTypeCodeEntity.Code,
                    ObjectTypeId = ObjectTypeCodeEntity.Id
                };
                _context.SydObjects.Add(sydObjects_TenantActivityLog);
                _context.SaveChanges();
            }
            //MMT33[End]
            #endregion Add missing SydObjects

            #region Add missing sycEntityObjectTypes
            var parents = "CONTACT,CONTACT,LOOKUP,LOOKUP,LOOKUP,ITEM,ITEM,ITEM,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,CONTACT,CONTACT,CONTACT,CONTACT,SCALE,TRANSACTION,TRANSACTION,LOOKUP,STANDARDFEATURE,STANDARDSUBSCRIPTIONPLAN,TENANTACTIVITYLOG,LOOKUP,TRANSACTION,MESSAGE-DATA,MESSAGE-DATA,MESSAGE-DATA,MESSAGE-DATA,LOOKUP,LOOKUP,LOOKUP,LOOKUP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,LOOKUP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP".ToUpper().Split(',');
            var codes = "HOST,TENANT,TRANSACTIONCHARGES,CHARGETYPES,BACKGROUND,PRODUCTVARIATION,PRODUCT,LISTINGVARIATION,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,BRANCH,BUSINESS,GROUP,PERSONAL,SIZESCALE,SALESORDER,PURCHASEORDER,SHIPVIA,STANDARDFEATURE,STANDARDSUBSCRIPTIONPLAN,TENANTACTIVITYLOG,UOM,ARINVOICE,MESSAGE,COMMENT,REVIEW,QUESTION,MARKETPLACESECTIONTYPE,MARKETPLACESECTION,MARKETPLACEBLOCKTYPE,MARKETPLACESECTIONBLOCK,P00B,P00G,P00P,B00P,B00G,B00B,G00P,G00B,MARKETPLACECONTACTRELATIONSHIP,S00B,S0SR,S0BO,B00S,B0SR,B0BO,SR0S,SR0B,SRBO,BO0S,BO0B,BOSR,G00G".ToUpper().Split(',');
            var names = "HOST,TENANT,Transaction Charges,Charge Types,Background,Product Variation,Product,Listing Variation,Listing,Category,Department,Classification,Branch,BUSINESS,Group,Personal,Size Scale,Sales Order,Purchase Order,Ship Via,Standard Feature,Standard Subscription Plan,Tenant Activity Log,Unit Of Measurement,AR Invoice,Message,Comment,Review,Question,Marketplace Section Type,Marketplace Section,Marketplace Block Type,Marketplace Section Block,Person follow Business,Person join Group,Person follow Person,Business hire Person,Business join Group,Business follow Business,Group invite Person,Group invite Business,Marketplace Contact Relationship,Sell to this Buyer,Connect to this Sales agent,Sell to this Buying Office,Buy from this Seller,Buy from this Sales agent,Connect to this Buying agent,Sell on behalf of this Seller,Sell to this Buyer,Connect to this Buying agent,Buy from this Seller,Buy on behalf this Buyer,Connect to this Sales agent,Group follow Group".Split(',');
            //var parents = "LOOKUP,ITEM,ITEM,ITEM,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,CONTACT,CONTACT,CONTACT,CONTACT,SCALE,TRANSACTION,TRANSACTION,LOOKUP,STANDARDFEATURE,STANDARDSUBSCRIPTIONPLAN,TENANTACTIVITYLOG,LOOKUP,TRANSACTION,MESSAGE-DATA,MESSAGE-DATA,MESSAGE-DATA,MESSAGE-DATA,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,MARKETPLACECONTACTRELATIONSHIP,LOOKUP".ToUpper().Split(',');
            //var codes = "BACKGROUND,PRODUCTVARIATION,PRODUCT,LISTINGVARIATION,LISTING,CATEGORY,DEPARTMENT,CLASSIFICATION,BRANCH,BUSINESS,GROUP,PERSONAL,SIZESCALE,SALESORDER,PURCHASEORDER,SHIPVIA,STANDARDFEATURE,STANDARDSUBSCRIPTIONPLAN,TENANTACTIVITYLOG,UOM,ARINVOICE,MESSAGE,COMMENT,REVIEW,QUESTION,PTB,PTG,PTP,BTP,BTG,BTB,GTP,GTB,MARKETPLACECONTACTRELATIONSHIP".ToUpper().Split(',');
            //var names = "Background,Product Variation,Product,Listing Variation,Listing,Category,Department,Classification,Branch,BUSINESS,Group,Personal,Size Scale,Sales Order,Purchase Order,Ship Via,Standard Feature,Standard Subscription Plan,Tenant Activity Log,Unit Of Measurement,AR Invoice,Message,Comment,Review,Question,Person relation with Business,Person relation with Group,Person relation with Person,Business relation with Person,Business relation with Group,Business relation with Business,Group relation with Person,Group relation with Business,Marketplace Contact Relationship".Split(',');

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
            //MMT43[Start]
            #region Add  sycEntityObject status for features
            ObjectCode = "STANDARDFEATURE";
            codes = "ACTIVE,INACTIVE".ToUpper().Split(',');
            names = "Active,Inactive".Split(',');
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
            #endregion
            #region Add  sycEntityObject status for Plans
            ObjectCode = "STANDARDSUBSCRIPTIONPLAN";
            codes = "ACTIVE,INACTIVE,DRAFT,SUSPENDED".ToUpper().Split(',');
            names = "Active,Inactive,Draft,Suspended".Split(',');
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
            #endregion
            //MMT43[End]
            //MMT-EntityLog[Start]
            ObjectCode = "TRANSACTION";
            codes = "READYTOBESENT,SENT".ToUpper().Split(',');
            names = "Ready to be Sent,Sent".Split(',');
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
            //MMT-EntityLog[End]
            //I49-[Start]
            ObjectCode = "LOOKUP";
            codes = "ACTIVE,INACTIVE".ToUpper().Split(',');
            names = "Active,Inactive".Split(',');
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

            //MMT-EntityLog[End]
            //MMT40[Start]
            ObjectCode = "MARKETPLACECONTACTRELATIONSHIP";
            codes = "ACTIVE,INACTIVE,PENDING".ToUpper().Split(',');
            names = "Active,InActive,Pending".Split(',');
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
            //MMT40[End]





            //I49-[End]
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
                    if ("CATEGORY|DEPARTMENT|CLASSIFICATION|POST|PERSONAL|BRANCH|BUSINESS|MARKETPLACECONTACTRELATIONSHIP|".Trim().ToUpper().Contains(sycEntityObjectType.Code.Trim().ToUpper() + "|"))
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
            var type = "4,1,1,1,1,1,1,0,0,1,0,0,0,1,1,1".ToUpper().Split(',');
            var maxLength = "5,5,5,5,5,5,5,NULL,NULL,5,NULL,NULL,NULL,5,5,5".ToUpper().Split(',');
            var aspectRatio = "4:7,1.29,0.772,1:1,200:49,127:100,127:100,NULL,NULL,200:49,NULL,NULL,NULL,200:49,6:5,3:1".ToUpper().Split(',');
            var entityObjectType = "PRODUCT,BACKGROUND,BACKGROUND,PARTNER,PARTNER,PARTNER,PERSON,PRODUCT,MESSAGE,PERSON,PARTNER,NULL,NULL,NULL,NULL,NULL".ToUpper().Split(',');
            var parent = "NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,IMAGE".ToUpper().Split(',');
            var codes = "IMPORT,LETTER-LANDSCAPE,LETTER-PORTRAIT,LOGO,BANNER,IMAGE,PHOTO,IMAGE,FILE,COVER-PHOTO,VIDEO,FILE,DEFAULT-IMAGE,COVER,CTASLIDER,AUTOSLIDERQ".ToUpper().Split(',');
            var names = "IMpoer Image,Letter Landscape,Letter Portrait,Logo,Banner,Image,Photo,Image,File,Cover Photo,Video,File,Default-image,Cover,CTASlider, AutoSlider".Split(',');

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
            var extType = "1,1,1,1,1,1,1,1".ToUpper().Split(',');
            var extension = "png,jpg,jpeg,webp,pdf,mp4,mwv,avi".ToUpper().Split(',');
            var extNames = "PNG,JPG,JPEG,WEBP,PDF,MP4,WMV,AVI".Split(',');

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

        //private void CreateHostSystemData()
        //{
        //    #region Add missing SycEntityObjectTypes
        //    var keyList = _context.LanguageTexts.Where(z=>z.Key.Contains("SYCENTITYOBJECTTYPES-NAME-")).Select(e => e.Key).ToList();

        //    var sycEntityObjectTypes = _context.SycEntityObjectTypes.IgnoreQueryFilters().Where(e => !keyList.Contains(("SYCENTITYOBJECTTYPES-NAME-" + e.Id.ToString() + "-" + e.Name).Trim().ToUpper())).ToList();
        //    if (sycEntityObjectTypes == null || sycEntityObjectTypes.Count > 0)
        //    {
        //        var languagesList = _context.Languages.IgnoreQueryFilters().ToList();
        //        if (languagesList != null)
        //        {
        //            foreach (var sycEntityObjectType in sycEntityObjectTypes)
        //            {

        //                foreach (var lang in languagesList)
        //                {
        //                    var sycEntityObjectTypeExist = _context.LanguageTexts.FirstOrDefaultAsync(x => x.Key == ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + sycEntityObjectType.Name).Trim().ToUpper() && x.LanguageName == lang.Name).Result;
        //                    if (sycEntityObjectTypeExist == null ||
        //                        (sycEntityObjectTypeExist != null && sycEntityObjectTypeExist.Id == 0))
        //                    {
        //                        ApplicationLanguageText entity = new ApplicationLanguageText();

        //                        entity.Key = ("SYCENTITYOBJECTTYPES-NAME-" + sycEntityObjectType.Id.ToString() + "-" + sycEntityObjectType.Name).Trim().ToUpper();
        //                        entity.Source = "onetouch";
        //                        entity.Value = sycEntityObjectType.Name;
        //                        entity.LanguageName = lang.Name;
        //                        entity.TenantId = sycEntityObjectType.TenantId;
        //                        _context.LanguageTexts.Add(entity);

        //                    }
        //                }

        //            }
        //        }
        //        _context.SaveChanges();
        //    }
        //    #endregion SycEntityObjectTypes
        //    #region Add SycEntityObjectClassifications
        //    keyList = _context.LanguageTexts.Where(z => z.Key.Contains("SYCENTITYOBJECTCLASSIFICATIONS-NAME-")).Select(e => e.Key).ToList();
        //    var sycEntityObjectClassifications = _context.SycEntityObjectClassifications.IgnoreQueryFilters()
        //        .Where(e => !keyList.Contains(("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + e.Id.ToString() + "-" + e.Name).Trim().ToUpper())).ToList();
        //    if (sycEntityObjectClassifications == null || sycEntityObjectClassifications.Count > 0)
        //    {
        //        bool newRecordAdded = false;
        //        var languagesList = _context.Languages.IgnoreQueryFilters().ToList();
        //        if (languagesList != null)
        //        {
        //            foreach (var sycEntityObjectClassification in sycEntityObjectClassifications)
        //            {

        //                foreach (var lang in languagesList)
        //                {
        //                    var sycEntityObjectTypeExist = _context.LanguageTexts.IgnoreQueryFilters()
        //                        .Where(x => x.Key == ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + sycEntityObjectClassification.Id.ToString() + "-" + sycEntityObjectClassification.Name).Trim().ToUpper() && x.LanguageName == lang.Name)
        //                        .FirstOrDefaultAsync().Result;
        //                    if (sycEntityObjectTypeExist == null ||
        //                        (sycEntityObjectTypeExist != null && sycEntityObjectTypeExist.Id == 0))
        //                    {
        //                        newRecordAdded = true;
        //                        ApplicationLanguageText entity = new ApplicationLanguageText();

        //                        entity.Key = ("SYCENTITYOBJECTCLASSIFICATIONS-NAME-" + sycEntityObjectClassification.Id.ToString() + "-" + sycEntityObjectClassification.Name).Trim().ToUpper();
        //                        entity.Source = "onetouch";
        //                        entity.Value = sycEntityObjectClassification.Name;
        //                        entity.LanguageName = lang.Name;
        //                        entity.TenantId = sycEntityObjectClassification.TenantId;
        //                        _context.LanguageTexts.Add(entity);

        //                    }
        //                }

        //            }
        //        }
        //        if (newRecordAdded ==true)
        //        _context.SaveChanges();
        //    }
        //    #endregion
        //    #region Add SycEntityObjectCategories
        //    keyList = _context.LanguageTexts.Where(z => z.Key.Contains("SYCENTITYOBJECTCATEGORIES-NAME-")).Select(e => e.Key).ToList();
        //    var sycEntityObjectCategories = _context.SycEntityObjectCategories.IgnoreQueryFilters()
        //        .Where(e => !keyList.Contains(("SYCENTITYOBJECTCATEGORIES-NAME-" + e.Id.ToString() + "-" + e.Name).Trim().ToUpper())).ToList();
        //    if (sycEntityObjectCategories == null || sycEntityObjectCategories.Count > 0)
        //    {
        //        bool newRecordAdded = false;
        //        var languagesList = _context.Languages.IgnoreQueryFilters().ToList();
        //        if (languagesList != null)
        //        {
        //            foreach (var sycEntityObjectCategory in sycEntityObjectCategories)
        //            {

        //                foreach (var lang in languagesList)
        //                {
        //                    var sycEntityObjectTypeExist = _context.LanguageTexts.IgnoreQueryFilters()
        //                        .Where(x => x.Key == ("SYCENTITYOBJECTCATEGORIES-NAME-" + sycEntityObjectCategory.Id.ToString() + "-" + sycEntityObjectCategory.Name).Trim().ToUpper() && x.LanguageName == lang.Name).FirstOrDefaultAsync().Result;
        //                    if (sycEntityObjectTypeExist == null ||
        //                        (sycEntityObjectTypeExist != null && sycEntityObjectTypeExist.Id == 0))
        //                    {
        //                        ApplicationLanguageText entity = new ApplicationLanguageText();
        //                        newRecordAdded = true;
        //                        entity.Key = ("SYCENTITYOBJECTCATEGORIES-NAME-" + sycEntityObjectCategory.Id.ToString() + "-" + sycEntityObjectCategory.Name).Trim().ToUpper();
        //                        entity.Source = "onetouch";
        //                        entity.Value = sycEntityObjectCategory.Name;
        //                        entity.LanguageName = lang.Name;
        //                        entity.TenantId = sycEntityObjectCategory.TenantId;
        //                        _context.LanguageTexts.Add(entity);

        //                    }
        //                }

        //            }
        //        }
        //        if(newRecordAdded ==true)
        //        _context.SaveChanges();
        //    }
        //    #endregion
        //}

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

                sycReport.Code = "8";
                sycReport.Name = "ProductsCatalogTemplate8";
                sycReport.Description = "(8 Products Per Page) Layout - Landscape Orientation";
                sycReport.Thumbnail = "catalogueReportTemp8.png";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports9 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate9").ToList();
            if (sycReports9 == null || sycReports9.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate9";

                sycReport.Code = "9";
                sycReport.Name = "ProductsCatalogTemplate9";
                sycReport.Description = "(6 Products Per Page) Layout - Portrait Orientation";
                sycReport.Thumbnail = "catalogueReportTemp9.png";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports10 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate10").ToList();
            if (sycReports10 == null || sycReports10.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate10";

                sycReport.Code = "1-";
                sycReport.Name = "ProductsCatalogTemplate10";
                sycReport.Description = "1 Product per page - Without ATS";
                sycReport.Thumbnail = "catalogueReportTemp10.png";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports11 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate11").ToList();
            if (sycReports11 == null || sycReports11.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate11";

                sycReport.Code = "11";
                sycReport.Name = "ProductsCatalogTemplate11";
                sycReport.Description = "1 Product per page - With ATS";
                sycReport.Thumbnail = "catalogueReportTemp11.png";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports12 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate12").ToList();
            if (sycReports12 == null || sycReports12.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate12";

                sycReport.Code = "12";
                sycReport.Name = "ProductsCatalogTemplate12";
                sycReport.Description = "Product Per Page - Landscape - Available Quantities per Size";
                sycReport.Thumbnail = "catalogueReportTemp12.png";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            var sycReports123 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate12").ToList();
            if (sycReports123 == null || sycReports123.Count < 1)
            {
                SycReport sycReport = new SycReport();
                sycReport.Name = "ProductsCatalogTemplate12";

                sycReport.Code = "7";
                sycReport.Name = "ProductsCatalogTemplate12";
                sycReport.Description = "Product Per Page - Landscape - Available Quantities per Size";
                sycReport.Thumbnail = "ProductsCatalogTemplate12";
                sycReport.EntityObjectTypeId = 97;

                _context.SycReports.Add(sycReport);


                _context.SaveChanges();
            }

            //var sycReports13 = _context.SycReports.IgnoreQueryFilters().Where(e => e.Name == "ProductsCatalogTemplate13").ToList();
            //if (sycReports13 == null || sycReports13.Count < 1)
            //{
            //    SycReport sycReport = new SycReport();
            //    sycReport.Name = "ProductsCatalogTemplate13";

            //    sycReport.Code = "7";
            //    sycReport.Name = "ProductsCatalogTemplate13";
            //    sycReport.Description = "Product Per Page - Landscape - 2 images for product Suggested Layout";
            //    sycReport.Thumbnail = "ProductsCatalogTemplate12";
            //    sycReport.EntityObjectTypeId = 97;

            //    _context.SycReports.Add(sycReport);


            //    _context.SaveChanges();
            //}
            #endregion SycEntityObjectTypes

        }
        //MMT-Iteration37[Start]
        private void CreateMessagesCategories()
        {
            var messageObject = _context.SydObjects.Where(z => z.Code == "MESSAGE" && z.IsDeleted == false).FirstOrDefault();
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
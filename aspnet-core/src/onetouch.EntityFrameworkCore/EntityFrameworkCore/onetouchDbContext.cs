using onetouch.AppSubscriptionPlans;
using onetouch.AppSubScriptionPlan;
using onetouch.AppMarketplaceContacts;
using onetouch.Maintainances;
using onetouch.AppItemSelectors;
using onetouch.SycIdentifierDefinitions;
using onetouch.SycSegmentIdentifierDefinitions;
using onetouch.SycCounters;
//using onetouch.Onetouch;
using onetouch.AppEventGuests;
using onetouch.AppEvents;
using onetouch.AppAdvertisements;
using onetouch.AppPosts;
using onetouch.AppItemsLists;
using onetouch.AutotaskQueues;
using onetouch.AppTenantsActivitiesLogs;
using onetouch.AppTenantPlans;
using onetouch.AppTransactions;
using onetouch.SycPlanServices;
using onetouch.SycPlans;
using onetouch.SycServices;
using onetouch.SycApplications;
using onetouch.AutoTaskAttachmentInfo;
using onetouch.AutoTaskTicketNotes;
using onetouch.AutoTaskTickets;
using onetouch.AppItems;
using onetouch.Accounts;
using onetouch.AccountInfos;
using onetouch.AppEntities;
using onetouch.SystemObjects;
using Abp.IdentityServer4;
using Abp.Organizations;
using Abp.Zero.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using onetouch.Authorization.Delegation;
using onetouch.Authorization.Roles;
using onetouch.Authorization.Users;
using onetouch.Chat;
using onetouch.Editions;
using onetouch.Friendships;
using onetouch.MultiTenancy;
using onetouch.MultiTenancy.Accounting;
using onetouch.MultiTenancy.Payments;
using onetouch.Storage;
using onetouch.AppContacts;
using onetouch.Attachments;
using onetouch.Message;
using onetouch.TenantInvitations;
using Microsoft.EntityFrameworkCore.Diagnostics;
using onetouch.AppSiiwiiTransaction;
using onetouch.AppMarketplaceItems;
using onetouch.AppMarketplaceItemLists;
using onetouch.SycCurrencyExchangeRates;
using onetouch.AppMarketplaceAccountsPriceLevels;
using onetouch.AppMarketplaceTransactions;
using onetouch.AppMarketplaceMessages;

namespace onetouch.EntityFrameworkCore
{
    public class onetouchDbContext : AbpZeroDbContext<Tenant, Role, User, onetouchDbContext>, IAbpPersistedGrantDbContext
    {
        //public virtual DbSet<AppMarketplaceAppContact> AppMarketplaceAppContacts { get; set; }

        public virtual DbSet<AppTenantInvoice> AppTenantInvoices { get; set; }

        public virtual DbSet<AppTenantActivitiesLog> AppTenantActivitiesLog { get; set; }

        // public virtual DbSet<AppTenantsActivitiesLog> AppTenantsActivitiesLog { get; set; }

        public virtual DbSet<AppTenantSubscriptionPlan> AppTenantSubscriptionPlans { get; set; }
        public virtual DbSet<AppMarketplaceContact> AppMarketplaceContacts { get; set; }
        public virtual DbSet<AppMarketplaceAddress> AppMarketplaceAddresses  { get; set; }
        public virtual DbSet<AppMarketplaceContactAddress> AppMarketplaceContactAddress { get; set; }


        public virtual DbSet<AppSubscriptionPlanHeader> AppSubscriptionPlanHeaders { get; set; }

        public virtual DbSet<AppSubscriptionPlanDetail> AppSubscriptionPlanDetails { get; set; }

        public virtual DbSet<AppFeature> AppFeatures { get; set; }

        public virtual DbSet<Maintainance> Maintainances { get; set; }

        public virtual DbSet<SycEntityLocalization> SycEntityLocalizations { set; get; }
        public virtual DbSet<AppItemPrices> AppItemPrices { get; set; }
        public virtual DbSet<AppItemSizeScalesDetails> AppItemSizeScalesDetails { get; set; }
        public virtual DbSet<AppItemSizeScalesHeader> AppItemSizeScalesHeaders { get; set; }

        public virtual DbSet<AppSizeScalesHeader> AppSizeScalesHeaders { get; set; }

        public virtual DbSet<AppSizeScalesDetail> AppSizeScalesDetails { get; set; }

        public virtual DbSet<AppItemSelector> AppItemSelectors { get; set; }

        public virtual DbSet<SycIdentifierDefinition> SycIdentifierDefinitions { get; set; }

        public virtual DbSet<SycSegmentIdentifierDefinition> SycSegmentIdentifierDefinitions { get; set; }

        public virtual DbSet<SycCounter> SycCounters { get; set; }

        public virtual DbSet<SycAttachmentType> SycAttachmentTypes { get; set; }

        public virtual DbSet<AppEventGuest> AppEventGuests { get; set; }

        public virtual DbSet<AppEvent> AppEvents { get; set; }

        public virtual DbSet<AppAdvertisement> AppAdvertisements { get; set; }

        public virtual DbSet<AppPost> AppPosts { get; set; }

        public virtual DbSet<AppItemsListDetail> AppItemsListDetails { get; set; }

        public virtual DbSet<AppEntitiesRelationship> AppEntitiesRelationships { get; set; }

        public virtual DbSet<AppItemsList> AppItemsLists { get; set; }
        public virtual DbSet<AutotaskQueue> AutotaskQueues { get; set; }

        public virtual DbSet<SycReport> SycReports { get; set; }

        public virtual DbSet<AppItemSharing> AppItemSharings { get; set; }

        public virtual DbSet<AppTenantsActivitiesLogs.AppTenantsActivitiesLog> AppTenantsActivitiesLogs { get; set; }

        public virtual DbSet<AppTenantPlan> AppTenantPlans { get; set; }

        public virtual DbSet<AppTransaction> AppTransactions { get; set; }

        public virtual DbSet<SycPlanService> SycPlanServices { get; set; }

        public virtual DbSet<SycPlan> SycPlans { get; set; }

        public virtual DbSet<SycService> SycServices { get; set; }

        public virtual DbSet<SycApplication> SycApplications { get; set; }

        public virtual DbSet<AttachmentInfo> AttachmentInfos { get; set; }
        public virtual DbSet<TicketNote> TicketNotes { get; set; }

        public virtual DbSet<Ticket> Tickets { get; set; }

        public virtual DbSet<AppEntityExtraData> AppEntityExtraData { get; set; }

        public virtual DbSet<AppEntityState> AppEntityState { get; set; }

        public virtual DbSet<AppItem> AppItems { get; set; }

        //MMT33-2
        public virtual DbSet<AppMarketplaceMessage> AppMarketplaceMessage { set; get; }
        public virtual DbSet<AppEntitySharings> AppEntitySharings { get; set; }
        public virtual DbSet<AppMarketplaceItems.AppMarketplaceItems> AppMarketplaceItems { get; set; }
        public virtual DbSet<AppMarketplaceItemPrices> AppMarketplaceItemPrices { get; set; }
        public virtual DbSet<AppMarketplaceItemSelectors> AppMarketplaceItemSelectors { get; set; }
        public virtual DbSet<AppMarketplaceItemSharings> AppMarketplaceItemSharing { get; set; }
        public virtual DbSet<AppMarketplaceItemSizeScaleHeaders> AppMarketplaceItemSizeScalesHeaders { get; set; }
        public virtual DbSet<AppMarketplaceItemSizeScaleDetails> AppMarketplaceItemSizeScalesDetails { get; set; }
        public virtual DbSet<AppMarketplaceItemLists.AppMarketplaceItemLists> AppMarketplaceItemLists { set; get; }
        public virtual DbSet<AppMarketplaceItemsListDetails> AppMarketplaceItemsListDetails { set; get; }
        public virtual DbSet<onetouch.SycCurrencyExchangeRates.SycCurrencyExchangeRates> SycCurrencyExchanges { set; get; }
        public virtual DbSet<AppMarketplaceAccountsPriceLevels.AppMarketplaceAccountsPriceLevels> AppMarketplaceAccountsPriceLevels { set; get; }

        //MMT33-2
        //MMT37[Start]
        public virtual DbSet<AppMarketplaceTransactionHeaders> AppMarketplaceTransactionHeaders { set; get; }
        public virtual DbSet<AppMarketplaceTransactionDetails> AppMarketplaceTransactionDetails { set; get; }
        public virtual DbSet<AppMarketplaceTransactionContacts> AppMarketplaceTransactionContacts { set; get; }
        //MMT37[End]
        //public virtual DbSet<SysPropertyType> SysPropertyTypes { get; set; }
        //public virtual DbSet<SydObjectProperty> SydObjectProperties { get; set; }
        //public virtual DbSet<SydObjectRevision> SydObjectRevisions { get; set; }
        //public virtual DbSet<SysObjectTypeProperty> SysObjectTypeProperties { get; set; }

        public virtual DbSet<AppContactPaymentMethod> AppContactPaymentMethods { get; set; }
        public virtual DbSet<AppAddress> AppAddresss { get; set; }
        public virtual DbSet<AppContactAddress> AppContactAddresss { get; set; }

        public virtual DbSet<AppEntityAddress> AppEntityAddress { get; set; }
        public virtual DbSet<AppEntityAttachment> AppEntityAttachments { get; set; }
        public virtual DbSet<AppAttachment> AppAttachments { get; set; }
        public virtual DbSet<SycAttachmentCategory> SycAttachmentCategories { get; set; }

        public virtual DbSet<SuiIcon> SuiIcons { get; set; }

        public virtual DbSet<AppContact> AppContacts { get; set; }
        public virtual DbSet<AppEntity> AppEntities { get; set; }
        public virtual DbSet<AppEntityCategory> AppEntityCategories { get; set; }
        public virtual DbSet<AppEntityClassification> AppEntityClassifications { get; set; }

        public virtual DbSet<SycEntityObjectClassification> SycEntityObjectClassifications { get; set; }

        public virtual DbSet<SycEntityObjectStatus> SycEntityObjectStatuses { get; set; }

        public virtual DbSet<SycEntityObjectCategory> SycEntityObjectCategories { get; set; }

        public virtual DbSet<SycEntityObjectType> SycEntityObjectTypes { get; set; }

        public virtual DbSet<SydObject> SydObjects { get; set; }

        public virtual DbSet<SysObjectType> SysObjectTypes { get; set; }

        /* Define an IDbSet for each entity of the application */

        public virtual DbSet<BinaryObject> BinaryObjects { get; set; }

        public virtual DbSet<Friendship> Friendships { get; set; }

        public virtual DbSet<ChatMessage> ChatMessages { get; set; }

        public virtual DbSet<SubscribableEdition> SubscribableEditions { get; set; }

        public virtual DbSet<SubscriptionPayment> SubscriptionPayments { get; set; }

        public virtual DbSet<Invoice> Invoices { get; set; }

        public virtual DbSet<PersistedGrantEntity> PersistedGrants { get; set; }

        public virtual DbSet<SubscriptionPaymentExtensionData> SubscriptionPaymentExtensionDatas { get; set; }

        public virtual DbSet<UserDelegation> UserDelegations { get; set; }

        public virtual DbSet<AppMessage> Messages { get; set; }
        //MMT
        public virtual DbSet<AppEntityReactionsCount> AppEntityReactionsCount { get; set; }
        public virtual DbSet<AppEntityUserReactions> AppEntityUserReactions { get; set; }
        //MMT
        //Mariam[Start]
        public virtual DbSet<SycTenantInvitatios> SycTenantInvitatios { set; get; }
        //Mariam[End]
        //MMt33
        public virtual DbSet<AppTransactionHeaders> AppTransactionsHeaders { set; get; }
        public virtual DbSet<AppTransactionDetails> AppTransactionsDetails { set; get; }
        public virtual DbSet<AppTransactionContacts> AppTransactionContacts { set; get; }
        //MMT33
        public virtual DbSet<AppActiveTransaction> AppShoppingCart { set; get; }
        public onetouchDbContext(DbContextOptions<onetouchDbContext> options)
            : base(options)
        {

        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
       => optionsBuilder
       .ConfigureWarnings(warnings => warnings.Ignore(CoreEventId.NavigationBaseIncludeIgnored, CoreEventId.NavigationBaseIncluded));

        protected override void ConfigureConventions(ModelConfigurationBuilder configurationBuilder)
        {
            configurationBuilder.Conventions.Add(_ => new BlankTriggerAddingConvention());
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            //modelBuilder.Entity<AppMarketplaceAppContact>(a =>
            //{
            //    a.HasIndex(e => new { e.TenantId });
            //});
            modelBuilder.Entity<AppItemSelector>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycSegmentIdentifierDefinition>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycIdentifierDefinition>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycCounter>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycSegmentIdentifierDefinition>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycCounter>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<SycTenantInvitatios>(s =>
                       {
                           s.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppEvent>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppEventGuest>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppEvent>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppPost>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppItemsList>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AutotaskQueue>(a =>
            {
                a.HasIndex(e => new { e.TenantId });
            });
            //modelBuilder.Entity<AppMessage>()
            //   .HasOne(x => x.ParentFk)
            //   .WithMany(x => x.ParentFKList)
            //   .HasForeignKey(x => x.ParentId);

            modelBuilder.Entity<AppItem>()
                           .HasOne(x => x.ListingItemFk)
                           .WithMany(x => x.ListingItemFkList)
                           .HasForeignKey(x => x.ListingItemId);

            modelBuilder.Entity<AppItem>()
                .HasOne(x => x.ParentFk)
                .WithMany(x => x.ParentFkList)
                .HasForeignKey(x => x.ParentId);

            modelBuilder.Entity<AppItem>()
                .HasOne(x => x.PublishedListingItemFk)
                .WithMany(x => x.PublishedListingItemFkList)
                .HasForeignKey(x => x.PublishedListingItemId);

            modelBuilder.Entity<AppItem>(a =>
            {
                a.HasIndex(e => new { e.ItemType });
            });

            modelBuilder.Entity<AppItem>(a =>
            {
                a.HasIndex(e => new { e.SharingLevel });
            });

            modelBuilder.Entity<AppTenantPlan>(a =>
            {
                a.HasIndex(e => new { e.TenantId });
            });
            modelBuilder.Entity<AppTenantsActivitiesLogs.AppTenantsActivitiesLog>(a =>
                       {
                           a.HasIndex(e => (new { e.TenantId }));
                       });
            modelBuilder.Entity<AppTenantPlan>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppTransaction>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<Ticket>(t =>
            {
                t.HasIndex(e => new { e.TenantId });
            });
            modelBuilder.Entity<AttachmentInfo>(t =>
            {
                t.HasIndex(e => new { e.TenantId });
            });
            modelBuilder.Entity<TicketNote>(t =>
                       {
                           t.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<Ticket>(t =>
                       {
                           t.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<TicketNote>(t =>
                       {
                           t.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<Ticket>(t =>
                       {
                           t.HasIndex(e => new { e.TenantId });
                       });
            modelBuilder.Entity<AppItem>(a =>
                       {
                           a.HasIndex(e => new { e.TenantId });
                       });
            //mt
            modelBuilder.Entity<AppEntityUserReactions>(t =>
            {
                t.HasIndex(e => new { e.ActionTime });
            });
            modelBuilder.Entity<AppItemPrices>()
            .HasIndex(a => new { a.AppItemId, a.Code, a.CurrencyCode });
            //mmt
            modelBuilder.Entity<AppContact>()
                       .HasOne(x => x.ParentFk)
                       .WithMany(x => x.ParentFkList)
                       .HasForeignKey(x => x.ParentId);

            modelBuilder.Entity<AppMarketplaceContact>()
                   .HasOne(x => x.ParentFk)
                   .WithMany(x => x.ParentFkList)
                   .HasForeignKey(x => x.ParentId);

            modelBuilder.Entity<AppEntityExtraData>()
               .HasOne(x => x.EntityFk)
               .WithMany(x => x.EntityExtraData)
               .HasForeignKey(x => x.EntityId);

            modelBuilder.Entity<AppEntityAddress>()
                .HasOne(x => x.EntityFk)
                .WithMany(x => x.EntityAddresses)
                .HasForeignKey(x => x.EntityId);

            modelBuilder.Entity<AppEntitiesRelationship>()
           .HasOne(x => x.EntityFk)
           .WithMany(x => x.EntitiesRelationships)
           .HasForeignKey(x => x.EntityId);

            modelBuilder.Entity<AppEntitiesRelationship>()
            .HasOne(x => x.RelatedEntityFk)
            .WithMany(x => x.RelatedEntitiesRelationships)
            .HasForeignKey(x => x.RelatedEntityId);

            modelBuilder.Entity<AppContact>()
            .HasOne(x => x.PartnerFk)
            .WithMany(x => x.PartnerFkList)
            .HasForeignKey(x => x.PartnerId);

            modelBuilder.Entity<AppContact>(a =>
            {
                a.HasIndex(e => new { e.TenantId });
            });
            modelBuilder.Entity<BinaryObject>(b =>
                       {
                           b.HasIndex(e => new { e.TenantId });
                       });

            modelBuilder.Entity<ChatMessage>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.UserId, e.ReadState });
                b.HasIndex(e => new { e.TenantId, e.TargetUserId, e.ReadState });
                b.HasIndex(e => new { e.TargetTenantId, e.TargetUserId, e.ReadState });
                b.HasIndex(e => new { e.TargetTenantId, e.UserId, e.ReadState });
            });

            modelBuilder.Entity<Friendship>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.UserId });
                b.HasIndex(e => new { e.TenantId, e.FriendUserId });
                b.HasIndex(e => new { e.FriendTenantId, e.UserId });
                b.HasIndex(e => new { e.FriendTenantId, e.FriendUserId });
            });

            modelBuilder.Entity<Tenant>(b =>
            {
                b.HasIndex(e => new { e.SubscriptionEndDateUtc });
                b.HasIndex(e => new { e.CreationTime });
            });

            modelBuilder.Entity<SubscriptionPayment>(b =>
            {
                b.HasIndex(e => new { e.Status, e.CreationTime });
                b.HasIndex(e => new { PaymentId = e.ExternalPaymentId, e.Gateway });
            });

            modelBuilder.Entity<SubscriptionPaymentExtensionData>(b =>
            {
                b.HasQueryFilter(m => !m.IsDeleted)
                    .HasIndex(e => new { e.SubscriptionPaymentId, e.Key, e.IsDeleted })
                    .IsUnique();
            });

            modelBuilder.Entity<UserDelegation>(b =>
            {
                b.HasIndex(e => new { e.TenantId, e.SourceUserId });
                b.HasIndex(e => new { e.TenantId, e.TargetUserId });
            });

            modelBuilder.ConfigurePersistedGrantEntity();
        }
    }
}
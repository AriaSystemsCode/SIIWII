using System.Reflection;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities;
using onetouch.AppItems;
using onetouch.AppMarketplaceItems;
using onetouch.Attachments;
using onetouch.EntityFrameworkCore;

internal static class PublicationComparisonChecks
{
    public static void Run()
    {
        using var context = new onetouchDbContext(new DbContextOptionsBuilder<onetouchDbContext>()
            .UseSqlServer("Server=unused.invalid;Database=PublicationComparisonCheck;Integrated Security=true;TrustServerCertificate=true").Options);
        var comparison = typeof(AppItemsAppService).GetMethod("SamePublicationPayload", BindingFlags.Static | BindingFlags.NonPublic)!;
        bool Matches(AppMarketplaceItems desired, AppMarketplaceItems published) =>
            (bool)comparison.Invoke(null, new object[] { context, desired, published, true })!;
        var desired = MakeProduct(10);
        var published = MakeProduct(90);
        published.TimeStamp = DateTime.UtcNow;
        published.ItemPricesFkList = published.ItemPricesFkList.Reverse().ToList();
        Check(Matches(desired, published), "Identity, version, and row ordering differences caused a collection rewrite.");

        void MustDetect(Action<AppMarketplaceItems> change, string message)
        {
            var changed = MakeProduct(90);
            change(changed);
            Check(!Matches(desired, changed), message);
        }
        MustDetect(item => item.Price = 11, "Price changes with unchanged legacy timestamps were missed.");
        MustDetect(item => item.Name = "Renamed", "Product name changes were missed.");
        MustDetect(item => item.ParentId = 900, "A variation moved to another parent was missed.");
        MustDetect(item => item.SharingLevel = 2, "A variation's sharing-level change was missed.");
        MustDetect(item => item.ItemPricesFkList.First().IsDefault = false, "Default-price changes were missed.");
        MustDetect(item => item.ItemPricesFkList.First().BuyerSSIN = "BUYER", "Buyer-specific price changes were missed.");
        MustDetect(item => item.EntityExtraData[0].AttributeValue = "red.png", "Attribute changes were missed.");
        MustDetect(item => item.EntityCategories.Clear(), "Category removal was missed.");
        MustDetect(item => item.EntityAttachments[0].IsPublic = true, "Image visibility changes were missed.");
        MustDetect(item => item.EntityAttachments[0].AttachmentFk.Attachment = "red.png", "Image replacement was missed.");
        MustDetect(item => item.ItemSizeScaleHeadersFkList.Last().AppItemSizeScalesDetails.First().SizeRatio = 3, "Size-ratio changes were missed.");
        MustDetect(item => item.ItemPricesFkList.Add(new AppMarketplaceItemPrices { Code = "MSRP", CurrencyCode = "USD", Price = 10, IsDefault = true }), "Duplicate price rows were incorrectly ignored.");

        desired.Price = 10.005m;
        published.Price = 10.01m;
        Check(Matches(desired, published), "SQL price rounding would cause an endless rewrite.");
        desired = MakeProduct(10);
        published = MakeProduct(90);
        published.Price = 10.00m;
        published.ItemPricesFkList.Last().Price = 5.00m;
        Check(Matches(desired, published), "Equivalent decimal scales caused a collection rewrite.");
        desired.EntityAddresses = null;
        published.EntityAddresses.Add(new AppEntityAddress { AddressId = 7, AddressTypeId = 8 });
        Check(Matches(desired, published), "An unloaded source collection would erase existing data.");

        var matchSource = typeof(AppItemsAppService).GetMethod("MatchesSourceProduct", BindingFlags.Static | BindingFlags.NonPublic)!;
        var source = new AppItem { SSIN = "SSIN", Code = "SELLER-CODE", TenantId = 2504 };
        var candidate = new AppMarketplaceItems { ManufacturerCode = "SELLER-CODE", TenantOwner = 2505 };
        Check(!(bool)matchSource.Invoke(null, new object[] { source, candidate })!, "Manufacturer-code fallback matched another tenant.");
        candidate.TenantOwner = 2504;
        Check((bool)matchSource.Invoke(null, new object[] { source, candidate })!, "A valid seller-code fallback was missed.");

        var timestampOnly = new AppMarketplaceItems { Id = 500, TimeStamp = new DateTime(1900, 4, 30) };
        context.Attach(timestampOnly);
        timestampOnly.TimeStamp = DateTime.UtcNow;
        context.ChangeTracker.DetectChanges();
        Check(context.Entry(timestampOnly).Properties.Where(property => property.IsModified).Select(property => property.Metadata.Name)
            .SequenceEqual(new[] { "TimeStamp" }), "A version-only update changed unrelated product fields.");
        CheckApplicationMappings(context, comparison);
        CheckImageCopies();
        Console.WriteLine("PASS: publication comparisons detect content changes, preserve ownership, honor stored precision, and reuse unchanged images.");
    }

    private static void CheckApplicationMappings(onetouchDbContext context, MethodInfo comparison)
    {
        var mappingSetup = typeof(AppItemsAppService).Assembly.GetType("onetouch.CustomDtoMapper")!
            .GetMethod("CreateMappings", BindingFlags.Public | BindingFlags.Static)!;
        var configuration = new AutoMapper.MapperConfiguration(options => mappingSetup.Invoke(null, new object[] { options }));
        var mapper = configuration.CreateMapper();
        var published = MakeProduct(90);
        var source = new AppItem
        {
            Id = 500, Code = published.ManufacturerCode, SSIN = published.SSIN, Name = published.Name,
            TenantId = 2504, Price = published.Price, TimeStamp = published.TimeStamp,
            EntityFk = new AppEntity
            {
                Id = 600, Name = published.Name, EntityObjectTypeId = published.EntityObjectTypeId,
                EntityExtraData = published.EntityExtraData, EntityCategories = published.EntityCategories,
                EntityAttachments = published.EntityAttachments, EntityClassifications = published.EntityClassifications,
                EntitiesRelationships = published.EntitiesRelationships, EntityAddresses = published.EntityAddresses
            },
            ItemPricesFkList = published.ItemPricesFkList.Select(price => new AppItemPrices
            {
                Id = price.Id + 1000, Code = price.Code, Price = price.Price, CurrencyCode = price.CurrencyCode,
                IsDefault = price.IsDefault, BuyerSSIN = price.BuyerSSIN
            }).ToList(),
            ItemSizeScaleHeadersFkList = published.ItemSizeScaleHeadersFkList.Select(header => new AppItemSizeScalesHeader
            {
                Id = header.Id + 1000, ParentId = header.ParentId.HasValue ? header.ParentId + 1000 : null,
                SizeScaleId = header.SizeScaleId, Name = header.Name,
                AppItemSizeScalesDetails = header.AppItemSizeScalesDetails.Select(detail => new AppItemSizeScalesDetails
                {
                    Id = detail.Id + 1000, SizeScaleId = detail.SizeScaleId + 1000, SizeCode = detail.SizeCode, SizeRatio = detail.SizeRatio
                }).ToList()
            }).ToList()
        };
        var normalizer = typeof(AppItemsAppService).GetMethod("PreparePublicationComparison", BindingFlags.NonPublic | BindingFlags.Static)!;
        var desired = mapper.Map<AppMarketplaceItems>(source);
        normalizer.Invoke(null, new object[] { desired, source, published, null!, null! });
        Check((bool)comparison.Invoke(null, new object[] { context, desired, published, true })!, "The application's actual mapping could not recognize an unchanged product.");
        source.ParentId = 700;
        source.ParentFk = new AppItem { Id = 700, Name = "Seller parent" };
        source.Name = "Variation name";
        published.ParentId = 800;
        var parentSource = new AppItem { Name = "Parent name", EntityFk = new AppEntity { Notes = "Parent notes" } };
        var parentPublished = new AppMarketplaceItems { Id = 800, SharingLevel = 2 };
        published.Name = parentSource.Name;
        published.Notes = parentSource.EntityFk.Notes;
        published.SharingLevel = parentPublished.SharingLevel;
        desired = mapper.Map<AppMarketplaceItems>(source);
        var publishedVariation = new AppMarketplaceItems { Id = 801, ParentId = parentPublished.Id, ParentFk = parentPublished };
        mapper.Map(source, publishedVariation);
        Check(parentPublished.Id == 800 && publishedVariation.ParentId == 800 &&
            ReferenceEquals(publishedVariation.ParentFk, parentPublished),
            "Mapping a seller variation changed its existing marketplace parent.");
        normalizer.Invoke(null, new object[] { desired, source, published, parentSource, parentPublished });
        Check(!(bool)comparison.Invoke(null, new object[] { context, desired, published, false })!, "A legacy variation code mismatch was overlooked.");
        published.Code = source.SSIN;
        Check((bool)comparison.Invoke(null, new object[] { context, desired, published, false })!, "Variation mapping did not preserve the published parent name, notes, and sharing level.");
    }

    private static AppMarketplaceItems MakeProduct(long id)
    {
        return new AppMarketplaceItems
        {
            Id = id, Code = "PRODUCT", SSIN = "SSIN", ManufacturerCode = "SELLER-CODE", Name = "Product",
            ObjectId = 1, EntityObjectTypeId = 2, TenantOwner = 2504, SharingLevel = 1,
            Price = 10, TimeStamp = new DateTime(1900, 4, 30), CreationTime = new DateTime(2020, 1, 1).AddDays(id),
            ItemPricesFkList = new List<AppMarketplaceItemPrices>
            {
                new() { Id = id + 1, AppMarketplaceItemId = id, Code = "MSRP", Price = 10, CurrencyCode = "USD", IsDefault = true },
                new() { Id = id + 2, AppMarketplaceItemId = id, Code = "WHOLESALE", Price = 5, CurrencyCode = "USD" }
            },
            EntityExtraData = new List<AppEntityExtraData> { new() { Id = id + 3, EntityId = id, AttributeId = 202, AttributeValue = "blue.png" } },
            EntityCategories = new List<AppEntityCategory> { new() { Id = id + 4, EntityId = id, EntityObjectCategoryId = 7 } },
            EntityClassifications = new List<AppEntityClassification>(), EntityAddresses = new List<AppEntityAddress>(),
            EntitiesRelationships = new List<AppEntitiesRelationship>(),
            EntityAttachments = new List<AppEntityAttachment>
            {
                new() { Id = id + 5, EntityId = id, AttachmentId = id + 6, AttachmentCategoryId = 8,
                    AttachmentFk = new AppAttachment { Id = id + 6, Attachment = "blue.png", Name = "Blue" } }
            },
            ItemSizeScaleHeadersFkList = new List<AppMarketplaceItemSizeScaleHeaders>
            {
                new() { Id = id + 7, AppMarketplaceItemId = id, SizeScaleId = 375, Name = "Sizes",
                    AppItemSizeScalesDetails = new List<AppMarketplaceItemSizeScaleDetails> { new() { Id = id + 8, SizeScaleId = id + 7, SizeCode = "S" } } },
                new() { Id = id + 9, AppMarketplaceItemId = id, ParentId = id + 7, Name = "Ratio",
                    AppItemSizeScalesDetails = new List<AppMarketplaceItemSizeScaleDetails> { new() { Id = id + 10, SizeScaleId = id + 9, SizeCode = "S", SizeRatio = 1 } } }
            }
        };
    }

    private static void CheckImageCopies()
    {
        var directory = Path.Combine(Path.GetTempPath(), "siiwii-publication-" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        var source = Path.Combine(directory, "source.png");
        var destination = Path.Combine(directory, "published.png");
        var copyMethod = typeof(AppItemsAppService).GetMethod("TryCopyPublicationFile", BindingFlags.Static | BindingFlags.NonPublic)!;
        bool Copy() => (bool)copyMethod.Invoke(null, new object[] { source, destination })!;
        try
        {
            File.WriteAllText(source, "blue");
            Check(Copy() && File.ReadAllText(destination) == "blue", "Initial image copy failed.");
            using (var locked = new FileStream(destination, FileMode.Open, FileAccess.Read, FileShare.None))
                Check(Copy(), "An unchanged image was unnecessarily rewritten.");
            File.WriteAllText(source, "pink");
            File.SetLastWriteTimeUtc(source, File.GetLastWriteTimeUtc(destination).AddSeconds(5));
            Check(Copy() && File.ReadAllText(destination) == "pink", "Changed contents under the same image filename were skipped.");
            File.Delete(source);
            Check(!Copy(), "A missing attachment was reported as copied.");
        }
        finally
        {
            File.Delete(source);
            File.Delete(destination);
            Directory.Delete(directory);
        }
    }

    private static void Check(bool condition, string message)
    {
        if (!condition)
            throw new InvalidOperationException(message);
    }
}

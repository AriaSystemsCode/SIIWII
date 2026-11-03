using System.Reflection;
using Microsoft.EntityFrameworkCore;
using onetouch.AppEntities;
using onetouch.AppItems;
using onetouch.AppMarketplaceItems;
using onetouch.Attachments;
using onetouch.EntityFrameworkCore;

// Exercise EF graph attachment without opening a database connection. Both first
// publication and resync must insert dependent rows without tracking source entities.
CheckPublicationGraph(existing: false);
CheckPublicationGraph(existing: true);
PublicationComparisonChecks.Run();
Console.WriteLine("PASS: first publication and resync attach multiple variations with independent attributes and correct owners.");

static void CheckPublicationGraph(bool existing)
{
    var sourceEntity = new AppEntity { Id = 9001 };
    var attributeValue = new AppEntity { Id = 9002 };
    var publishedAttachment = new AppAttachment { TenantId = null };
    var sourceAttribute = new AppEntityExtraData
    {
        Id = 501,
        EntityId = sourceEntity.Id,
        EntityFk = sourceEntity,
        AttributeId = 202,
        AttributeValueId = attributeValue.Id,
        AttributeValueFk = attributeValue,
        AttributeValue = "blue.png"
    };
    var copyMethod = typeof(AppItemsAppService).GetMethod("CopyMarketplaceExtraData", BindingFlags.NonPublic | BindingFlags.Static)!;
    var resetMethod = typeof(AppItemsAppService).GetMethod("ResetMarketplaceCollectionOwners", BindingFlags.NonPublic | BindingFlags.Static)!;
    var variations = Enumerable.Range(1, 2).Select(index =>
    {
        var item = new AppMarketplaceItems
        {
            Id = existing ? 100 + index : 0,
            Code = $"TEST-{index}",
            Name = "Publication regression",
            ParentId = 100,
            ObjectId = 1,
            EntityObjectTypeId = 1,
            EntityAttachments = new List<AppEntityAttachment>
            {
                new() { EntityId = sourceEntity.Id, EntityFk = sourceEntity, AttachmentFk = publishedAttachment }
            },
            EntityCategories = new List<AppEntityCategory>
            {
                new() { EntityId = sourceEntity.Id, EntityFk = sourceEntity, EntityObjectCategoryId = 77 }
            },
            EntitiesRelationships = new List<AppEntitiesRelationship>
            {
                new() { EntityId = sourceEntity.Id, EntityFk = sourceEntity, RelatedEntityId = attributeValue.Id, RelatedEntityFk = attributeValue }
            }
        };
        item.EntityExtraData = (List<AppEntityExtraData>)copyMethod.Invoke(null, new object[] { new[] { sourceAttribute }, item.Id, item.Code })!;
        resetMethod.Invoke(null, new object[] { item });
        return item;
    }).ToList();

    var options = new DbContextOptionsBuilder<onetouchDbContext>()
        .UseSqlServer("Server=unused.invalid;Database=PublicationGraphCheck;Integrated Security=true;TrustServerCertificate=true")
        .Options;
    using var context = new onetouchDbContext(options);
    var lookupMethod = typeof(AppItemsAppService).GetMethod("BuildMarketplaceItemLookup", BindingFlags.NonPublic | BindingFlags.Static)!;
    var lookup = (IQueryable<long>)lookupMethod.Invoke(null, new object[] { context.AppMarketplaceItems, "TEST-1", "SOURCE-1", 2504 })!;
    Check(lookup.ToQueryString().Contains("UNION"), "The marketplace lookup could not be translated into separate SQL matches.");
    if (existing)
        context.UpdateRange(variations);
    else
        context.AddRange(variations);
    context.ChangeTracker.DetectChanges();

    Check(!context.ChangeTracker.Entries<AppEntity>().Any(entry => entry.Entity.Id == sourceEntity.Id || entry.Entity.Id == attributeValue.Id), "Source entities were attached to the publication graph.");
    foreach (var item in variations)
    {
        var attribute = item.EntityExtraData.Single();
        Check(context.Entry(attribute).State == EntityState.Added, "A copied attribute must be inserted.");
        Check(ReferenceEquals(attribute.EntityFk, item), "Attribute owner must be the published variation.");
        Check(context.Entry(attribute).Property(row => row.EntityId).CurrentValue == context.Entry(item).Property(row => row.Id).CurrentValue, "Attribute foreign key must follow the published identity.");
        Check(attribute.AttributeValueId == attributeValue.Id && attribute.AttributeValueFk == null, "The shared attribute value must remain a scalar reference.");
        Check(ReferenceEquals(item.EntityCategories.Single().EntityFk, item), "Category owner must be the published variation.");
        Check(ReferenceEquals(item.EntityAttachments.Single().EntityFk, item), "Attachment owner must be the published variation.");
        Check(ReferenceEquals(item.EntitiesRelationships.Single().EntityFk, item), "Relationship owner must be the published variation.");
    }
    Check(context.ChangeTracker.Entries<AppAttachment>().Count() == 1, "A shared publication attachment was attached more than once.");
    Check(!ReferenceEquals(variations[0].EntityExtraData.Single(), variations[1].EntityExtraData.Single()), "Variations must not share mutable attribute rows.");
    Check(sourceAttribute.Id == 501 && ReferenceEquals(sourceAttribute.EntityFk, sourceEntity) && ReferenceEquals(sourceAttribute.AttributeValueFk, attributeValue), "Publishing changed a source attribute.");
}

static void Check(bool condition, string message)
{
    if (!condition)
        throw new InvalidOperationException(message);
}

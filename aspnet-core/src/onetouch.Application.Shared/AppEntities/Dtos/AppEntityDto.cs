
using System;
using System.Collections.Generic;
using Abp.Application.Services.Dto;
using onetouch.AppItems.Dtos;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntityDto : EntityDto<long>
    {
        public int? TenantId { get; set; }
        public int? AttachmentSourceTenantId { get; set; }
        
        public string Name { get; set; }

        public string Code { get; set; }

        public string Notes { get; set; }

        public bool IsHostRecord { get; set; }

        public bool AddFromAttachments { get; set; }

        public long? RelatedEntityId { get; set; }

        public long EntityObjectTypeId { get; set; }

        public long? EntityObjectStatusId { get; set; }

        public long ObjectId { get; set; }

        public virtual IList<AppEntityAddressDto> EntityAddresses { get; set; }

        public virtual IList<AppEntityCategoryDto> EntityCategories { get; set; }
        public virtual IList<AppEntityClassificationDto> EntityClassifications { get; set; }

        public virtual IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

        public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }

        public virtual IList<AppEntitiesRelationshipDto> EntitiesRelationships { get; set; }

        public virtual IList<AppEntitiesRelationshipDto> RelatedEntitiesRelationships { get; set; }

        public virtual AppEntityTypes AppEntityTypes { get; set; }
    }

    public class GetAppEntityAttributesInput : PagedAndSortedResultRequestDto
    {
        public long EntityId { get; set; }

    }

    public class AppEntityAddressDto : EntityDto<long>
    {
        public virtual long EntitytId { get; set; }

        public virtual long AddressTypeId { get; set; }

        public virtual string AddressTypeIdName { get; set; }

        public virtual long AddressId { get; set; }

        public virtual string Code { get; set; }

        public virtual string Name { get; set; }

        public virtual string AddressLine1 { get; set; }

        public virtual string AddressLine2 { get; set; }

        public virtual string City { get; set; }

        public virtual string State { get; set; }

        public virtual string PostalCode { get; set; }

        public virtual long CountryId { get; set; }

        public virtual string CountryIdName { get; set; }

    }

    public class GetAppEntityAttributesWithAttributeIdsInput : PagedAndSortedResultRequestDto
    {
        public long EntityId { get; set; }
        public List<long> AttributeIds { get; set; }

    }
    public class GetAppEntitysAttributesInput : PagedAndSortedResultRequestDto
    {
        public int? TenantId { get; set; }
        public List<long> EntityIds { get; set; }
        public bool GetDefaultOnly { get; set; }

    }

    public class GetAppEntitysColorsInput : PagedAndSortedResultRequestDto
    {
        public List<long> EntityIds { get; set; }
        public string Attr { get; set; }

    }

    public enum AppEntityTypes
    {
        EVENT,
        POST
    }
}
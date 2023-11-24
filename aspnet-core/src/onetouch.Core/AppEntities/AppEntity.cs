using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;

namespace onetouch.AppEntities
{
	[Table("AppEntities")]
    [Audited]
    public class AppEntity : FullAuditedEntity<long>
    {
			public int? TenantId { get; set; }


		[Required]
		[StringLength(AppEntityConsts.MaxNameLength, MinimumLength = AppEntityConsts.MinNameLength)]
		public virtual string Name { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string Code { get; set; }

		public virtual string Notes { get; set; }
		
		//public virtual string ExtraData { get; set; }
		

		public virtual long EntityObjectTypeId { get; set; }
		
        [ForeignKey("EntityObjectTypeId")]
		public SycEntityObjectType EntityObjectTypeFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityObjectTypeCode { get; set; }

		public virtual long? EntityObjectStatusId { get; set; }
		
        [ForeignKey("EntityObjectStatusId")]
		public SycEntityObjectStatus EntityObjectStatusFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityObjectStatusCode { get; set; }

		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string ObjectCode { get; set; }

		public virtual IList<AppEntityCategory> EntityCategories { get; set; }
		public virtual IList<AppEntityClassification> EntityClassifications { get; set; }

		public virtual IList<AppEntityAttachment> EntityAttachments { get; set; }

		public virtual IList<AppEntityAddress> EntityAddresses { get; set; }

		public virtual IList<AppEntityExtraData> EntityExtraData { get; set; }

		public virtual IList<AppEntitiesRelationship> EntitiesRelationships { get; set; }

		public virtual IList<AppEntitiesRelationship> RelatedEntitiesRelationships { get; set; }


	}
}
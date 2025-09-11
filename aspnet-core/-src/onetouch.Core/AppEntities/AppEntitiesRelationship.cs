using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using onetouch.AppContacts;

namespace onetouch.AppEntities
{
	[Table("AppEntitiesRelationships")]
    public class AppEntitiesRelationship : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityTypeCode { get; set; }

		[StringLength(AppEntityConsts.MaxTableNameLength, MinimumLength = AppEntityConsts.MinTableNameLength)]
		public virtual string EntityTable { get; set; }

		public int? TenantId { get; set; }

		public virtual long? ContactId { get; set; }

		[ForeignKey("ContactId")]
		public AppContact ContactFk { get; set; }

		public virtual long RelatedEntityId { get; set; }

		[ForeignKey("RelatedEntityId")]
		public AppEntity RelatedEntityFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string RelatedEntityCode { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string RelatedEntityTypeCode { get; set; }

		[StringLength(AppEntityConsts.MaxTableNameLength, MinimumLength = AppEntityConsts.MinTableNameLength)]
		public virtual string RelatedEntityTable { get; set; }

		public int? RelatedTenantId { get; set; }

		public virtual long? RelatedContactId { get; set; }

		[ForeignKey("RelatedContactId")]
		public AppContact RelatedContactFk { get; set; }

	}
}
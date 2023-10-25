using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.AppEntities
{
	[Table("AppEntityExtraData")]
    [Audited]
    public class AppEntityExtraData : Entity<long>
	{
		public virtual long EntityId { get; set; }

		[ForeignKey("EntityId")]
		public AppEntity EntityFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityCode { get; set; }

		public virtual long? EntityObjectTypeId { get; set; }

		[ForeignKey("EntityObjectTypeId")]
		public SycEntityObjectType EntityObjectTypeFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string EntityObjectTypeCode { get; set; }

		[StringLength(AppEntityConsts.MaxNameLength, MinimumLength = AppEntityConsts.MinNameLength)]
		public string EntityObjectTypeName { get; set; }

		public virtual long AttributeId { get; set; }

		//[ForeignKey("AttributeId")]
		//public SydObject AttributeFk { get; set; }

		[StringLength(AppEntityConsts.MaxCodeLength, MinimumLength = AppEntityConsts.MinCodeLength)]
		public virtual string AttributeCode { get; set; }

		public virtual long? AttributeValueId { get; set; }

		[ForeignKey("AttributeValueId")]
		public AppEntity AttributeValueFk { get; set; }

		[StringLength(AppEntityConsts.MaxAttributeValueLength, MinimumLength = AppEntityConsts.MinAttributeValueLength)]
		public virtual string AttributeValue { get; set; }
	}
}
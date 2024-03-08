using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;
using onetouch.SycIdentifierDefinitions;

namespace onetouch.SystemObjects
{
	[Table("SycEntityObjectTypes")]
    [Audited]
    public class SycEntityObjectType : FullAuditedEntity<long>
	{

		[Required]
		[StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		
		[Required]
		[StringLength(SycEntityObjectTypeConsts.MaxNameLength, MinimumLength = SycEntityObjectTypeConsts.MinNameLength)]
		public virtual string Name { get; set; }
		
		public virtual string ExtraAttributes { get; set; }
		

		public virtual long ObjectId { get; set; }
		
        [ForeignKey("ObjectId")]
		public SydObject ObjectFk { get; set; }

		[StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
		public string ObjectCode { get; set; }

		public virtual long? ParentId { get; set; }
		
        [ForeignKey("ParentId")]
		public SycEntityObjectType ParentFk { get; set; }

		[StringLength(SycEntityObjectTypeConsts.MaxCodeLength, MinimumLength = SycEntityObjectTypeConsts.MinCodeLength)]
		public string ParentCode { get; set; }

		public virtual long? SycIdentifierDefinitionId { get; set; }

		[ForeignKey("SycIdentifierDefinitionId")]
		public SycIdentifierDefinition SycIdentifierDefinitionFK { get; set; }

		public ICollection<SycEntityObjectType> SycEntityObjectTypes { get; set; }

        public bool? Hidden { get; set; }

        public int? TenantId { get; set; }
		//MMT0303
		public bool IsDefault { get; set; }
		//MMT0303
	}
}
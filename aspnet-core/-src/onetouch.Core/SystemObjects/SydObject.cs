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
	[Table("SydObjects")]
    [Audited]
    public class SydObject : FullAuditedEntity<long>
	{

		[Required]
		[StringLength(SydObjectConsts.MaxNameLength, MinimumLength = SydObjectConsts.MinNameLength)]
		public virtual string Name { get; set; }
		
		[Required]
		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string Code { get; set; }
		

		public virtual long ObjectTypeId { get; set; }
		
        [ForeignKey("ObjectTypeId")]
		public SysObjectType ObjectTypeFk { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string ObjectTypeCode { get; set; }

		public virtual long? ParentId { get; set; }
		
        [ForeignKey("ParentId")]
		public SydObject ParentFk { get; set; }

		[StringLength(SydObjectConsts.MaxCodeLength, MinimumLength = SydObjectConsts.MinCodeLength)]
		public virtual string ParentCode { get; set; }

		public ICollection<SydObject> SydObjects { get; set; }
        public virtual long? SSINIdentifierId { get; set; }
        public virtual string SSINIdentifierCode { get; set; }
        public virtual long? SycDefaultIdentifierId { get; set; }
        public virtual string SycDefaultIdentifierCode { get; set; }
        [ForeignKey("SSINIdentifierId")]
        public SycIdentifierDefinition SSINIdentifierIdFk { get; set; }
        [ForeignKey("SycDefaultIdentifierId")]
        public SycIdentifierDefinition SycDefaultIdentifierIdFk { get; set; }

    }
}
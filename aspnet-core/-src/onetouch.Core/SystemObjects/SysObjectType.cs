using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using System.Collections.Generic;

namespace onetouch.SystemObjects
{
	[Table("SysObjectTypes")]
    [Audited]
    public class SysObjectType : FullAuditedEntity <long>
    {

		[Required]
		[StringLength(SysObjectTypeConsts.MaxNameLength, MinimumLength = SysObjectTypeConsts.MinNameLength)]
		public virtual string Name { get; set; }

		[Required]
		[StringLength(SysObjectTypeConsts.MaxCodeLength, MinimumLength = SysObjectTypeConsts.MinCodeLength)]
		public virtual string Code { get; set; }

		public virtual long? ParentId { get; set; }
		
        [ForeignKey("ParentId")]
		public SysObjectType ParentFk { get; set; }


		[StringLength(SysObjectTypeConsts.MaxCodeLength, MinimumLength = SysObjectTypeConsts.MinCodeLength)]
		public virtual string ParentCode { get; set; }

		public ICollection<SysObjectType> SysObjectTypes { get; set; }

	}
}
using onetouch.SystemObjects;
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
	[Table("SysObjectTypeProperties")]
    [Audited]
    public class SysObjectTypeProperty : FullAuditedEntity<long>
	{
		public virtual long ObjectTypeId { get; set; }

		[ForeignKey("ObjectTypeId")]
		public SysObjectType ObjectTypeFk { get; set; }

		public virtual long PropertyTypeId { get; set; }

		[ForeignKey("PropertyTypeId")]
		public SysPropertyType PropertyTypeFk { get; set; }

	}
}
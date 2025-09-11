using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.SystemObjects
{
	[Table("SuiIcons")]
    [Audited]
    public class SuiIcon : FullAuditedEntity 
    {

		[Required]
		public virtual string Name { get; set; }
		

    }
}
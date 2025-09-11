using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.Maintainances
{
    [Table("Maintainances")]
    public class Maintainance : FullAuditedEntity<long>
    {

        [Required]
        [StringLength(MaintainanceConsts.MaxNameLength, MinimumLength = MaintainanceConsts.MinNameLength)]
        public virtual string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual DateTime From { get; set; }

        public virtual DateTime To { get; set; }

        public virtual bool Published { get; set; }

        public virtual string DismissIds { get; set; }

    }
}
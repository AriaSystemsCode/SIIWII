using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.SycApplications
{
    [Table("SycApplications")]
    public class SycApplication : Entity
    {

        [Required]
        [StringLength(SycApplicationConsts.MaxCodeLength, MinimumLength = SycApplicationConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        [StringLength(SycApplicationConsts.MaxNameLength, MinimumLength = SycApplicationConsts.MinNameLength)]
        public virtual string Name { get; set; }

        public virtual string Notes { get; set; }

    }
}
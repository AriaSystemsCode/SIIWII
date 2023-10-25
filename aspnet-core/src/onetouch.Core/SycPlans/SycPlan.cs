using onetouch.SycApplications;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.SycPlans
{
    [Table("SycPlans")]
    public class SycPlan : Entity
    {

        [Required]
        [StringLength(SycPlanConsts.MaxCodeLength, MinimumLength = SycPlanConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        [StringLength(SycPlanConsts.MaxNameLength, MinimumLength = SycPlanConsts.MinNameLength)]
        public virtual string Name { get; set; }

        public virtual string Notes { get; set; }

        public virtual int? ApplicationId { get; set; }

        [ForeignKey("ApplicationId")]
        public SycApplication ApplicationFk { get; set; }

    }
}
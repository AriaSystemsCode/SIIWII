using onetouch.SycApplications;
using onetouch.SycPlans;
using onetouch.SycServices;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.SycPlanServices
{
    [Table("SycPlanServices")]
    public class SycPlanService : Entity
    {

        [StringLength(SycPlanServiceConsts.MaxUnitOfMeasureLength, MinimumLength = SycPlanServiceConsts.MinUnitOfMeasureLength)]
        public virtual string UnitOfMeasure { get; set; }

        public virtual decimal UnitPrice { get; set; }

        public virtual int Units { get; set; }

        [StringLength(SycPlanServiceConsts.MaxBillingFrequencyLength, MinimumLength = SycPlanServiceConsts.MinBillingFrequencyLength)]
        public virtual string BillingFrequency { get; set; }

        public virtual int MinimumUnits { get; set; }

        public virtual int? ApplicationId { get; set; }

        [ForeignKey("ApplicationId")]
        public SycApplication ApplicationFk { get; set; }

        public virtual int? PlanId { get; set; }

        [ForeignKey("PlanId")]
        public SycPlan PlanFk { get; set; }

        public virtual int? ServiceId { get; set; }

        [ForeignKey("ServiceId")]
        public SycService ServiceFk { get; set; }

    }
}
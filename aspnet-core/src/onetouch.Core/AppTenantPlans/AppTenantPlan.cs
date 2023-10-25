using onetouch.SycPlans;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.AppTenantPlans
{
    [Table("AppTenantPlans")]
    public class AppTenantPlan : Entity, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        public virtual DateTime AddDate { get; set; }

        public virtual DateTime EndDate { get; set; }

        public virtual DateTime StartDate { get; set; }

        public virtual int? PlanId { get; set; }

        [ForeignKey("PlanId")]
        public SycPlan PlanFk { get; set; }

    }
}
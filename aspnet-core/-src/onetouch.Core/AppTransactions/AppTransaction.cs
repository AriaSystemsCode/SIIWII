using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.AppTransactions
{
    [Table("AppTransactions")]
    public class AppTransaction : Entity, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [Required]
        [StringLength(AppTransactionConsts.MaxCodeLength, MinimumLength = AppTransactionConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual DateTime Date { get; set; }

        public virtual DateTime AddDate { get; set; }

        public virtual DateTime EndDate { get; set; }

    }
}
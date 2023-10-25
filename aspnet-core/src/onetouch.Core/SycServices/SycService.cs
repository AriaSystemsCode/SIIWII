using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.SycServices
{
    [Table("SycServices")]
    public class SycService : Entity
    {

        [Required]
        [StringLength(SycServiceConsts.MaxCodeLength, MinimumLength = SycServiceConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual string Description { get; set; }

        [StringLength(SycServiceConsts.MaxUnitOfMeasureLength, MinimumLength = SycServiceConsts.MinUnitOfMeasureLength)]
        public virtual string UnitOfMeasure { get; set; }

        public virtual decimal UnitPrice { get; set; }

        public virtual string Notes { get; set; }

    }
}
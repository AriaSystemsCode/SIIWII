using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;

namespace onetouch.AppMarketplaceContact
{
    [Table("AppMarketplaceAppContacts")]
    public class AppMarketplaceAppContact : Entity<long>, IMustHaveTenant
    {
        public int TenantId { get; set; }

        [StringLength(AppMarketplaceAppContactConsts.MaxNameLength, MinimumLength = AppMarketplaceAppContactConsts.MinNameLength)]
        public virtual string Name { get; set; }

        [StringLength(AppMarketplaceAppContactConsts.MaxTradeNameLength, MinimumLength = AppMarketplaceAppContactConsts.MinTradeNameLength)]
        public virtual string TradeName { get; set; }

    }
}
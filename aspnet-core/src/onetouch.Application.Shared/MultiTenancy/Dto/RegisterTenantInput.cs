using System.ComponentModel.DataAnnotations;
using Abp.Auditing;
using Abp.Authorization.Users;
using Abp.MultiTenancy;
using onetouch.MultiTenancy.Payments;
using onetouch.MultiTenancy.Payments.Dto;

namespace onetouch.MultiTenancy.Dto
{
    public class RegisterTenantInput
    {
        [Required]
        [StringLength(AbpTenantBase.MaxTenancyNameLength)]
        public string TenancyName { get; set; }

        [Required]
        [StringLength(AbpUserBase.MaxNameLength)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [StringLength(AbpUserBase.MaxEmailAddressLength)]
        public string AdminEmailAddress { get; set; }

        [StringLength(AbpUserBase.MaxPlainPasswordLength)]
        [DisableAuditing]
        public string AdminPassword { get; set; }

        [DisableAuditing]
        public string CaptchaResponse { get; set; }

        public SubscriptionStartType SubscriptionStartType { get; set; }

        public int? EditionId { get; set; }
        public int? InviterTenantId { get; set; }

        //MMT,1 Add Admin user first name and last name in the Tenant regsitration page[Start]
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }
        //MMT,1 Add Admin user first name and last name in the Tenant regsitration page[End]
    }
}
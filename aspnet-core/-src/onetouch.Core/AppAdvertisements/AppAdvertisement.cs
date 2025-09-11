using onetouch.AppEntities;
using onetouch.Authorization.Users;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.AppAdvertisements
{
    [Table("AppAdvertisements")]
    [Audited]
    public class AppAdvertisement : FullAuditedEntity<long>
    {

        [Required]
        [StringLength(AppAdvertisementConsts.MaxCodeLength, MinimumLength = AppAdvertisementConsts.MinCodeLength)]
        public virtual string Code { get; set; }

        public virtual long? TenantId { get; set; }

        [StringLength(AppAdvertisementConsts.MaxDescriptionLength, MinimumLength = AppAdvertisementConsts.MinDescriptionLength)]
        public virtual string Description { get; set; }

        public virtual DateTime StartDate { get; set; }

        public virtual DateTime EndDate { get; set; }

        public virtual string StartTime { get; set; }

        public virtual string EndTime { get; set; }

        [StringLength(AppAdvertisementConsts.MaxTimeZoneLength, MinimumLength = AppAdvertisementConsts.MinTimeZoneLength)]
        public virtual string TimeZone { get; set; }

        public virtual bool PublishOnMarketLandingPage { get; set; }
        public virtual bool PublishOnHomePage { get; set; }

        public virtual DateTime ApprovalDateTime { get; set; }

        [StringLength(AppAdvertisementConsts.MaxPaymentMethodLength, MinimumLength = AppAdvertisementConsts.MinPaymentMethodLength)]
        public virtual string PaymentMethod { get; set; }

        public virtual long InvoiceNumber { get; set; }

        public virtual DateTime UTCFromDateTime { get; set; }

        public virtual DateTime UTCToDateTime { get; set; }

        public virtual int NumberOfOccurences { get; set; }

        public virtual int PeriodOfView { get; set; }

        public virtual long AppEntityId { get; set; }

        [ForeignKey("AppEntityId")]
        public AppEntity AppEntityFk { get; set; }

        public virtual long? UserId { get; set; }

        [ForeignKey("UserId")]
        public User UserFk { get; set; }
        public virtual int OccurenceUnitOfTime { get; set; }

        public virtual string Url { get; set; }

    }
}
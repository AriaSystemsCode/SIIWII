using onetouch.AppContacts;
using onetouch.AppEntities;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;

namespace onetouch.AppPosts
{
    [Table("AppPosts")]
    [Audited]
    public class AppPost : FullAuditedEntity<long>, IMayHaveTenant
    {
        public int? TenantId { get; set; }

        [StringLength(AppPostConsts.MaxCodeLength, MinimumLength = AppPostConsts.MinCodeLength)]
        public virtual string Code { get; set; }
        public virtual string UrlTitle { get; set; }
        
        [StringLength(AppPostConsts.MaxDescriptionLength, MinimumLength = AppPostConsts.MinDescriptionLength)]
        public virtual string Description { get; set; }

        public virtual long? AppContactId { get; set; }

        [ForeignKey("AppContactId")]
        public AppContact AppContactFk { get; set; }

        public virtual long? AppEntityId { get; set; }

        [ForeignKey("AppEntityId")]
        public AppEntity AppEntityFk { get; set; }

    }
}
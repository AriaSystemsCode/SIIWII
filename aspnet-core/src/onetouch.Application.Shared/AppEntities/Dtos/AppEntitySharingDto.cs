using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntitySharingDto : EntityDto<long>
    {

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        public virtual string SharedUserEMail { get; set; }

        public virtual string SharedUserName { get; set; }

        public virtual string SharedUserSureName { get; set; }

        public virtual string SharedUserTenantName { get; set; }

        public virtual DateTime LastViewDate { get; set; }
        public Guid? UserProfilePictureId { get; set; }

    }
}

using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.AppItems.Dtos
{

    public class ItemSharingDto : EntityDto<long>
    {

        public virtual long? SharedTenantId { get; set; }

        public virtual long? SharedUserId { get; set; }

        public virtual string SharedUserEMail { get; set; }

        public virtual string SharedUserName { get; set; }
        
        public virtual string SharedUserSureName { get; set; }

        public virtual string SharedUserTenantName { get; set; }

    }
}

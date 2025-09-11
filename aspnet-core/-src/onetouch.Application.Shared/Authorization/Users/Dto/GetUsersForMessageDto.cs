using Abp;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Authorization.Users.Dto
{
   public class GetUsersForMessageDto
    {

        public NameValue<string> Users { get; set; }
        public int? TenantId { get; set; }

        public String TenantName{ get; set; }

        public string EmailAddress { get; set; }

        public string Surname { get; set; }

        public Guid? ProfilePictureId { get; set; }
    }

}

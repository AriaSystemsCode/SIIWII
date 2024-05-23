using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.MarketplaceAccounts.Dtos
{
    public class GetMemberForViewDto
    {
        public long Id { set; get; }
        public string FirstName {set;get;}
        public string SurName { set; get; }
        public string JobTitle { set; get; }
        public string EMailAddress { set; get; }
       ///public bool IsPublicEMailAddress { set; get; }
        public DateTime JoinDate { set; get; }
       // public bool IsPublicJoinDate { set; get; }
        public bool IsActive { set; get; }
        public long UserId { set; get; }
        public string ImageUrl { set; get; }
        public string AccountName { set; get; }

    }
}

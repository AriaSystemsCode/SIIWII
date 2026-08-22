using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp.Auditing;
using onetouch.AppEntities;

namespace onetouch.AppContacts
{
    [Table("AppContactRelationshipInfo")]
    [Audited]
    public class AppContactRelationshipInfo : AppEntity
    {
        public string RequesterContactSSIN { set; get; }
        public string RequesterContactName { set; get; }
        public string RecipientContactSSIN { set; get; }
        public string RecipientContactName { set; get; }
        public int SharingLevel { set; get; }
        public long RecipientContactTypeId { set; get; }
        public long RequesterContactTypeId { set; get; }
        public string RequesterContactTypeCode { set; get; }
        public string RecipientContactTypeCode { set; get; }
        public DateTime RelationshipCreationDate { set; get; }
        public DateTime RelationshipStartDate { set; get; }
        public DateTime? RelationshipEndDate { set; get; }
        public bool ConsiderAsTeamMember { set; get; }
        //I49[Start]
        public string RequesterMarketplaceRole { set; get; }
        public string RecipientMarketplaceRole { set; get; }
        //I49[End]
    }
}

using onetouch.AppEntities.Dtos;
using onetouch.AutoTaskTicketNotes.Dtos;
using System.Collections.Generic;

namespace onetouch.AppPosts.Dtos
{
    public class GetAppPostForViewDto
    {
        public AppPostDto AppPost { get; set; }

        public string AppContactName { get; set; }
        public string AppContactId { get; set; }
        public string UrlTitle { get; set; }
        
        public string AppEntityName { get; set; }

        public bool CanEdit { get; set; }

        public IList<AppEntityAttachmentDto> Attachments { get; set; }

        public List<string> AttachmentsURLs { get; set; }

        public PostType Type { get; set; }
        public string EntityObjectTypeCode { get; set; }
        //MMT
        public string TimePassedFromCreation { get; set; }
        //MMT

    }

    public enum PostType 
    {
    TEXT,
    ARTICLES,
    SINGLEIMAGE,
    SINGLEVIDEO,
    NEWSDIGEST
    }
    public enum NewsDigestSortOptions
    { 
        SORTBYTITLE,
        SORTBYDATEASC,
        SORTBYDATEDESC,
        SORTBYVIEWSASC,
        SORTBYVIEWSDESC
    }

    }
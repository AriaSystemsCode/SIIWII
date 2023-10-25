using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AutoTaskTicketNotes.Dtos;
using onetouch.AppEntities.Dtos;

namespace onetouch.AppPosts.Dtos
{
    public class GetAppPostForEditOutput
    {
        public CreateOrEditAppPostDto AppPost { get; set; }

        public string AppContactName { get; set; }

        public string AppEntityName { get; set; }
        public string UrlTitle { get; set; }
       
        public bool CanEdit { get; set; }

        public IList<AttachmentInfoDto> Attachments { get; set; }

        public List<string> AttachmentsURLs { get; set; }

        public PostType Type { get; set; }
        
        public string EntityObjectTypeCode { get; set; }

    }

    public class GetAppPostForViewOutput
    {
        public CreateOrEditAppPostDto AppPost { get; set; }

        public string AppContactName { get; set; }

        public string AppEntityName { get; set; }

        public bool CanEdit { get; set; }

        public List<AttachmentInfoDto> Attachments { get; set; }
    }
}
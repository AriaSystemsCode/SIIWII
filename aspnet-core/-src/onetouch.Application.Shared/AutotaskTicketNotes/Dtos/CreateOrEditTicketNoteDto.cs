using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppEntities.Dtos;

namespace onetouch.AutoTaskTicketNotes.Dtos
{
    public class CreateOrEditTicketNoteDto : EntityDto<int?>
    {

        [StringLength(TicketNoteConsts.MaxTitleLength, MinimumLength = TicketNoteConsts.MinTitleLength)]
        public string Title { get; set; }

        public string Description { get; set; }

        public int? TicketId { get; set; }
        public long? CreatorUserId { get; set; }

        public long? QueueID { get; set; }

        public List<AttachmentInfoDto> EntityAttachments { get; set; }

    }
    public class AttachmentInfoDto:EntityDto
    {
        public string Description { get; set; }
        public string FileName { get; set; }
        public string FullPath { get; set; }
        public string guid { get; set; }

        public long ID { get; set; }
    }
}
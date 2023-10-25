using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AutoTaskTicketNotes.Dtos;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class CreateOrEditTicketDto : EntityDto<int?>
    {

        [StringLength(TicketConsts.MaxTitleLength, MinimumLength = TicketConsts.MinTitleLength)]
        public string Title { get; set; }

        [StringLength(TicketConsts.MaxTicketNumberLength, MinimumLength = TicketConsts.MinTicketNumberLength)]
        public string TicketNumber { get; set; }

        public string Description { get; set; }

        public long? QueueId { get; set; }
        public string QueueName { get; set; }

        public List<AttachmentInfoDto> EntityAttachments { get; set; }

    }
}
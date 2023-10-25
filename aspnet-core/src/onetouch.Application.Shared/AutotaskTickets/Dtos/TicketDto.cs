using System;
using Abp.Application.Services.Dto;

namespace onetouch.AutoTaskTickets.Dtos
{
    public class TicketDto : EntityDto<long>
    {
        public string Title { get; set; }

        public string TicketNumber { get; set; }

        public string Description { get; set; }
        public long? QueueId { get; set; }
        public string QueueName { get; set; }

    }
}
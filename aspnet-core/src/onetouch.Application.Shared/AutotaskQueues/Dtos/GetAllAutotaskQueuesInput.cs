using Abp.Application.Services.Dto;
using System;

namespace onetouch.AutotaskQueues.Dtos
{
    public class GetAllAutotaskQueuesInput : PagedAndSortedResultRequestDto
    {
        public string Filter { get; set; }

        public long? MaxRefQueueIDFilter { get; set; }
        public long? MinRefQueueIDFilter { get; set; }

        public string NameFilter { get; set; }

    }
}
using System;
using Abp.Application.Services.Dto;

namespace onetouch.AutotaskQueues.Dtos
{
    public class AutotaskQueueDto : EntityDto<long>
    {
        public long RefQueueID { get; set; }

        public string Name { get; set; }

    }
}
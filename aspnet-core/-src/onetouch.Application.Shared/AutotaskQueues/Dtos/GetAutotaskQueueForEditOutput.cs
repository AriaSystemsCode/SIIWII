using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AutotaskQueues.Dtos
{
    public class GetAutotaskQueueForEditOutput
    {
        public CreateOrEditAutotaskQueueDto AutotaskQueue { get; set; }

    }
}
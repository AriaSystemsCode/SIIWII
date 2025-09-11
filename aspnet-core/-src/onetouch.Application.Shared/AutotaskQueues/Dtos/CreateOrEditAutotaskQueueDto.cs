using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace onetouch.AutotaskQueues.Dtos
{
    public class CreateOrEditAutotaskQueueDto : EntityDto<long?>
    {

        public long RefQueueID { get; set; }

        public string Name { get; set; }

    }
}
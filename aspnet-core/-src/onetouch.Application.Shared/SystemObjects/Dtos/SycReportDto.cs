
using System;
using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycReportDto : EntityDto
    {
		public string Name { get; set; }

        public virtual string Description { get; set; }

        public virtual string ImgUrl { get; set; }


    }
}
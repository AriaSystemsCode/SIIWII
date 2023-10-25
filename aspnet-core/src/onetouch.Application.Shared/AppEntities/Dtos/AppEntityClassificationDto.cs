using onetouch.SystemObjects;
using onetouch.SystemObjects;
using onetouch.SystemObjects;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Abp.Auditing;
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntityClassificationDto : EntityDto<long>
	{

		public virtual long EntityObjectClassificationId { get; set; }

		public virtual string EntityObjectClassificationCode { get; set; }
		public virtual string EntityObjectClassificationName { get; set; }

	}
}
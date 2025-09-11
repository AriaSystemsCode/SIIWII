
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using Abp.Runtime.Validation;

namespace onetouch.SystemObjects.Dtos
{
    public class CreateOrEditSysObjectTypeDto : EntityDto<int?>,  ICustomValidate
	{

		[Required]
		[StringLength(SysObjectTypeConsts.MaxNameLength, MinimumLength = SysObjectTypeConsts.MinNameLength)]
		public string Name { get; set; }

		public string Code { get; set; }
		public int? ParentId { get; set; }


		public void AddValidationErrors(CustomValidationContext context)
		{
			//if (SendEmailToAssignedPerson && (!AssignedPersonId.HasValue || AssignedPersonId.Value <= 0))
			//{
			//	context.Results.Add(new ValidationResult("AssignedPersonId must be set if SendEmailToAssignedPerson is true!"));
			//}
		}
	}
}
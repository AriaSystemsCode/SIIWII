
using System;
using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.Collections.Generic;
using onetouch.AppItems.Dtos;

namespace onetouch.AppEntities.Dtos
{
    public class CreateOrEditAppEntityDto : EntityDto<long?>
    {

		[Required]
		public string Name { get; set; }
		
		
		[Required]
		public string Code { get; set; }
		
		
		public string Notes { get; set; }
		
		public IList<AppEntityExtraDataDto> EntityExtraData { get; set; }
		public IList<AppEntityAttachmentDto> EntityAttachments { get; set; }

		public long EntityObjectTypeId { get; set; }
		 
		public long? EntityObjectStatusId { get; set; }
		 
		public long ObjectId { get; set; }

		public string EntityObjectTypeCode { get; set; }
	}
}
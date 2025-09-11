using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.Message.Dto
{
   public class GetAllMessagesInput : PagedAndSortedResultRequestDto
	{
		public string Filter { get; set; }
		public string BodyFilter { get; set; }
		public string SubjectFilter { get; set; }
		public int  messageTypeIndex { get; set; }

		public long? MainComponentEntitlyId { get; set; }
		public long? ParentId { get; set; }
		public long? ThreadId { get; set; }
		public string MessageCategoryFilter { get; set; }
		
	}
	public enum MessageCategory
	{
        MESSAGE,
		THREAD,
		MENTION
	}
}

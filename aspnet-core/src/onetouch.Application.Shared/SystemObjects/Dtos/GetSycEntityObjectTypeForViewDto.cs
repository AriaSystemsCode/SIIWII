using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class GetSycEntityObjectTypeForViewDto
    {
		public SycEntityObjectTypeDto SycEntityObjectType { get; set; }

		public string SydObjectName { get; set;}

		public string SycEntityObjectTypeName { get; set;}
        public string IdentifierCode { get; set; }

    }

    public class GetAllChildsWithPagingInput: PagedAndSortedResultRequestDto
    { 
        public long parentId { get; set; }
    }
}
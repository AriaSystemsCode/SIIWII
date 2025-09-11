using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SydObjectSydObjectLookupTableDto
    {
        public long Id { get; set; }

		public string DisplayName { get; set; }

        public long ObjectTypeId { get; set; }
    }
}
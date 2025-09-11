using Abp.Application.Services.Dto;

namespace onetouch.SystemObjects.Dtos
{
    public class SycEntityObjectTypeSycEntityObjectTypeLookupTableDto
    {
        public  long Id { get; set; }

		public string DisplayName { get; set; }
    }

    public class SycEntityObjectStatusLookupTableDto
    {
        public long Id { get; set; }

        public string DisplayName { get; set; }
    }
}
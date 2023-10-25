using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class AppEntitySycEntityObjectStatusLookupTableDto
    {
        public long Id { get; set; }

		public string DisplayName { get; set; }

        public string Code { get; set; }
    }
}
using Abp.Application.Services.Dto;

namespace onetouch.AppEntities.Dtos
{
    public class LookupTableDto
    {
		public long Id { get; set; }

		public string DisplayName { get; set; }
    }

    public class LookupLabelDto
    {
        public long Value { get; set; }

        public string Label { get; set; }
        public string Code { get; set; }

        //mmt
        public long? StockAvailability { get; set; }
        //MMT
        public bool? IsHostRecord { get; set; }
    }
    public class SelectItemDto
    {
        public string Value { get; set; }

        public string Label { get; set; }

        public bool? IsHostRecord { get; set; }
    }
}
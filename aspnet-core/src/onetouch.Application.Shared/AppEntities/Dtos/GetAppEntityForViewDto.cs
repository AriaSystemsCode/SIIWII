using onetouch.AppItems.Dtos;
using System.Collections.Generic;

namespace onetouch.AppEntities.Dtos
{

    public enum LineSheetColoSort
    {
        ColorName,
        MaterialContent
    }

    public enum LineSheetDetailPageSort
    {
        Brand,
        ItemName,
        MaterialContent,
        StartShipDate
    }
     

    public class GetAppEntityForViewDto
    {
		public AppEntityDto AppEntity { get; set; }
        public List<ExtraDataAttrDto> ExtraDataAttributes { get; set; }
        public string SycEntityObjectTypeName { get; set;}

		public string SycEntityObjectStatusName { get; set;}

		public string SydObjectName { get; set;}

		public bool IsManual { get; set; }


	}

}
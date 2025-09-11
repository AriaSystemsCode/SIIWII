using onetouch.AppEntities.Dtos;
using System.Collections.Generic;

namespace onetouch.AppItems.Dtos
{
    public class GetAppItemForViewDto
    {
        public AppItemDto AppItem { get; set; }
        public bool Selected { get; set; }
        //MMT
        public virtual IList<string> EntityObjectCategoryNames { get; set; }
        public virtual IList<string> EntityClassificationNames { get; set; }
        //MMT
    }

    public class GetAppItemDetailForViewDto
    {
        public AppItemForViewDto AppItem { get; set; }
        //MMT-IT41[Start]
        public IList<LookupLabelDto> NonLookupValues { set; get; }
        //MMT-IT41[End]

    }
    //MMT30[Start]
    public class ProductVariationsType
    { 
        public long Id { get; set; }
        public string Name { get; set; }
        public List<VariationAttribute> VariationAttributes { set; get; }
    }
    public class VariationAttribute
    { 
        public string Name { get; set; }
        public long AttributeId { get; set; }
    }
    //MMT30[End]
}
using onetouch.Accounts.Dtos;
using onetouch.AppEntities.Dtos;
using onetouch.AppEvents.Dtos;
using onetouch.AppMarketplaceItems.Dtos;
using System;
using System.Collections.Generic;
using System.Text;

namespace onetouch.SystemObjects.Dtos
{
    public class PageSettingDto
    {
        public long id { get; set; }
        public SliderEnum Type { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
        public string Title { get; set; }
        public string Image { get; set; }
        public string Description { get; set; }
        public int Order { get; set; }
        public string LinkPageUrl { get; set; }
        public string ExternalUrl { get; set; }
        //I49[Start]
        public string? BlockType { get; set; }
        public GetAppMarketItemForViewDto? GetAppMarketItemForViewDto { set; get; }
        public GetAppEntityForViewDto? GetAppEntityForViewDto { set; get; }
        public GetAccountForViewDto? GetAccountForViewDto { set; get; }
        public GetSycEntityObjectCategoryForViewDto? GetSycEntityObjectCategoryForViewDto { set; get; }
        public string Link { set; get; }
        public string ButtonText { set; get; }
        public string TitleAlignment { set; get; }
        public List<AppEntityAttachmentDto> EntityAttachments { get; set; }
        //I49[End]
        //I50[Start]
        public GetAppEventForViewDto? GetAppEventForViewDto { set; get; }
        public string? BlockTypeIsSingleOrMixed { get; set; }
        //I50[End]
    }
}

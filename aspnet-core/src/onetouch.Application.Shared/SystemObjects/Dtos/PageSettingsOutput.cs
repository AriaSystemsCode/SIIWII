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
    }
}

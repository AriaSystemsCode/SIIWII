using System.Collections.Generic;
using Abp.Localization;

namespace onetouch.Web.DashboardCustomization
{
    public class WidgetFilterViewDefinition : ViewDefinition
    {
        public WidgetFilterViewDefinition(
            string id,
            string viewFile,
            string javascriptFile = null,
            string cssFile = null) : base(id, viewFile, javascriptFile, cssFile)
        {

        }
    }
}
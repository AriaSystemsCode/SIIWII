using DevExpress.XtraReports.UI;
using onetouch.Web.PredefinedReports.ProductCatalog;
using onetouch.Web.PredefinedReports;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace onetouch.Web.Reports
{
    public static class ReportsFactory
    {
        public static Dictionary<string, Func<XtraReport>> Reports = new Dictionary<string, Func<XtraReport>>()
        {
            ["ProductsCatalogTemplate1"] = () => new ProductsCatalogTemplate1(),
            ["ProductsCatalogTemplate2"] = () => new ProductsCatalogTemplate2(),
            ["ProductsCatalogTemplate3"] = () => new ProductsCatalogTemplate3(),
            ["ProductsCatalogTemplate4"] = () => new ProductsCatalogTemplate4(),
            ["ProductsCatalogTemplate5"] = () => new ProductsCatalogTemplate5(),
            ["ProductsCatalogTemplate7"] = () => new ProductsCatalogTemplate7(),
            ["Color_Size"] = () => new Color_Size(),


        };
    }
}

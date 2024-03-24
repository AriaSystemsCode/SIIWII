using DevExpress.XtraReports.UI;
using onetouch.Web.PredefinedReports.ProductCatalog;
using onetouch.Web.PredefinedReports.OrderConfirmation;
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
            ["ProductsCatalogTemplate8"] = () => new ProductsCatalogTemplate8(),
            ["ProductsCatalogTemplate9"] = () => new ProductsCatalogTemplate9(),
            ["ProductsCatalogTemplate10"] = () => new ProductsCatalogTemplate10(),
            ["ProductsCatalogTemplate11"] = () => new ProductsCatalogTemplate11(),
            ["ProductsCatalogTemplate12"] = () => new ProductsCatalogTemplate12(),
//            ["ProductsCatalogTemplate13"] = () => new ProductsCatalogTemplate13(),
            ["OrderConfirmationForm1"] = () => new OrderConfirmationForm1(),
            //["ProductsCatalog-6-Products-Portrait"] = ()=> new ProductsCatalog-6-Products-Portrait(),
            
            ["Color_Size"] = () => new Color_Size(),


        };
    }
}

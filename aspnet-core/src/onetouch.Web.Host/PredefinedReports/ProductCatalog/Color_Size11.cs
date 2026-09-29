using System;
using DevExpress.XtraReports.UI;

namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    public partial class Color_Size11
    {
        public Color_Size11()
        {
            InitializeComponent();
            Margins = new DevExpress.Drawing.DXMargins(0F, 0F, 3F, 0F);
            PageWidth = 1052;
            PageHeight = 1881;
            // Leave room for the color image control on the left, while keeping
            // the table inside the half-page subreport width.
            table2.LocationFloat = new DevExpress.Utils.PointFloat(110.413124F, 0F);
            table2.SizeF = new System.Drawing.SizeF(930F, 84.23249F);
            tableCell25.Font = new DevExpress.Drawing.DXFont("Arial", 12F);
            tableCell26.Font = new DevExpress.Drawing.DXFont("Arial", 12F);
            tableCell34.Font = new DevExpress.Drawing.DXFont("Arial", 12F);
        }
    }
}

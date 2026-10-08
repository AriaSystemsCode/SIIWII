using DevExpress.XtraReports.UI;
using System;
using System.Collections;
using System.ComponentModel;
using System.Drawing;

namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    public partial class Color_Size1 : DevExpress.XtraReports.UI.XtraReport
    {
        public Color_Size1()
        {
            InitializeComponent();
            PageWidth = 612;
            PageHeight = 450;
        table2.LocationFloat = new DevExpress.Utils.PointFloat(71.30896F, 0F);
        table2.SizeF = new System.Drawing.SizeF(526.6682F, 39.60747F);
        tableCell25.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
        tableCell25.StylePriority.UseFont = true;
        tableCell34.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
        tableCell34.StylePriority.UseTextAlignment = true;
        tableCell34.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
        }
    }
}

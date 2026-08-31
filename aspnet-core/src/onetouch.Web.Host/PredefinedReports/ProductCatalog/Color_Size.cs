using DevExpress.XtraReports.UI;
using System;
using System.Collections;
using System.ComponentModel;
using System.Drawing;

namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    public partial class Color_Size : DevExpress.XtraReports.UI.XtraReport
    {
        public Color_Size()
        {
            InitializeComponent();
            ConfigureColorColumn();
            Detail.BeforePrint += ApplyDynamicSizeScaleFormatting;
        }

        private void ConfigureColorColumn()
        {
            tableCell25.ExpressionBindings.Clear();
            tableCell25.ExpressionBindings.Add(
                new ExpressionBinding("BeforePrint", "Text", "Trim([AttributeValue])"));
            tableCell25.Font = new DevExpress.Drawing.DXFont("Arial", 9F);
            tableCell25.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 254F);
            tableCell25.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            tableCell25.TextFitMode = TextFitMode.ShrinkOnly;
            tableCell25.WordWrap = false;
        }
        private void ApplyDynamicSizeScaleFormatting(object sender, CancelEventArgs e)
        {
            var requestedSizeCount = Convert.ToInt32(showNo.Value);
            var availableSizeCount = Convert.ToInt32(GetCurrentColumnValue("counter"));
            var sizeCount = Math.Min(requestedSizeCount, availableSizeCount);

            var fontSize = sizeCount <= 4 ? 10F
                : sizeCount <= 6 ? 9F
                : sizeCount <= 8 ? 8F
                : 7F;

            XRTableCell[] sizeCells =
            {
                xrTableCell1,
                tableCell27,
                tableCell28,
                tableCell29,
                tableCell30,
                tableCell31,
                tableCell32,
                tableCell33,
                tableCell34
            };

            foreach (var sizeCell in sizeCells)
            {
                sizeCell.Font = new DevExpress.Drawing.DXFont("Arial", fontSize);
                sizeCell.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 254F);
                sizeCell.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
                sizeCell.TextFitMode = TextFitMode.ShrinkOnly;
                sizeCell.WordWrap = false;
            }
        }
    }
}

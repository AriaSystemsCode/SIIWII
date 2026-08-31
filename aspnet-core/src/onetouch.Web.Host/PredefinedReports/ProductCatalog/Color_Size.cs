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
            tableCell25.Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 0, 0, 0, 254F);
            tableCell25.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            tableCell25.TextFitMode = TextFitMode.ShrinkOnly;
            tableCell25.WordWrap = false;

            for (var index = table2.ExpressionBindings.Count - 1; index >= 0; index--)
            {
                if (table2.ExpressionBindings[index].PropertyName == "LeftF")
                {
                    table2.ExpressionBindings.RemoveAt(index);
                }
            }

            table2.ExpressionBindings.Add(new ExpressionBinding(
                "BeforePrint",
                "LeftF",
                "iif(?showNo=0,15,iif(Min([counter],?showNo)<5,300,iif(Min([counter],?showNo)<6,150,15)))"));
        }

        private void ApplyDynamicSizeScaleFormatting(object sender, CancelEventArgs e)
        {
            var requestedSizeCount = Convert.ToInt32(showNo.Value);
            var availableSizeCount = Convert.ToInt32(GetCurrentColumnValue("counter"));
            var sizeCount = Math.Min(requestedSizeCount, availableSizeCount);

            var fontSize = sizeCount <= 4 ? 12F
                : sizeCount <= 6 ? 11F
                : sizeCount <= 8 ? 10F
                : 9F;

            tableCell26.Font = new DevExpress.Drawing.DXFont("Arial", fontSize);
            tableCell26.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 254F);
            tableCell26.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            tableCell26.TextFitMode = TextFitMode.ShrinkOnly;
            tableCell26.WordWrap = false;

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

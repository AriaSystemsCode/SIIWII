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
                new ExpressionBinding("BeforePrint", "Text", "Replace(Trim([AttributeValue]), '\"', '')"));
            tableCell25.Font = new DevExpress.Drawing.DXFont("Arial", 12F);
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

            var fontSize = sizeCount <= 4 ? 10F
                : sizeCount <= 6 ? 9F
                : 8F;

            // Keep St. Ship readable independently of the number of size columns.
            tableCell26.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
            tableCell26.Padding = new DevExpress.XtraPrinting.PaddingInfo(0, 0, 0, 0, 254F);
            tableCell26.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // Do not shrink the single-line St. Ship header to fit its column.
            tableCell26.TextFitMode = TextFitMode.None;
            tableCell26.CanGrow = false;
            tableCell26.Multiline = false;
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

            // Size1 (usually Ex) and Total are otherwise assigned narrow cells
            // in this compact, dynamically sized table.
            sizeCells[0].Weight = 0.07D;
            var totalCellIndex = Math.Min(sizeCount, sizeCells.Length - 1);
            sizeCells[totalCellIndex].Weight = 0.08D;

            // The More size header must not be clipped by the size-cell fit mode.
            tableCell33.TextFitMode = TextFitMode.None;
        }
    }
}

namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    partial class Color_Size
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary> 
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            DevExpress.DataAccess.Sql.StoredProcQuery storedProcQuery1 = new DevExpress.DataAccess.Sql.StoredProcQuery();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter1 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter2 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter3 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter4 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter5 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.DataAccess.Sql.QueryParameter queryParameter6 = new DevExpress.DataAccess.Sql.QueryParameter();
            DevExpress.XtraPrinting.BarCode.QRCodeGenerator qrCodeGenerator2 = new DevExpress.XtraPrinting.BarCode.QRCodeGenerator();
            DevExpress.XtraPrinting.BarCode.QRCodeGenerator qrCodeGenerator1 = new DevExpress.XtraPrinting.BarCode.QRCodeGenerator();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Color_Size));
            this.ItemId = new DevExpress.XtraReports.Parameters.Parameter();
            this.attachmentBaseUrl2 = new DevExpress.XtraReports.Parameters.Parameter();
            this.tenantId2 = new DevExpress.XtraReports.Parameters.Parameter();
            this.showNo = new DevExpress.XtraReports.Parameters.Parameter();
            this.TopMargin = new DevExpress.XtraReports.UI.TopMarginBand();
            this.BottomMargin = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.Detail = new DevExpress.XtraReports.UI.DetailBand();
            this.table2 = new DevExpress.XtraReports.UI.XRTable();
            this.tableRow2 = new DevExpress.XtraReports.UI.XRTableRow();
            this.xrTableCell2 = new DevExpress.XtraReports.UI.XRTableCell();
            this.xrPictureBox1 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.tableCell25 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell26 = new DevExpress.XtraReports.UI.XRTableCell();
            this.xrTableCell1 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell27 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell28 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell29 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell30 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell31 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell32 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell33 = new DevExpress.XtraReports.UI.XRTableCell();
            this.tableCell34 = new DevExpress.XtraReports.UI.XRTableCell();
            this.sqlDataSource1 = new DevExpress.DataAccess.Sql.SqlDataSource(this.components);
            this.Title = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailCaption1 = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailData1 = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailData3_Odd = new DevExpress.XtraReports.UI.XRControlStyle();
            this.PageInfo = new DevExpress.XtraReports.UI.XRControlStyle();
            this.productListId = new DevExpress.XtraReports.Parameters.Parameter();
            this.itemlistid = new DevExpress.XtraReports.Parameters.Parameter();
            this.mimimumInStockQty = new DevExpress.XtraReports.Parameters.Parameter();
            this.onlyInStockColors = new DevExpress.XtraReports.Parameters.Parameter();
            this.barCode1 = new DevExpress.XtraReports.UI.XRBarCode();
            this.xrBarCode1 = new DevExpress.XtraReports.UI.XRBarCode();
            ((System.ComponentModel.ISupportInitialize)(this.table2)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // ItemId
            // 
            this.ItemId.Name = "ItemId";
            this.ItemId.Type = typeof(long);
            this.ItemId.ValueInfo = "0";
            // 
            // attachmentBaseUrl2
            // 
            this.attachmentBaseUrl2.Name = "attachmentBaseUrl2";
            // 
            // tenantId2
            // 
            this.tenantId2.Name = "tenantId2";
            this.tenantId2.Type = typeof(long);
            this.tenantId2.ValueInfo = "0";
            // 
            // showNo
            // 
            this.showNo.Description = "showNo";
            this.showNo.Name = "showNo";
            this.showNo.Type = typeof(int);
            this.showNo.ValueInfo = "2";
            // 
            // TopMargin
            // 
            this.TopMargin.Dpi = 254F;
            this.TopMargin.HeightF = 3F;
            this.TopMargin.Name = "TopMargin";
            // 
            // BottomMargin
            // 
            this.BottomMargin.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrBarCode1,
            this.barCode1});
            this.BottomMargin.Dpi = 254F;
            this.BottomMargin.HeightF = 2606.956F;
            this.BottomMargin.Name = "BottomMargin";
            // 
            // Detail
            // 
            this.Detail.BackColor = System.Drawing.Color.DarkKhaki;
            this.Detail.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.table2});
            this.Detail.Dpi = 254F;
            this.Detail.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "BackColor", "Iif([DataSource.CurrentRowIndex] != 21, \nIif([DataSource.CurrentRowIndex] % 2 = 0" +
                    ", \'grey\', \'white\'), \'red\')")});
            this.Detail.HeightF = 624.2742F;
            this.Detail.HierarchyPrintOptions.Indent = 50.8F;
            this.Detail.KeepTogether = true;
            this.Detail.KeepTogetherWithDetailReports = true;
            this.Detail.Name = "Detail";
            this.Detail.StylePriority.UseBackColor = false;
            this.Detail.StylePriority.UseTextAlignment = false;
            // 
            // table2
            // 
            this.table2.BackColor = System.Drawing.Color.Transparent;
            this.table2.Dpi = 254F;
            this.table2.EvenStyleName = "DetailData3_Odd";
            this.table2.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "WidthF", "iif(?showNo=0,600,iif(Min([counter],?showNo)<5,1100,iif(Min([counter],?showNo)<6," +
                    "1250,1250)))"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "LeftF", "iif(?showNo=0,0,iif(Min([counter],?showNo)<5,300,iif(Min([counter],?showNo)<6,150" +
                    ",0)))")});
            this.table2.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.table2.Name = "table2";
            this.table2.Rows.AddRange(new DevExpress.XtraReports.UI.XRTableRow[] {
            this.tableRow2});
            this.table2.Scripts.OnBeforePrint = "table2_BeforePrint";
            this.table2.SizeF = new System.Drawing.SizeF(1299F, 624.2742F);
            this.table2.StylePriority.UseBackColor = false;
            this.table2.StylePriority.UseTextAlignment = false;
            this.table2.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // tableRow2
            // 
            this.tableRow2.Cells.AddRange(new DevExpress.XtraReports.UI.XRTableCell[] {
            this.xrTableCell2,
            this.tableCell25,
            this.tableCell26,
            this.xrTableCell1,
            this.tableCell27,
            this.tableCell28,
            this.tableCell29,
            this.tableCell30,
            this.tableCell31,
            this.tableCell32,
            this.tableCell33,
            this.tableCell34});
            this.tableRow2.Dpi = 254F;
            this.tableRow2.Name = "tableRow2";
            this.tableRow2.Weight = 11.683999633789062D;
            // 
            // xrTableCell2
            // 
            this.xrTableCell2.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.xrTableCell2.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrPictureBox1});
            this.xrTableCell2.Dpi = 254F;
            this.xrTableCell2.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "iif([DataSource.CurrentRowIndex] =0\n,[Attachment],\'\')\n")});
            this.xrTableCell2.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.xrTableCell2.Multiline = true;
            this.xrTableCell2.Name = "xrTableCell2";
            this.xrTableCell2.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.xrTableCell2.StyleName = "DetailData1";
            this.xrTableCell2.StylePriority.UseBorders = false;
            this.xrTableCell2.StylePriority.UseFont = false;
            this.xrTableCell2.StylePriority.UsePadding = false;
            this.xrTableCell2.Text = "xrTableCell2";
            this.xrTableCell2.Weight = 0.032332563510392612D;
            // 
            // xrPictureBox1
            // 
            this.xrPictureBox1.Dpi = 254F;
            this.xrPictureBox1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "ImageUrl", "[Attachment]"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "[DataSource.CurrentRowIndex] >0 and [DataSource.CurrentRowIndex] <20\n")});
            this.xrPictureBox1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.xrPictureBox1.Name = "xrPictureBox1";
            this.xrPictureBox1.SizeF = new System.Drawing.SizeF(63.5F, 39.60748F);
            this.xrPictureBox1.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // tableCell25
            // 
            this.tableCell25.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.tableCell25.Dpi = 254F;
            this.tableCell25.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "iif(len(trim([AttributeValue]))>7 and [DataSource.CurrentRowIndex] > 0, Substring" +
                    "([AttributeValue],0 ,6 )+\'...\',[AttributeValue])")});
            this.tableCell25.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell25.Name = "tableCell25";
            this.tableCell25.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell25.StyleName = "DetailData1";
            this.tableCell25.StylePriority.UseBorders = false;
            this.tableCell25.StylePriority.UseFont = false;
            this.tableCell25.StylePriority.UsePadding = false;
            this.tableCell25.Weight = 0.0676674364896074D;
            // 
            // tableCell26
            // 
            this.tableCell26.Dpi = 254F;
            this.tableCell26.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[AttributeValue3]")});
            this.tableCell26.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell26.Name = "tableCell26";
            this.tableCell26.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell26.StyleName = "DetailData1";
            this.tableCell26.StylePriority.UseFont = false;
            this.tableCell26.StylePriority.UsePadding = false;
            this.tableCell26.Weight = 0.060046189376443418D;
            // 
            // xrTableCell1
            // 
            this.xrTableCell1.CanGrow = false;
            this.xrTableCell1.Dpi = 254F;
            this.xrTableCell1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=0,[Total] ,Iif(Min(?showNo, [counter])=1, [Size1],[Si" +
                    "ze1] ) )")});
            this.xrTableCell1.Font = new DevExpress.Drawing.DXFont("Arial", 8F);
            this.xrTableCell1.Name = "xrTableCell1";
            this.xrTableCell1.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.xrTableCell1.StyleName = "DetailData1";
            this.xrTableCell1.StylePriority.UseFont = false;
            this.xrTableCell1.StylePriority.UsePadding = false;
            this.xrTableCell1.StylePriority.UseTextAlignment = false;
            this.xrTableCell1.Text = "xrTableCell1";
            this.xrTableCell1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleRight;
            this.xrTableCell1.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.xrTableCell1.Weight = 0.039953810623556588D;
            this.xrTableCell1.WordWrap = false;
            // 
            // tableCell27
            // 
            this.tableCell27.CanGrow = false;
            this.tableCell27.Dpi = 254F;
            this.tableCell27.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=1,[Total] ,Iif(Min(?showNo, [counter])=2, [Size2],[Si" +
                    "ze2] ) )\n"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>0")});
            this.tableCell27.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell27.Name = "tableCell27";
            this.tableCell27.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell27.StyleName = "DetailData1";
            this.tableCell27.StylePriority.UseFont = false;
            this.tableCell27.StylePriority.UsePadding = false;
            this.tableCell27.StylePriority.UseTextAlignment = false;
            this.tableCell27.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleRight;
            this.tableCell27.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell27.Weight = 0.05D;
            this.tableCell27.WordWrap = false;
            // 
            // tableCell28
            // 
            this.tableCell28.CanGrow = false;
            this.tableCell28.Dpi = 254F;
            this.tableCell28.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=2,[Total] ,Iif(Min(?showNo, [counter])=3, [Size3],[Si" +
                    "ze3] ) )\n\n"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>1")});
            this.tableCell28.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell28.Name = "tableCell28";
            this.tableCell28.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell28.StyleName = "DetailData1";
            this.tableCell28.StylePriority.UseFont = false;
            this.tableCell28.StylePriority.UsePadding = false;
            this.tableCell28.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell28.Weight = 0.05D;
            this.tableCell28.WordWrap = false;
            // 
            // tableCell29
            // 
            this.tableCell29.CanGrow = false;
            this.tableCell29.Dpi = 254F;
            this.tableCell29.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=3,[Total] ,Iif(Min(?showNo, [counter])=4, [Size4],[Si" +
                    "ze4] ) )\n\n"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>2")});
            this.tableCell29.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell29.Name = "tableCell29";
            this.tableCell29.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell29.StyleName = "DetailData1";
            this.tableCell29.StylePriority.UseFont = false;
            this.tableCell29.StylePriority.UsePadding = false;
            this.tableCell29.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell29.Weight = 0.05D;
            this.tableCell29.WordWrap = false;
            // 
            // tableCell30
            // 
            this.tableCell30.CanGrow = false;
            this.tableCell30.Dpi = 254F;
            this.tableCell30.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=4,[Total] ,Iif(Min(?showNo, [counter])=5, [Size5],[Si" +
                    "ze5] ) )\n\n"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>3")});
            this.tableCell30.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell30.Name = "tableCell30";
            this.tableCell30.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell30.StyleName = "DetailData1";
            this.tableCell30.StylePriority.UseFont = false;
            this.tableCell30.StylePriority.UsePadding = false;
            this.tableCell30.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell30.Weight = 0.05D;
            this.tableCell30.WordWrap = false;
            // 
            // tableCell31
            // 
            this.tableCell31.CanGrow = false;
            this.tableCell31.Dpi = 254F;
            this.tableCell31.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=5,[Total] ,Iif(Min(?showNo, [counter])=6, [Size6],[Si" +
                    "ze6] ) )"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>4")});
            this.tableCell31.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell31.Name = "tableCell31";
            this.tableCell31.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell31.StyleName = "DetailData1";
            this.tableCell31.StylePriority.UseFont = false;
            this.tableCell31.StylePriority.UsePadding = false;
            this.tableCell31.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell31.Weight = 0.05D;
            this.tableCell31.WordWrap = false;
            // 
            // tableCell32
            // 
            this.tableCell32.CanGrow = false;
            this.tableCell32.Dpi = 254F;
            this.tableCell32.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=6,[Total] ,Iif(Min(?showNo, [counter])=7, [Size7],[Si" +
                    "ze7] ) )"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>5")});
            this.tableCell32.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell32.Name = "tableCell32";
            this.tableCell32.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell32.StyleName = "DetailData1";
            this.tableCell32.StylePriority.UseFont = false;
            this.tableCell32.StylePriority.UsePadding = false;
            this.tableCell32.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell32.Weight = 0.05D;
            this.tableCell32.WordWrap = false;
            // 
            // tableCell33
            // 
            this.tableCell33.CanGrow = false;
            this.tableCell33.Dpi = 254F;
            this.tableCell33.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=7,[Total] ,Iif(Min(?showNo, [counter])=8, [Size8],[Si" +
                    "ze8] ) )"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>6")});
            this.tableCell33.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell33.Name = "tableCell33";
            this.tableCell33.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell33.StyleName = "DetailData1";
            this.tableCell33.StylePriority.UseFont = false;
            this.tableCell33.StylePriority.UsePadding = false;
            this.tableCell33.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell33.Weight = 0.05D;
            this.tableCell33.WordWrap = false;
            // 
            // tableCell34
            // 
            this.tableCell34.CanGrow = false;
            this.tableCell34.Dpi = 254F;
            this.tableCell34.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(Min(?showNo, [counter])=8,[Total] ,Iif(Min(?showNo, [counter])=9, [Size9],[Si" +
                    "ze9] ) )"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "Min(?showNo, [counter])>7")});
            this.tableCell34.Font = new DevExpress.Drawing.DXFont("Arial", 7F);
            this.tableCell34.Name = "tableCell34";
            this.tableCell34.Padding = new DevExpress.XtraPrinting.PaddingInfo(1, 1, 0, 0, 254F);
            this.tableCell34.StyleName = "DetailData1";
            this.tableCell34.StylePriority.UseFont = false;
            this.tableCell34.StylePriority.UsePadding = false;
            this.tableCell34.StylePriority.UseTextAlignment = false;
            this.tableCell34.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            this.tableCell34.TextFitMode = DevExpress.XtraReports.UI.TextFitMode.ShrinkOnly;
            this.tableCell34.Weight = 0.05D;
            this.tableCell34.WordWrap = false;
            // 
            // sqlDataSource1
            // 
            this.sqlDataSource1.ConnectionName = "Reports";
            this.sqlDataSource1.Name = "sqlDataSource1";
            storedProcQuery1.Name = "Color_Sizes";
            queryParameter1.Name = "@ItemId";
            queryParameter1.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter1.Value = new DevExpress.DataAccess.Expression("?ItemId", typeof(long));
            queryParameter2.Name = "@attachmentBaseUrl";
            queryParameter2.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter2.Value = new DevExpress.DataAccess.Expression("?attachmentBaseUrl2", typeof(string));
            queryParameter3.Name = "@showNo";
            queryParameter3.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter3.Value = new DevExpress.DataAccess.Expression("?showNo", typeof(long));
            queryParameter4.Name = "@productListId";
            queryParameter4.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter4.Value = new DevExpress.DataAccess.Expression("?itemlistid", typeof(long));
            queryParameter5.Name = "@onlyInStockColors";
            queryParameter5.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter5.Value = new DevExpress.DataAccess.Expression("?onlyInStockColors", typeof(bool));
            queryParameter6.Name = "@mimimumInStockQty";
            queryParameter6.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter6.Value = new DevExpress.DataAccess.Expression("?mimimumInStockQty", typeof(long));
            storedProcQuery1.Parameters.AddRange(new DevExpress.DataAccess.Sql.QueryParameter[] {
            queryParameter1,
            queryParameter2,
            queryParameter3,
            queryParameter4,
            queryParameter5,
            queryParameter6});
            storedProcQuery1.StoredProcName = "Color_Sizes2";
            this.sqlDataSource1.Queries.AddRange(new DevExpress.DataAccess.Sql.SqlQuery[] {
            storedProcQuery1});
            this.sqlDataSource1.ResultSchemaSerializable = "PERhdGFTZXQgTmFtZT0ic3FsRGF0YVNvdXJjZTEiPjxWaWV3IE5hbWU9IkNvbG9yX1NpemVzIiAvPjwvR" +
    "GF0YVNldD4=";
            // 
            // Title
            // 
            this.Title.BackColor = System.Drawing.Color.Transparent;
            this.Title.BorderColor = System.Drawing.Color.Black;
            this.Title.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.Title.BorderWidth = 1F;
            this.Title.Font = new DevExpress.Drawing.DXFont("Arial", 14.25F);
            this.Title.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(70)))), ((int)(((byte)(80)))));
            this.Title.Name = "Title";
            this.Title.Padding = new DevExpress.XtraPrinting.PaddingInfo(15, 15, 0, 0, 254F);
            // 
            // DetailCaption1
            // 
            this.DetailCaption1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(255)))), ((int)(((byte)(255)))));
            this.DetailCaption1.BorderColor = System.Drawing.Color.White;
            this.DetailCaption1.Borders = DevExpress.XtraPrinting.BorderSide.Left;
            this.DetailCaption1.BorderWidth = 2F;
            this.DetailCaption1.Font = new DevExpress.Drawing.DXFont("Arial", 8.25F, DevExpress.Drawing.DXFontStyle.Bold);
            this.DetailCaption1.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(70)))), ((int)(((byte)(80)))));
            this.DetailCaption1.Name = "DetailCaption1";
            this.DetailCaption1.Padding = new DevExpress.XtraPrinting.PaddingInfo(15, 15, 0, 0, 254F);
            this.DetailCaption1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // DetailData1
            // 
            this.DetailData1.BorderColor = System.Drawing.Color.Transparent;
            this.DetailData1.Borders = DevExpress.XtraPrinting.BorderSide.Left;
            this.DetailData1.BorderWidth = 2F;
            this.DetailData1.Font = new DevExpress.Drawing.DXFont("Arial", 8.25F);
            this.DetailData1.ForeColor = System.Drawing.Color.Black;
            this.DetailData1.Name = "DetailData1";
            this.DetailData1.Padding = new DevExpress.XtraPrinting.PaddingInfo(15, 15, 0, 0, 254F);
            this.DetailData1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // DetailData3_Odd
            // 
            this.DetailData3_Odd.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(243)))), ((int)(((byte)(245)))), ((int)(((byte)(248)))));
            this.DetailData3_Odd.BorderColor = System.Drawing.Color.Transparent;
            this.DetailData3_Odd.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.DetailData3_Odd.BorderWidth = 1F;
            this.DetailData3_Odd.Font = new DevExpress.Drawing.DXFont("Arial", 8.25F);
            this.DetailData3_Odd.ForeColor = System.Drawing.Color.Black;
            this.DetailData3_Odd.Name = "DetailData3_Odd";
            this.DetailData3_Odd.Padding = new DevExpress.XtraPrinting.PaddingInfo(15, 15, 0, 0, 254F);
            this.DetailData3_Odd.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // PageInfo
            // 
            this.PageInfo.Font = new DevExpress.Drawing.DXFont("Arial", 8.25F, DevExpress.Drawing.DXFontStyle.Bold);
            this.PageInfo.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(70)))), ((int)(((byte)(80)))));
            this.PageInfo.Name = "PageInfo";
            this.PageInfo.Padding = new DevExpress.XtraPrinting.PaddingInfo(15, 15, 0, 0, 254F);
            // 
            // productListId
            // 
            this.productListId.Description = "productListId";
            this.productListId.Name = "productListId";
            this.productListId.Type = typeof(int);
            this.productListId.ValueInfo = "0";
            // 
            // itemlistid
            // 
            this.itemlistid.Name = "itemlistid";
            this.itemlistid.Type = typeof(long);
            this.itemlistid.ValueInfo = "0";
            // 
            // mimimumInStockQty
            // 
            this.mimimumInStockQty.Description = "mimimumInStockQty";
            this.mimimumInStockQty.Name = "mimimumInStockQty";
            this.mimimumInStockQty.Type = typeof(int);
            this.mimimumInStockQty.ValueInfo = "0";
            // 
            // onlyInStockColors
            // 
            this.onlyInStockColors.Description = "onlyInStockColors";
            this.onlyInStockColors.Name = "onlyInStockColors";
            this.onlyInStockColors.Type = typeof(bool);
            this.onlyInStockColors.ValueInfo = "False";
            // 
            // barCode1
            // 
            this.barCode1.Alignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            this.barCode1.AutoModule = true;
            this.barCode1.Dpi = 254F;
            this.barCode1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[ssin]")});
            this.barCode1.LocationFloat = new DevExpress.Utils.PointFloat(1239.19F, 2107.271F);
            this.barCode1.Module = 5.08F;
            this.barCode1.Name = "barCode1";
            this.barCode1.Padding = new DevExpress.XtraPrinting.PaddingInfo(26, 26, 0, 0, 254F);
            this.barCode1.ShowText = false;
            this.barCode1.SizeF = new System.Drawing.SizeF(367.7708F, 442.0205F);
            this.barCode1.StylePriority.UseTextAlignment = false;
            qrCodeGenerator2.ErrorCorrectionLevel = DevExpress.XtraPrinting.BarCode.QRCodeErrorCorrectionLevel.H;
            qrCodeGenerator2.Version = DevExpress.XtraPrinting.BarCode.QRCodeVersion.Version5;
            this.barCode1.Symbology = qrCodeGenerator2;
            this.barCode1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.BottomCenter;
            // 
            // xrBarCode1
            // 
            this.xrBarCode1.Alignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            this.xrBarCode1.AutoModule = true;
            this.xrBarCode1.Dpi = 254F;
            this.xrBarCode1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[ssin]")});
            this.xrBarCode1.LocationFloat = new DevExpress.Utils.PointFloat(1307.167F, 60.9832F);
            this.xrBarCode1.Module = 5.08F;
            this.xrBarCode1.Name = "xrBarCode1";
            this.xrBarCode1.Padding = new DevExpress.XtraPrinting.PaddingInfo(26, 26, 0, 0, 254F);
            this.xrBarCode1.ShowText = false;
            this.xrBarCode1.SizeF = new System.Drawing.SizeF(367.7708F, 442.0205F);
            this.xrBarCode1.StylePriority.UseTextAlignment = false;
            qrCodeGenerator1.ErrorCorrectionLevel = DevExpress.XtraPrinting.BarCode.QRCodeErrorCorrectionLevel.H;
            qrCodeGenerator1.Version = DevExpress.XtraPrinting.BarCode.QRCodeVersion.Version5;
            this.xrBarCode1.Symbology = qrCodeGenerator1;
            this.xrBarCode1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.BottomCenter;
            // 
            // Color_Size
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.TopMargin,
            this.BottomMargin,
            this.Detail});
            this.ComponentStorage.AddRange(new System.ComponentModel.IComponent[] {
            this.sqlDataSource1});
            this.DataMember = "Color_Sizes";
            this.DataSource = this.sqlDataSource1;
            this.Dpi = 254F;
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9.75F);
            this.Landscape = true;
            this.Margins = new DevExpress.Drawing.DXMargins(0F, 0F, 3F, 2606.956F);
            this.PageHeight = 2159;
            this.PageWidth = 1823;
            this.PaperKind = System.Drawing.Printing.PaperKind.Custom;
            this.ParameterPanelLayoutItems.AddRange(new DevExpress.XtraReports.Parameters.ParameterPanelLayoutItem[] {
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.ItemId, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.productListId, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.attachmentBaseUrl2, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.tenantId2, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.showNo, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.itemlistid, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.mimimumInStockQty, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.onlyInStockColors, DevExpress.XtraReports.Parameters.Orientation.Horizontal)});
            this.Parameters.AddRange(new DevExpress.XtraReports.Parameters.Parameter[] {
            this.ItemId,
            this.productListId,
            this.attachmentBaseUrl2,
            this.tenantId2,
            this.showNo,
            this.itemlistid,
            this.mimimumInStockQty,
            this.onlyInStockColors});
            this.ReportPrintOptions.PrintOnEmptyDataSource = false;
            this.ReportUnit = DevExpress.XtraReports.UI.ReportUnit.TenthsOfAMillimeter;
            this.Scripts.OnBeforePrint = "Color_Size_BeforePrint";
            this.ScriptsSource = resources.GetString("$this.ScriptsSource");
            this.SnapGridSize = 25F;
            this.StyleSheet.AddRange(new DevExpress.XtraReports.UI.XRControlStyle[] {
            this.Title,
            this.DetailCaption1,
            this.DetailData1,
            this.DetailData3_Odd,
            this.PageInfo});
            this.Version = "22.2";
            ((System.ComponentModel.ISupportInitialize)(this.table2)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }

        #endregion

        private DevExpress.XtraReports.Parameters.Parameter ItemId;
        private DevExpress.XtraReports.Parameters.Parameter attachmentBaseUrl2;
        private DevExpress.XtraReports.Parameters.Parameter tenantId2;
        private DevExpress.XtraReports.Parameters.Parameter showNo;
        private DevExpress.XtraReports.UI.TopMarginBand TopMargin;
        private DevExpress.XtraReports.UI.BottomMarginBand BottomMargin;
        private DevExpress.XtraReports.UI.DetailBand Detail;
        private DevExpress.XtraReports.UI.XRTable table2;
        private DevExpress.XtraReports.UI.XRTableRow tableRow2;
        private DevExpress.XtraReports.UI.XRTableCell tableCell25;
        private DevExpress.XtraReports.UI.XRTableCell tableCell26;
        private DevExpress.XtraReports.UI.XRTableCell tableCell27;
        private DevExpress.XtraReports.UI.XRTableCell tableCell28;
        private DevExpress.XtraReports.UI.XRTableCell tableCell29;
        private DevExpress.XtraReports.UI.XRTableCell tableCell30;
        private DevExpress.XtraReports.UI.XRTableCell tableCell31;
        private DevExpress.XtraReports.UI.XRTableCell tableCell32;
        private DevExpress.XtraReports.UI.XRTableCell tableCell33;
        private DevExpress.XtraReports.UI.XRTableCell tableCell34;
        private DevExpress.DataAccess.Sql.SqlDataSource sqlDataSource1;
        private DevExpress.XtraReports.UI.XRControlStyle Title;
        private DevExpress.XtraReports.UI.XRControlStyle DetailCaption1;
        private DevExpress.XtraReports.UI.XRControlStyle DetailData1;
        private DevExpress.XtraReports.UI.XRControlStyle DetailData3_Odd;
        private DevExpress.XtraReports.UI.XRControlStyle PageInfo;
        private DevExpress.XtraReports.UI.XRPictureBox xrPictureBox1;
        private DevExpress.XtraReports.UI.XRTableCell xrTableCell1;
        private DevExpress.XtraReports.UI.XRTableCell xrTableCell2;
        private DevExpress.XtraReports.Parameters.Parameter productListId;
        private DevExpress.XtraReports.Parameters.Parameter itemlistid;
        private DevExpress.XtraReports.Parameters.Parameter mimimumInStockQty;
        private DevExpress.XtraReports.Parameters.Parameter onlyInStockColors;
        private DevExpress.XtraReports.UI.XRBarCode xrBarCode1;
        private DevExpress.XtraReports.UI.XRBarCode barCode1;
    }
}

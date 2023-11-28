namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    partial class Colors
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
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Colors));
            this.selectedKey = new DevExpress.XtraReports.Parameters.Parameter();
            this.attributeTypeId = new DevExpress.XtraReports.Parameters.Parameter();
            this.productListId = new DevExpress.XtraReports.Parameters.Parameter();
            this.attachmentBaseUrl = new DevExpress.XtraReports.Parameters.Parameter();
            this.tenantId = new DevExpress.XtraReports.Parameters.Parameter();
            this.TopMargin = new DevExpress.XtraReports.UI.TopMarginBand();
            this.xrLabel2 = new DevExpress.XtraReports.UI.XRLabel();
            this.BottomMargin = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.sqlDataSource1 = new DevExpress.DataAccess.Sql.SqlDataSource(this.components);
            this.Title = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailCaption1 = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailData1 = new DevExpress.XtraReports.UI.XRControlStyle();
            this.DetailData3_Odd = new DevExpress.XtraReports.UI.XRControlStyle();
            this.PageInfo = new DevExpress.XtraReports.UI.XRControlStyle();
            this.PageHeader = new DevExpress.XtraReports.UI.PageHeaderBand();
            this.pageInfo3 = new DevExpress.XtraReports.UI.XRPageInfo();
            this.label13 = new DevExpress.XtraReports.UI.XRLabel();
            this.label9 = new DevExpress.XtraReports.UI.XRLabel();
            this.pictureBox3 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.tenantName = new DevExpress.XtraReports.Parameters.Parameter();
            this.logo = new DevExpress.XtraReports.Parameters.Parameter();
            this.reportTitle = new DevExpress.XtraReports.Parameters.Parameter();
            this.ColorPageSort = new DevExpress.XtraReports.Parameters.Parameter();
            this.ColorPageShowCategory = new DevExpress.XtraReports.Parameters.Parameter();
            this.GroupHeader1 = new DevExpress.XtraReports.UI.GroupHeaderBand();
            this.xrLabel3 = new DevExpress.XtraReports.UI.XRLabel();
            this.Detail = new DevExpress.XtraReports.UI.DetailBand();
            this.xrPanel1 = new DevExpress.XtraReports.UI.XRPanel();
            this.pictureBox1 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.label3 = new DevExpress.XtraReports.UI.XRLabel();
            this.PageFooter = new DevExpress.XtraReports.UI.PageFooterBand();
            this.GroupFooter1 = new DevExpress.XtraReports.UI.GroupFooterBand();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // selectedKey
            // 
            this.selectedKey.Name = "selectedKey";
            // 
            // attributeTypeId
            // 
            this.attributeTypeId.Name = "attributeTypeId";
            this.attributeTypeId.Type = typeof(long);
            this.attributeTypeId.ValueInfo = "24";
            this.attributeTypeId.Visible = false;
            // 
            // productListId
            // 
            this.productListId.Name = "productListId";
            this.productListId.Type = typeof(long);
            this.productListId.ValueInfo = "0";
            this.productListId.Visible = false;
            // 
            // attachmentBaseUrl
            // 
            this.attachmentBaseUrl.Name = "attachmentBaseUrl";
            // 
            // tenantId
            // 
            this.tenantId.Name = "tenantId";
            this.tenantId.Type = typeof(long);
            this.tenantId.ValueInfo = "0";
            // 
            // TopMargin
            // 
            this.TopMargin.HeightF = 0F;
            this.TopMargin.Name = "TopMargin";
            // 
            // xrLabel2
            // 
            this.xrLabel2.Font = new DevExpress.Drawing.DXFont("Arial", 10F, DevExpress.Drawing.DXFontStyle.Bold);
            this.xrLabel2.LocationFloat = new DevExpress.Utils.PointFloat(177.5738F, 37.33333F);
            this.xrLabel2.Multiline = true;
            this.xrLabel2.Name = "xrLabel2";
            this.xrLabel2.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabel2.SizeF = new System.Drawing.SizeF(183.3333F, 23F);
            this.xrLabel2.StylePriority.UseFont = false;
            this.xrLabel2.Text = "Colors information";
            // 
            // BottomMargin
            // 
            this.BottomMargin.HeightF = 0.3151576F;
            this.BottomMargin.Name = "BottomMargin";
            // 
            // sqlDataSource1
            // 
            this.sqlDataSource1.ConnectionName = "Reports";
            this.sqlDataSource1.Name = "sqlDataSource1";
            storedProcQuery1.Name = "LineSheet_ColorsData";
            queryParameter1.Name = "@SelectedKey";
            queryParameter1.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter1.Value = new DevExpress.DataAccess.Expression("?selectedKey", typeof(string));
            queryParameter2.Name = "@AttributeTypeId";
            queryParameter2.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter2.Value = new DevExpress.DataAccess.Expression("?attributeTypeId", typeof(long));
            queryParameter3.Name = "@ProductListId";
            queryParameter3.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter3.Value = new DevExpress.DataAccess.Expression("?productListId", typeof(long));
            queryParameter4.Name = "@attachmentBaseUrl";
            queryParameter4.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter4.Value = new DevExpress.DataAccess.Expression("?attachmentBaseUrl", typeof(string));
            queryParameter5.Name = "@tenantId";
            queryParameter5.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter5.Value = new DevExpress.DataAccess.Expression("?tenantId", typeof(long));
            queryParameter6.Name = "@OrderBy";
            queryParameter6.Type = typeof(global::DevExpress.DataAccess.Expression);
            queryParameter6.Value = new DevExpress.DataAccess.Expression("?ColorPageSort", typeof(string));
            storedProcQuery1.Parameters.AddRange(new DevExpress.DataAccess.Sql.QueryParameter[] {
            queryParameter1,
            queryParameter2,
            queryParameter3,
            queryParameter4,
            queryParameter5,
            queryParameter6});
            storedProcQuery1.StoredProcName = "LineSheet_ColorsData";
            this.sqlDataSource1.Queries.AddRange(new DevExpress.DataAccess.Sql.SqlQuery[] {
            storedProcQuery1});
            this.sqlDataSource1.ResultSchemaSerializable = resources.GetString("sqlDataSource1.ResultSchemaSerializable");
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
            this.Title.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
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
            this.DetailCaption1.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
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
            this.DetailData1.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
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
            this.DetailData3_Odd.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
            this.DetailData3_Odd.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleLeft;
            // 
            // PageInfo
            // 
            this.PageInfo.Font = new DevExpress.Drawing.DXFont("Arial", 8.25F, DevExpress.Drawing.DXFontStyle.Bold);
            this.PageInfo.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(64)))), ((int)(((byte)(70)))), ((int)(((byte)(80)))));
            this.PageInfo.Name = "PageInfo";
            this.PageInfo.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
            // 
            // PageHeader
            // 
            this.PageHeader.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.pageInfo3,
            this.label13,
            this.label9,
            this.pictureBox3,
            this.xrLabel2});
            this.PageHeader.HeightF = 64.10067F;
            this.PageHeader.Name = "PageHeader";
            this.PageHeader.PrintOn = DevExpress.XtraReports.UI.PrintOnPages.NotWithReportFooter;
            // 
            // pageInfo3
            // 
            this.pageInfo3.LocationFloat = new DevExpress.Utils.PointFloat(963.47F, 4.10067F);
            this.pageInfo3.Name = "pageInfo3";
            this.pageInfo3.PageInfo = DevExpress.XtraPrinting.PageInfo.DateTime;
            this.pageInfo3.SizeF = new System.Drawing.SizeF(91.66669F, 23.00001F);
            this.pageInfo3.TextFormatString = "{0:MMM dd, yyyy}";
            // 
            // label13
            // 
            this.label13.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?reportTitle"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "IsNullOrEmpty(?reportTitle)=false and ?reportTitle !=\'undefined\'\n\n")});
            this.label13.Font = new DevExpress.Drawing.DXFont("Arial", 12F, DevExpress.Drawing.DXFontStyle.Bold);
            this.label13.ForeColor = System.Drawing.Color.Black;
            this.label13.LocationFloat = new DevExpress.Utils.PointFloat(408.6209F, 4.10067F);
            this.label13.Multiline = true;
            this.label13.Name = "label13";
            this.label13.SizeF = new System.Drawing.SizeF(306.4232F, 23.00001F);
            this.label13.StylePriority.UseFont = false;
            this.label13.StylePriority.UseForeColor = false;
            this.label13.StylePriority.UseTextAlignment = false;
            this.label13.Text = "\r\n";
            this.label13.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // label9
            // 
            this.label9.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?tenantName")});
            this.label9.Font = new DevExpress.Drawing.DXFont("Arial", 11F, DevExpress.Drawing.DXFontStyle.Bold);
            this.label9.LocationFloat = new DevExpress.Utils.PointFloat(177.5738F, 4.100672F);
            this.label9.Multiline = true;
            this.label9.Name = "label9";
            this.label9.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.label9.SizeF = new System.Drawing.SizeF(212.5F, 23.00001F);
            this.label9.StylePriority.UseFont = false;
            this.label9.Text = "label9";
            // 
            // pictureBox3
            // 
            this.pictureBox3.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "ImageUrl", "?logo")});
            this.pictureBox3.LocationFloat = new DevExpress.Utils.PointFloat(14.28816F, 4.100672F);
            this.pictureBox3.Name = "pictureBox3";
            this.pictureBox3.SizeF = new System.Drawing.SizeF(60F, 60F);
            this.pictureBox3.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // tenantName
            // 
            this.tenantName.Description = "tenantName";
            this.tenantName.Name = "tenantName";
            this.tenantName.Visible = false;
            // 
            // logo
            // 
            this.logo.Description = "logo";
            this.logo.Name = "logo";
            this.logo.Visible = false;
            // 
            // reportTitle
            // 
            this.reportTitle.Description = "reportTitle";
            this.reportTitle.Name = "reportTitle";
            this.reportTitle.Visible = false;
            // 
            // ColorPageSort
            // 
            this.ColorPageSort.Description = "ColorPageSort";
            this.ColorPageSort.Name = "ColorPageSort";
            // 
            // ColorPageShowCategory
            // 
            this.ColorPageShowCategory.Description = "ColorPageShowCategory";
            this.ColorPageShowCategory.Name = "ColorPageShowCategory";
            this.ColorPageShowCategory.Type = typeof(bool);
            this.ColorPageShowCategory.ValueInfo = "False";
            // 
            // GroupHeader1
            // 
            this.GroupHeader1.BackColor = System.Drawing.Color.Gainsboro;
            this.GroupHeader1.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.GroupHeader1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrLabel3});
            this.GroupHeader1.Font = new DevExpress.Drawing.DXFont("Arial", 12F, DevExpress.Drawing.DXFontStyle.Bold);
            this.GroupHeader1.HeightF = 127F;
            this.GroupHeader1.KeepTogether = true;
            this.GroupHeader1.Name = "GroupHeader1";
            this.GroupHeader1.RepeatEveryPage = true;
            this.GroupHeader1.Scripts.OnBeforePrint = "GroupHeader1_BeforePrint";
            this.GroupHeader1.StylePriority.UseBackColor = false;
            this.GroupHeader1.StylePriority.UseBorders = false;
            this.GroupHeader1.StylePriority.UseFont = false;
            // 
            // xrLabel3
            // 
            this.xrLabel3.BackColor = System.Drawing.Color.WhiteSmoke;
            this.xrLabel3.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "?ColorPageShowCategory==TRUE AND Upper(?ColorPageSort)==\'MATERIALCONTENT\'"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "Iif(IsNullOrEmpty([MeterialContent]),\'None\' ,[MeterialContent] )")});
            this.xrLabel3.LocationFloat = new DevExpress.Utils.PointFloat(49.24586F, 38.54167F);
            this.xrLabel3.Multiline = true;
            this.xrLabel3.Name = "xrLabel3";
            this.xrLabel3.Padding = new DevExpress.XtraPrinting.PaddingInfo(2, 2, 0, 0, 100F);
            this.xrLabel3.SizeF = new System.Drawing.SizeF(993.9233F, 26.19932F);
            this.xrLabel3.StylePriority.UseBackColor = false;
            this.xrLabel3.StylePriority.UseTextAlignment = false;
            this.xrLabel3.Text = "xrLabel3";
            this.xrLabel3.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // Detail
            // 
            this.Detail.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.xrPanel1});
            this.Detail.HeightF = 130.4619F;
            this.Detail.KeepTogether = true;
            this.Detail.MultiColumn.ColumnCount = 9;
            this.Detail.MultiColumn.Layout = DevExpress.XtraPrinting.ColumnLayout.AcrossThenDown;
            this.Detail.MultiColumn.Mode = DevExpress.XtraReports.UI.MultiColumnMode.UseColumnCount;
            this.Detail.Name = "Detail";
            // 
            // xrPanel1
            // 
            this.xrPanel1.CanGrow = false;
            this.xrPanel1.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.pictureBox1,
            this.label3});
            this.xrPanel1.LocationFloat = new DevExpress.Utils.PointFloat(7.371025F, 0F);
            this.xrPanel1.Name = "xrPanel1";
            this.xrPanel1.SizeF = new System.Drawing.SizeF(104.8512F, 127.5F);
            // 
            // pictureBox1
            // 
            this.pictureBox1.BackColor = System.Drawing.Color.Transparent;
            this.pictureBox1.Borders = DevExpress.XtraPrinting.BorderSide.None;
            this.pictureBox1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "ImageUrl", "[Attachment]")});
            this.pictureBox1.KeepTogether = false;
            this.pictureBox1.LocationFloat = new DevExpress.Utils.PointFloat(10F, 7.992325F);
            this.pictureBox1.Name = "pictureBox1";
            this.pictureBox1.SizeF = new System.Drawing.SizeF(87.79526F, 87.8F);
            this.pictureBox1.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            this.pictureBox1.StylePriority.UseBackColor = false;
            this.pictureBox1.StylePriority.UseBorders = false;
            // 
            // label3
            // 
            this.label3.BorderColor = System.Drawing.Color.Transparent;
            this.label3.Borders = DevExpress.XtraPrinting.BorderSide.Left;
            this.label3.BorderWidth = 2F;
            this.label3.CanGrow = false;
            this.label3.CanShrink = true;
            this.label3.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "[Name]")});
            this.label3.Font = new DevExpress.Drawing.DXFont("Arial", 10.2F, DevExpress.Drawing.DXFontStyle.Bold);
            this.label3.ForeColor = System.Drawing.Color.Black;
            this.label3.LocationFloat = new DevExpress.Utils.PointFloat(4.28817F, 95.79233F);
            this.label3.Name = "label3";
            this.label3.Padding = new DevExpress.XtraPrinting.PaddingInfo(6, 6, 0, 0, 100F);
            this.label3.SizeF = new System.Drawing.SizeF(96.145F, 23.62203F);
            this.label3.StylePriority.UseBorderColor = false;
            this.label3.StylePriority.UseBorders = false;
            this.label3.StylePriority.UseBorderWidth = false;
            this.label3.StylePriority.UseFont = false;
            this.label3.StylePriority.UseForeColor = false;
            this.label3.StylePriority.UsePadding = false;
            this.label3.StylePriority.UseTextAlignment = false;
            this.label3.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // PageFooter
            // 
            this.PageFooter.HeightF = 0F;
            this.PageFooter.Name = "PageFooter";
            // 
            // GroupFooter1
            // 
            this.GroupFooter1.HeightF = 1.768112F;
            this.GroupFooter1.KeepTogether = true;
            this.GroupFooter1.Level = 1;
            this.GroupFooter1.Name = "GroupFooter1";
            // 
            // Colors
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.TopMargin,
            this.BottomMargin,
            this.PageHeader,
            this.GroupHeader1,
            this.Detail,
            this.PageFooter,
            this.GroupFooter1});
            this.ComponentStorage.AddRange(new System.ComponentModel.IComponent[] {
            this.sqlDataSource1});
            this.DataMember = "LineSheet_ColorsData";
            this.DataSource = this.sqlDataSource1;
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9.75F);
            this.Landscape = true;
            this.Margins = new DevExpress.Drawing.DXMargins(0F, 0F, 0F, 0.3151576F);
            this.PageHeight = 850;
            this.PageWidth = 1100;
            this.ParameterPanelLayoutItems.AddRange(new DevExpress.XtraReports.Parameters.ParameterPanelLayoutItem[] {
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.selectedKey, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.ColorPageSort, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.ColorPageShowCategory, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.tenantName, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.logo, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.reportTitle, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.attributeTypeId, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.productListId, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.attachmentBaseUrl, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.tenantId, DevExpress.XtraReports.Parameters.Orientation.Horizontal)});
            this.Parameters.AddRange(new DevExpress.XtraReports.Parameters.Parameter[] {
            this.selectedKey,
            this.ColorPageSort,
            this.ColorPageShowCategory,
            this.tenantName,
            this.logo,
            this.reportTitle,
            this.attributeTypeId,
            this.productListId,
            this.attachmentBaseUrl,
            this.tenantId});
            this.Scripts.OnDataSourceDemanded = "Colors_DataSourceDemanded";
            this.ScriptsSource = resources.GetString("$this.ScriptsSource");
            this.StyleSheet.AddRange(new DevExpress.XtraReports.UI.XRControlStyle[] {
            this.Title,
            this.DetailCaption1,
            this.DetailData1,
            this.DetailData3_Odd,
            this.PageInfo});
            this.Version = "22.2";
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }

        #endregion

        private DevExpress.XtraReports.Parameters.Parameter selectedKey;
        private DevExpress.XtraReports.Parameters.Parameter attributeTypeId;
        private DevExpress.XtraReports.Parameters.Parameter productListId;
        private DevExpress.XtraReports.Parameters.Parameter attachmentBaseUrl;
        private DevExpress.XtraReports.Parameters.Parameter tenantId;
        private DevExpress.XtraReports.UI.TopMarginBand TopMargin;
        private DevExpress.XtraReports.UI.BottomMarginBand BottomMargin;
        private DevExpress.DataAccess.Sql.SqlDataSource sqlDataSource1;
        private DevExpress.XtraReports.UI.XRControlStyle Title;
        private DevExpress.XtraReports.UI.XRControlStyle DetailCaption1;
        private DevExpress.XtraReports.UI.XRControlStyle DetailData1;
        private DevExpress.XtraReports.UI.XRControlStyle DetailData3_Odd;
        private DevExpress.XtraReports.UI.XRControlStyle PageInfo;
        private DevExpress.XtraReports.UI.XRLabel xrLabel2;
        private DevExpress.XtraReports.UI.PageHeaderBand PageHeader;
        private DevExpress.XtraReports.UI.XRPageInfo pageInfo3;
        private DevExpress.XtraReports.UI.XRLabel label13;
        private DevExpress.XtraReports.UI.XRLabel label9;
        private DevExpress.XtraReports.UI.XRPictureBox pictureBox3;
        private DevExpress.XtraReports.Parameters.Parameter tenantName;
        private DevExpress.XtraReports.Parameters.Parameter logo;
        private DevExpress.XtraReports.Parameters.Parameter reportTitle;
        private DevExpress.XtraReports.Parameters.Parameter ColorPageSort;
        private DevExpress.XtraReports.Parameters.Parameter ColorPageShowCategory;
        private DevExpress.XtraReports.UI.GroupHeaderBand GroupHeader1;
        private DevExpress.XtraReports.UI.XRLabel xrLabel3;
        private DevExpress.XtraReports.UI.DetailBand Detail;
        private DevExpress.XtraReports.UI.XRPanel xrPanel1;
        private DevExpress.XtraReports.UI.XRPictureBox pictureBox1;
        private DevExpress.XtraReports.UI.XRLabel label3;
        private DevExpress.XtraReports.UI.PageFooterBand PageFooter;
        private DevExpress.XtraReports.UI.GroupFooterBand GroupFooter1;
    }
}

namespace onetouch.Web.PredefinedReports.ProductCatalog
{
    partial class CoverPage
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
            DevExpress.XtraPrinting.Shape.ShapeRectangle shapeRectangle1 = new DevExpress.XtraPrinting.Shape.ShapeRectangle();
            System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(CoverPage));
            this.TopMargin = new DevExpress.XtraReports.UI.TopMarginBand();
            this.BottomMargin = new DevExpress.XtraReports.UI.BottomMarginBand();
            this.label16 = new DevExpress.XtraReports.UI.XRLabel();
            this.label15 = new DevExpress.XtraReports.UI.XRLabel();
            this.label14 = new DevExpress.XtraReports.UI.XRLabel();
            this.xrShape1 = new DevExpress.XtraReports.UI.XRShape();
            this.pageInfo3 = new DevExpress.XtraReports.UI.XRPageInfo();
            this.Detail = new DevExpress.XtraReports.UI.DetailBand();
            this.pictureBox3 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.xrPictureBox1 = new DevExpress.XtraReports.UI.XRPictureBox();
            this.xrLabel1 = new DevExpress.XtraReports.UI.XRLabel();
            this.label9 = new DevExpress.XtraReports.UI.XRLabel();
            this.label13 = new DevExpress.XtraReports.UI.XRLabel();
            this.tenantName = new DevExpress.XtraReports.Parameters.Parameter();
            this.accountName = new DevExpress.XtraReports.Parameters.Parameter();
            this.reportTitle = new DevExpress.XtraReports.Parameters.Parameter();
            this.address = new DevExpress.XtraReports.Parameters.Parameter();
            this.telephone = new DevExpress.XtraReports.Parameters.Parameter();
            this.email = new DevExpress.XtraReports.Parameters.Parameter();
            this.logo = new DevExpress.XtraReports.Parameters.Parameter();
            this.BKGround = new DevExpress.XtraReports.Parameters.Parameter();
            ((System.ComponentModel.ISupportInitialize)(this)).BeginInit();
            // 
            // TopMargin
            // 
            this.TopMargin.Dpi = 254F;
            this.TopMargin.HeightF = 0F;
            this.TopMargin.Name = "TopMargin";
            // 
            // BottomMargin
            // 
            this.BottomMargin.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.BottomMargin.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.BottomMargin.BorderWidth = 0F;
            this.BottomMargin.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.label16,
            this.label15,
            this.label14,
            this.xrShape1});
            this.BottomMargin.Dpi = 254F;
            this.BottomMargin.HeightF = 284.8681F;
            this.BottomMargin.Name = "BottomMargin";
            this.BottomMargin.StylePriority.UseBorderColor = false;
            this.BottomMargin.StylePriority.UseBorderWidth = false;
            // 
            // label16
            // 
            this.label16.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label16.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label16.Dpi = 254F;
            this.label16.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?address")});
            this.label16.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
            this.label16.ForeColor = System.Drawing.Color.White;
            this.label16.LocationFloat = new DevExpress.Utils.PointFloat(891.6456F, 25.4F);
            this.label16.Multiline = true;
            this.label16.Name = "label16";
            this.label16.Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0, 254F);
            this.label16.SizeF = new System.Drawing.SizeF(1132.417F, 63.5F);
            this.label16.StylePriority.UseBackColor = false;
            this.label16.StylePriority.UseBorderColor = false;
            this.label16.StylePriority.UseFont = false;
            this.label16.StylePriority.UseForeColor = false;
            this.label16.StylePriority.UseTextAlignment = false;
            this.label16.Text = "label11";
            this.label16.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // label15
            // 
            this.label15.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label15.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label15.Dpi = 254F;
            this.label15.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?telephone")});
            this.label15.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
            this.label15.ForeColor = System.Drawing.Color.White;
            this.label15.LocationFloat = new DevExpress.Utils.PointFloat(891.6456F, 195.9681F);
            this.label15.Multiline = true;
            this.label15.Name = "label15";
            this.label15.Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0, 254F);
            this.label15.SizeF = new System.Drawing.SizeF(1132.417F, 63.49998F);
            this.label15.StylePriority.UseBackColor = false;
            this.label15.StylePriority.UseBorderColor = false;
            this.label15.StylePriority.UseFont = false;
            this.label15.StylePriority.UseForeColor = false;
            this.label15.StylePriority.UseTextAlignment = false;
            this.label15.Text = "label11";
            this.label15.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // label14
            // 
            this.label14.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label14.BorderColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.label14.Dpi = 254F;
            this.label14.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?email")});
            this.label14.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
            this.label14.ForeColor = System.Drawing.Color.White;
            this.label14.LocationFloat = new DevExpress.Utils.PointFloat(891.6456F, 109.22F);
            this.label14.Multiline = true;
            this.label14.Name = "label14";
            this.label14.Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0, 254F);
            this.label14.SizeF = new System.Drawing.SizeF(1132.417F, 63.5F);
            this.label14.StylePriority.UseBackColor = false;
            this.label14.StylePriority.UseBorderColor = false;
            this.label14.StylePriority.UseFont = false;
            this.label14.StylePriority.UseForeColor = false;
            this.label14.StylePriority.UseTextAlignment = false;
            this.label14.Text = "label11";
            this.label14.TextAlignment = DevExpress.XtraPrinting.TextAlignment.MiddleCenter;
            // 
            // xrShape1
            // 
            this.xrShape1.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(74)))), ((int)(((byte)(13)))), ((int)(((byte)(74)))));
            this.xrShape1.BorderColor = System.Drawing.Color.Thistle;
            this.xrShape1.BorderWidth = 0F;
            this.xrShape1.Dpi = 254F;
            this.xrShape1.ForeColor = System.Drawing.Color.Thistle;
            this.xrShape1.LineWidth = 0;
            this.xrShape1.LocationFloat = new DevExpress.Utils.PointFloat(0F, 0F);
            this.xrShape1.Name = "xrShape1";
            this.xrShape1.Shape = shapeRectangle1;
            this.xrShape1.SizeF = new System.Drawing.SizeF(2804.167F, 284.8681F);
            this.xrShape1.Stretch = true;
            this.xrShape1.StylePriority.UseBackColor = false;
            this.xrShape1.StylePriority.UseBorderColor = false;
            this.xrShape1.StylePriority.UseBorderWidth = false;
            this.xrShape1.StylePriority.UseForeColor = false;
            // 
            // pageInfo3
            // 
            this.pageInfo3.Dpi = 254F;
            this.pageInfo3.Font = new DevExpress.Drawing.DXFont("Arial", 10F);
            this.pageInfo3.ForeColor = System.Drawing.Color.Black;
            this.pageInfo3.LocationFloat = new DevExpress.Utils.PointFloat(2485.321F, 1797.768F);
            this.pageInfo3.Name = "pageInfo3";
            this.pageInfo3.PageInfo = DevExpress.XtraPrinting.PageInfo.DateTime;
            this.pageInfo3.SizeF = new System.Drawing.SizeF(227.5417F, 58.42004F);
            this.pageInfo3.StylePriority.UseFont = false;
            this.pageInfo3.StylePriority.UseForeColor = false;
            this.pageInfo3.TextFormatString = "{0:MMM dd, yyyy}";
            // 
            // Detail
            // 
            this.Detail.Controls.AddRange(new DevExpress.XtraReports.UI.XRControl[] {
            this.pageInfo3,
            this.pictureBox3,
            this.xrPictureBox1,
            this.xrLabel1,
            this.label9,
            this.label13});
            this.Detail.Dpi = 254F;
            this.Detail.DrillDownExpanded = false;
            this.Detail.HeightF = 1856.188F;
            this.Detail.HierarchyPrintOptions.Indent = 50.8F;
            this.Detail.KeepTogether = true;
            this.Detail.KeepTogetherWithDetailReports = true;
            this.Detail.Name = "Detail";
            // 
            // pictureBox3
            // 
            this.pictureBox3.Dpi = 254F;
            this.pictureBox3.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "ImageUrl", "?logo")});
            this.pictureBox3.LocationFloat = new DevExpress.Utils.PointFloat(94.36861F, 29F);
            this.pictureBox3.Name = "pictureBox3";
            this.pictureBox3.SizeF = new System.Drawing.SizeF(250F, 250F);
            this.pictureBox3.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // xrPictureBox1
            // 
            this.xrPictureBox1.Dpi = 254F;
            this.xrPictureBox1.ImageSource = new DevExpress.XtraPrinting.Drawing.ImageSource("img", resources.GetString("xrPictureBox1.ImageSource"));
            this.xrPictureBox1.LocationFloat = new DevExpress.Utils.PointFloat(2458.862F, 25F);
            this.xrPictureBox1.Name = "xrPictureBox1";
            this.xrPictureBox1.SizeF = new System.Drawing.SizeF(254F, 254F);
            this.xrPictureBox1.Sizing = DevExpress.XtraPrinting.ImageSizeMode.ZoomImage;
            // 
            // xrLabel1
            // 
            this.xrLabel1.Dpi = 254F;
            this.xrLabel1.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?tenantName")});
            this.xrLabel1.Font = new DevExpress.Drawing.DXFont("Arial", 36F);
            this.xrLabel1.ForeColor = System.Drawing.Color.Black;
            this.xrLabel1.LocationFloat = new DevExpress.Utils.PointFloat(194.9103F, 780.715F);
            this.xrLabel1.Multiline = true;
            this.xrLabel1.Name = "xrLabel1";
            this.xrLabel1.SizeF = new System.Drawing.SizeF(2517.952F, 230.3992F);
            this.xrLabel1.StylePriority.UseFont = false;
            this.xrLabel1.StylePriority.UseForeColor = false;
            this.xrLabel1.StylePriority.UseTextAlignment = false;
            this.xrLabel1.Text = "\r\n";
            this.xrLabel1.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // label9
            // 
            this.label9.Dpi = 254F;
            this.label9.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "\'Prepared for: \' + ?accountName"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "IsNullOrEmpty(?accountName)=false")});
            this.label9.Font = new DevExpress.Drawing.DXFont("Arial", 24F, DevExpress.Drawing.DXFontStyle.Bold);
            this.label9.LocationFloat = new DevExpress.Utils.PointFloat(194.9103F, 1257.618F);
            this.label9.Multiline = true;
            this.label9.Name = "label9";
            this.label9.Padding = new DevExpress.XtraPrinting.PaddingInfo(5, 5, 0, 0, 254F);
            this.label9.SizeF = new System.Drawing.SizeF(2517.952F, 151.024F);
            this.label9.StylePriority.UseFont = false;
            this.label9.StylePriority.UseTextAlignment = false;
            this.label9.Text = "label9";
            this.label9.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // label13
            // 
            this.label13.Dpi = 254F;
            this.label13.ExpressionBindings.AddRange(new DevExpress.XtraReports.UI.ExpressionBinding[] {
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Text", "?reportTitle"),
            new DevExpress.XtraReports.UI.ExpressionBinding("BeforePrint", "Visible", "IsNullOrEmpty(?reportTitle)=false and ?reportTitle !=\'undefined\'")});
            this.label13.Font = new DevExpress.Drawing.DXFont("Arial", 24F, DevExpress.Drawing.DXFontStyle.Bold);
            this.label13.ForeColor = System.Drawing.Color.Black;
            this.label13.LocationFloat = new DevExpress.Utils.PointFloat(194.9103F, 1064.472F);
            this.label13.Multiline = true;
            this.label13.Name = "label13";
            this.label13.SizeF = new System.Drawing.SizeF(2517.952F, 151.0242F);
            this.label13.StylePriority.UseFont = false;
            this.label13.StylePriority.UseForeColor = false;
            this.label13.StylePriority.UseTextAlignment = false;
            this.label13.Text = "\r\n";
            this.label13.TextAlignment = DevExpress.XtraPrinting.TextAlignment.TopCenter;
            // 
            // tenantName
            // 
            this.tenantName.Description = "tenantName";
            this.tenantName.Name = "tenantName";
            this.tenantName.Visible = false;
            // 
            // accountName
            // 
            this.accountName.Description = "accountName";
            this.accountName.Name = "accountName";
            this.accountName.Visible = false;
            // 
            // reportTitle
            // 
            this.reportTitle.Description = "ReportTitle";
            this.reportTitle.Name = "reportTitle";
            this.reportTitle.Visible = false;
            // 
            // address
            // 
            this.address.Description = "Address";
            this.address.Name = "address";
            this.address.Visible = false;
            // 
            // telephone
            // 
            this.telephone.Description = "Telephone";
            this.telephone.Name = "telephone";
            this.telephone.Visible = false;
            // 
            // email
            // 
            this.email.Description = "Email";
            this.email.Name = "email";
            this.email.Visible = false;
            // 
            // logo
            // 
            this.logo.Description = "logo";
            this.logo.Name = "logo";
            this.logo.Visible = false;
            // 
            // BKGround
            // 
            this.BKGround.Description = "BKGround";
            this.BKGround.Name = "BKGround";
            // 
            // CoverPage
            // 
            this.Bands.AddRange(new DevExpress.XtraReports.UI.Band[] {
            this.TopMargin,
            this.BottomMargin,
            this.Detail});
            this.Dpi = 254F;
            this.Font = new DevExpress.Drawing.DXFont("Arial", 9.75F);
            this.Landscape = true;
            this.Margins = new DevExpress.Drawing.DXMargins(0F, 0F, 0F, 284.8681F);
            this.PageHeight = 2159;
            this.PageWidth = 2794;
            this.ParameterPanelLayoutItems.AddRange(new DevExpress.XtraReports.Parameters.ParameterPanelLayoutItem[] {
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.address, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.BKGround, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.logo, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.telephone, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.email, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.tenantName, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.accountName, DevExpress.XtraReports.Parameters.Orientation.Horizontal),
            new DevExpress.XtraReports.Parameters.ParameterLayoutItem(this.reportTitle, DevExpress.XtraReports.Parameters.Orientation.Horizontal)});
            this.Parameters.AddRange(new DevExpress.XtraReports.Parameters.Parameter[] {
            this.address,
            this.BKGround,
            this.logo,
            this.telephone,
            this.email,
            this.tenantName,
            this.accountName,
            this.reportTitle});
            this.ReportUnit = DevExpress.XtraReports.UI.ReportUnit.TenthsOfAMillimeter;
            this.Scripts.OnBeforePrint = "CoverPage_BeforePrint";
            this.ScriptsSource = "\r\nprivate void CoverPage_BeforePrint(object sender, System.ComponentModel.CancelE" +
    "ventArgs e) {\r\n        string str1 = this.BKGround.Value.ToString();\r\n         \r" +
    "\n }\r\n";
            this.SnapGridSize = 25F;
            this.Version = "22.2";
            this.Watermark.ImageSource = new DevExpress.XtraPrinting.Drawing.ImageSource("img", resources.GetString("CoverPage.Watermark.ImageSource"));
            this.Watermark.ImageViewMode = DevExpress.XtraPrinting.Drawing.ImageViewMode.Stretch;
            this.Watermark.PageRange = "1";
            ((System.ComponentModel.ISupportInitialize)(this)).EndInit();

        }

        #endregion

        private DevExpress.XtraReports.UI.TopMarginBand TopMargin;
        private DevExpress.XtraReports.UI.BottomMarginBand BottomMargin;
        private DevExpress.XtraReports.Parameters.Parameter tenantName;
        private DevExpress.XtraReports.Parameters.Parameter accountName;
        private DevExpress.XtraReports.Parameters.Parameter reportTitle;
        private DevExpress.XtraReports.UI.XRPageInfo pageInfo3;
        private DevExpress.XtraReports.UI.XRLabel label16;
        private DevExpress.XtraReports.UI.XRLabel label15;
        private DevExpress.XtraReports.UI.XRLabel label14;
        public DevExpress.XtraReports.UI.DetailBand Detail;
        private DevExpress.XtraReports.Parameters.Parameter address;
        private DevExpress.XtraReports.Parameters.Parameter telephone;
        private DevExpress.XtraReports.Parameters.Parameter email;
        private DevExpress.XtraReports.UI.XRPictureBox xrPictureBox1;
        private DevExpress.XtraReports.UI.XRLabel xrLabel1;
        private DevExpress.XtraReports.UI.XRLabel label9;
        private DevExpress.XtraReports.UI.XRLabel label13;
        private DevExpress.XtraReports.UI.XRPictureBox pictureBox3;
        private DevExpress.XtraReports.Parameters.Parameter logo;
        private DevExpress.XtraReports.UI.XRShape xrShape1;
        private DevExpress.XtraReports.Parameters.Parameter BKGround;
    }
}

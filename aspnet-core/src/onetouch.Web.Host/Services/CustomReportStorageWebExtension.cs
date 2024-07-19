using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using DevExpress.XtraReports.Web.Extensions;
using DevExpress.XtraReports.UI;
using Microsoft.AspNetCore.Hosting;
using onetouch.Web.Reports;
using Abp.Runtime.Session;
using Abp.Dependency;
using DevExpress.DataAccess.Sql;
using System.Web;
using System.Net.Mail;
using onetouch.Authorization.Users;
using onetouch.Url;
using PuppeteerSharp;
using static DevExpress.Web.Internal.ColorPicker;
using System.Linq.Dynamic.Core;
using Abp.Configuration;
using DevExpress.CodeParser;
using Microsoft.Extensions.Configuration;
using NPOI.HPSF;
using onetouch.Configuration;
using Abp.Domain.Repositories;
using onetouch.Attachments;
using PayPalCheckoutSdk.Orders;
using onetouch.AppEntities;
using onetouch.AppEntities.Dtos;
using DevExpress.Xpo;
using onetouch.SystemObjects;
using Tweetinvi.Core.Extensions;

namespace onetouch.Web.Services
{


    public class CustomReportStorageWebExtension : DevExpress.XtraReports.Web.Extensions.ReportStorageWebExtension
    {
        private readonly IUserEmailer _userEmailer;
        readonly string ReportDirectory;
        const string FileExtension = ".repx";
        private readonly IConfigurationRoot _appConfiguration;
        private readonly IWebHostEnvironment _hostingEnvironment;
        private readonly IRepository<AppAttachment, long> _appAttachmentRepository;
        private readonly IRepository<AppEntityAttachment, long> _appEntityAttachmentRepository;
        private readonly IRepository<SycAttachmentCategory, long> _sycAttachmentCategoryRepository;

        public CustomReportStorageWebExtension(IWebHostEnvironment env,
            IUserEmailer userEmailer
            , IRepository<AppAttachment, long> appAttachmentRepository
            , IRepository<AppEntityAttachment, long> appEntityAttachmentRepository
            , IRepository<SycAttachmentCategory, long> sycAttachmentCategoryRepository
             )
        {
            ReportDirectory = Path.Combine(env.ContentRootPath, "Reports");
            if (!Directory.Exists(ReportDirectory))
            {
                Directory.CreateDirectory(ReportDirectory);
            }
            _userEmailer = userEmailer;
            _hostingEnvironment = env;
            _appConfiguration = env.GetAppConfiguration();
            _appAttachmentRepository = appAttachmentRepository;
            _appEntityAttachmentRepository = appEntityAttachmentRepository;
            _sycAttachmentCategoryRepository = sycAttachmentCategoryRepository;
        }

        private bool IsWithinReportsFolder(string url, string folder)
        {
            var rootDirectory = new DirectoryInfo(folder);
            var fileInfo = new FileInfo(Path.Combine(folder, url));
            return fileInfo.Directory.FullName.ToLower().StartsWith(rootDirectory.FullName.ToLower());
        }

        public override bool CanSetData(string url)
        {
            // Determines whether or not it is possible to store a report by a given URL. 
            // For instance, make the CanSetData method return false for reports that should be read-only in your storage. 
            // This method is called only for valid URLs (i.e., if the IsValidUrl method returned true) before the SetData method is called.

            return true;
        }

        public override bool IsValidUrl(string url)
        {
            // Determines whether or not the URL passed to the current Report Storage is valid. 
            // For instance, implement your own logic to prohibit URLs that contain white spaces or some other special characters. 
            // This method is called before the CanSetData and GetData methods.

            return Path.GetFileName(url) == url;
        }

        public override byte[] GetData(string url)
        {
            // Returns report layout data stored in a Report Storage using the specified URL. 
            // This method is called only for valid URLs after the IsValidUrl method is called.
            try
            {

                //get parameters and reportName
                string[] parts = url.Split("?");
                string reportName = parts[0];
                string parametersString = parts.Length > 1 ? parts[1] : String.Empty;
                XtraReport report = null;

                var parameters = HttpUtility.ParseQueryString(parametersString);

                //get tenantId
                var tenantId = long.Parse(parameters.Get("tenantId"));
                var userId = long.Parse(parameters.Get("userId"));

                var dir = Path.Combine(ReportDirectory, tenantId.ToString());
                Directory.CreateDirectory(dir);
                if (Directory.EnumerateFiles(dir).Select(Path.GetFileNameWithoutExtension).Contains(reportName))
                {
                    //report = File.ReadAllBytes(Path.Combine(dir, reportName + FileExtension));
                    byte[] reportBytes = File.ReadAllBytes(Path.Combine(dir, reportName + FileExtension));
                    using (MemoryStream ms = new MemoryStream(reportBytes))
                        report = XtraReport.FromStream(ms);
                }
                if (ReportsFactory.Reports.ContainsKey(reportName))
                {
                    using (MemoryStream ms = new MemoryStream())
                    {
                        ReportsFactory.Reports[reportName]().SaveLayoutToXml(ms);
                        //report = ms.ToArray();
                        report = ReportsFactory.Reports[reportName]();
                    }
                }

                if (report != null)
                {
                    // Assign parameters here
                    string cc = "";
                    string to = "";
                    string bcc = "";
                    string body = "";
                    string subject = "";
                    string fileName = reportName + ".pdf";
                    string transactionId = "";
                    
                    bool saveToPdf = true;
                    string orderConfirmationRole = "";
                    foreach (string parameterName in parameters.AllKeys)
                    {
                        try
                        { 

                            if (report.Parameters.ToDynamicList<DevExpress.XtraReports.Parameters.Parameter>().Find(x => x.Name == parameterName) != null
                                
                                || (parameterName.ToUpper() == "ORDERCONFIRMATIONROLE" &&
                                report.Parameters.ToDynamicList<DevExpress.XtraReports.Parameters.Parameter>().Find(x => x.Name == "roleType") != null))
                            {

                                if (parameterName.ToUpper() == "ORDERCONFIRMATIONROLE")
                                {
                                    report.Parameters["roleType"].Value = Convert.ChangeType(
                                    parameters.Get("orderConfirmationRole"), report.Parameters["roleType"].Type);

                                }
                                else
                                {
                                    report.Parameters[parameterName].Value = Convert.ChangeType(
                                  parameters.Get(parameterName), report.Parameters[parameterName].Type);

                                }

                                if (parameterName.ToUpper() == "TRANSACTIONID")
                                {
                                    transactionId = parameters.Get(parameterName).ToString();
                                    fileName = "OrderConfirmation_" + parameters.Get(parameterName).ToString() + ".pdf";
                                }
                            }
                            if (parameterName.ToUpper() == "TO")
                            { to = parameters.Get(parameterName).ToString(); }
                            if (parameterName.ToUpper() == "CC")
                            { cc = parameters.Get(parameterName).ToString(); }
                            if (parameterName.ToUpper() == "BCC")
                            { bcc = parameters.Get(parameterName).ToString(); }
                            if (parameterName.ToUpper() == "BODY")
                            { body = parameters.Get(parameterName).ToString(); }
                            if (parameterName.ToUpper() == "SUBJECT")
                            { subject = parameters.Get(parameterName).ToString(); }

                        }
                        catch (Exception ex) { }
                    }
                    var longFileName = _appConfiguration[$"Attachment:Path"] + @"\" + tenantId + @"\" + fileName;
                    Directory.CreateDirectory(_appConfiguration[$"Attachment:Path"] + @"\" + tenantId);
                    if (parameters.AllKeys.Contains("saveToPDF") && parameters.Get("saveToPDF").ToString().ToUpper() == "TRUE")
                    {
                        report.ExportToPdf(longFileName);
                        //var tt = _appEntityAttachmentRepository.GetAll().ToList();
                        var appEntityAttachment = _appEntityAttachmentRepository.GetAll().Where(e => e.EntityId == long.Parse(transactionId)).FirstOrDefault();
                        if (appEntityAttachment != null && appEntityAttachment.Id > 0)
                        {
                            _appAttachmentRepository.Delete(e => e.Id == appEntityAttachment.AttachmentId);
                            var att = new AppAttachment { Name = transactionId, Attachment = fileName, TenantId = (int)tenantId };
                            var ret = _appAttachmentRepository.InsertAndGetId(att);
                            appEntityAttachment.AttachmentId = ret;

                        }
                        else
                        {
                            var att = new AppAttachment { Name = transactionId, Attachment = fileName, TenantId = (int)tenantId };
                            var ret = _appAttachmentRepository.InsertAndGetId(att);
                            _appEntityAttachmentRepository.Insert(new AppEntityAttachment()
                            {
                                EntityId = long.Parse(transactionId),
                                AttachmentId = ret,
                                AttachmentCategoryId = _sycAttachmentCategoryRepository.GetAll().Where(e => e.Code == "FILE").FirstOrDefault().Id

                            });
                        }


                    }

                    report.RequestParameters = false;
                    if (report.Parameters.ToDynamicList<DevExpress.XtraReports.Parameters.Parameter>().Find(x => x.Name == "EmailLinesheet") != null)
                    {
                        if (parameters.AllKeys.Contains("EmailLinesheet") && report.Parameters["EmailLinesheet"].Value.ToString().ToUpper() == "TRUE")
                        {
                            using (var stream = new MemoryStream())
                            {
                                //report.ExportToPdf(stream);
                                stream.Position = 0;
                                //var attachment = new Attachment(stream, System.Net.Mime.MediaTypeNames.Application.Pdf);
                                var attachment = new Attachment(stream, "LineSheet.pdf");
                                _userEmailer.SendEmailAsync(userId, (int)tenantId, subject, to, cc, bcc, body, attachment);
                            }
                        }
                    }
                    {
                        using (MemoryStream stream = new MemoryStream())
                        {
                            report.SaveLayoutToXml(stream);
                            return stream.ToArray();
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                throw new DevExpress.XtraReports.Web.ClientControls.FaultException("Could not get report data.", ex);
            }
            throw new DevExpress.XtraReports.Web.ClientControls.FaultException(string.Format("Could not find report '{0}'.", url));
        }

        public byte[] GetData(string url, string dd22)
        {
            try
            {
                string[] parts = url.Split("?");
                string reportName = parts[0];
                string parametersString = parts.Length > 1 ? parts[1] : String.Empty;
                XtraReport report = null;

                if (Directory.EnumerateFiles(ReportDirectory).
                    Select(Path.GetFileNameWithoutExtension).Contains(reportName))
                {
                    byte[] reportBytes = File.ReadAllBytes(
                        Path.Combine(ReportDirectory, reportName + FileExtension));
                    using (MemoryStream ms = new MemoryStream(reportBytes))
                        report = XtraReport.FromStream(ms);
                }
                if (ReportsFactory.Reports.ContainsKey(reportName))
                {
                    report = ReportsFactory.Reports[reportName]();
                }

                if (report != null)
                {
                    // Assign parameters here
                    var parameters = HttpUtility.ParseQueryString(parametersString);
                    foreach (string parameterName in parameters.AllKeys)
                    {
                        report.Parameters[parameterName].Value = Convert.ChangeType(
                            parameters.Get(parameterName), report.Parameters[parameterName].Type);
                    }
                    report.RequestParameters = false;

                    using (MemoryStream ms = new MemoryStream())
                    {
                        report.SaveLayoutToXml(ms);
                        return ms.ToArray();
                    }
                }
            }
            catch (Exception ex)
            {
                throw new DevExpress.XtraReports.Web.ClientControls.FaultException(
                    "Could not get report data.", ex);
            }
            throw new DevExpress.XtraReports.Web.ClientControls.FaultException(
                string.Format("Could not find report '{0}'.", url));
        }

        public override Dictionary<string, string> GetUrls()
        {
            // Returns a dictionary of the existing report URLs and display names. 
            // This method is called when running the Report Designer, 
            // before the Open Report and Save Report dialogs are shown and after a new report is saved to a storage.

            return Directory.GetFiles(ReportDirectory, "*" + FileExtension)
                                     .Select(Path.GetFileNameWithoutExtension)
                                     .Union(ReportsFactory.Reports.Select(x => x.Key))
                                     .ToDictionary<string, string>(x => x);
        }

        public override void SetData(XtraReport report, string url)
        {
            // Stores the specified report to a Report Storage using the specified URL. 
            // This method is called only after the IsValidUrl and CanSetData methods are called.
            var tenantId = url.Split(";")[0];
            var reportName = url.Split(";")[1];
            var dir = Path.Combine(ReportDirectory, tenantId.ToString());
            if (!IsWithinReportsFolder(reportName, dir))
                throw new DevExpress.XtraReports.Web.ClientControls.FaultException("Invalid report name.");
            report.SaveLayoutToXml(Path.Combine(dir, reportName + FileExtension));
        }

        public override string SetNewData(XtraReport report, string defaultUrl)
        {
            // Stores the specified report using a new URL. 
            // The IsValidUrl and CanSetData methods are never called before this method. 
            // You can validate and correct the specified URL directly in the SetNewData method implementation 
            // and return the resulting URL used to save a report in your storage.
            SetData(report, defaultUrl);
            return defaultUrl;
        }
    }
}
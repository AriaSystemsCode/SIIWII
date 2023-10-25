using System;
using System.IO;
using DevExpress.XtraReports.Web.WebDocumentViewer;

public class CustomWebDocumentViewerExceptionHandler : WebDocumentViewerExceptionHandler
{
    public override string GetUnknownExceptionMessage(Exception ex)
    {
        if (ex is FileNotFoundException)
        {
#if DEBUG
            return ex.Message;
#else
            return "File is not found.";
#endif
        }
        return $"{ex.GetType().Name} occurred. See the log file for more details.";
    }
}

using System.Collections.Generic;
using onetouch.AppSubscriptionPlans.Dtos;
using onetouch.Dto;

namespace onetouch.AppSubscriptionPlans.Exporting
{
    public interface IAppTenantInvoicesExcelExporter
    {
        FileDto ExportToFile(List<GetAppTenantInvoiceForViewDto> appTenantInvoices);
    }
}
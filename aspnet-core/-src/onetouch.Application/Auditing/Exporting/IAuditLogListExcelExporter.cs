using System.Collections.Generic;
using onetouch.Auditing.Dto;
using onetouch.Dto;

namespace onetouch.Auditing.Exporting
{
    public interface IAuditLogListExcelExporter
    {
        FileDto ExportToFile(List<AuditLogListDto> auditLogListDtos);

        FileDto ExportToFile(List<EntityChangeListDto> entityChangeListDtos);
    }
}

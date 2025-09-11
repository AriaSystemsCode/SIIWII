using System.Collections.Generic;
using Abp;
using onetouch.Chat.Dto;
using onetouch.Dto;

namespace onetouch.Chat.Exporting
{
    public interface IChatMessageListExcelExporter
    {
        FileDto ExportToFile(UserIdentifier user, List<ChatMessageExportDto> messages);
    }
}

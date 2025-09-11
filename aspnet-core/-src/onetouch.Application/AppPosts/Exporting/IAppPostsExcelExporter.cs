using System.Collections.Generic;
using onetouch.AppPosts.Dtos;
using onetouch.Dto;

namespace onetouch.AppPosts.Exporting
{
    public interface IAppPostsExcelExporter
    {
        FileDto ExportToFile(List<GetAppPostForViewDto> appPosts);
    }
}
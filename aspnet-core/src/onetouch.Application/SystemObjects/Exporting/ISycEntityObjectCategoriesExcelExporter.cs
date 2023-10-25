using System.Collections.Generic;
using onetouch.SystemObjects.Dtos;
using onetouch.Dto;

namespace onetouch.SystemObjects.Exporting
{
    public interface ISycEntityObjectCategoriesExcelExporter
    {
        FileDto ExportToFile(List<GetSycEntityObjectCategoryForViewDto> sycEntityObjectCategories);
    }
}
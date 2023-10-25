using onetouch.Globals.Dtos;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace onetouch.Globals
{
    public interface IExcelImporter<T> where T: class
    {
       Task<ExcelTemplateDto> GetExcelTemplate(long? TypeId);

       Task<T> ValidateExcel(string guidFile, string[] imagesList);
       Task<ExcelLogDto> SaveFromExcel(T excelResultsDTO);
    }
}

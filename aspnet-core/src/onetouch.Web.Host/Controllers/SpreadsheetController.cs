using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Syncfusion.EJ2.Spreadsheet;

namespace onetouch.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SpreadsheetController : ControllerBase
    {
        [HttpPost("Save")]
        public IActionResult Save([FromForm] SaveSettings saveSettings)
        {
            
            if (saveSettings == null ||
                  string.IsNullOrEmpty(saveSettings.JSONData))
            {
                return BadRequest("Spreadsheet data is missing.");
            }
            return Workbook.Save(saveSettings);
        }
    }
}

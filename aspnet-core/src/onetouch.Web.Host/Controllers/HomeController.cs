using Abp.Auditing;
using Microsoft.AspNetCore.Mvc;

namespace onetouch.Web.Controllers
{
    public class HomeController : onetouchControllerBase
    {
        [DisableAuditing]
        public IActionResult Index()
        {
            return RedirectToAction("Index", "Ui");
        }
    }
}

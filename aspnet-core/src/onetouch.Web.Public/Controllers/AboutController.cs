using Microsoft.AspNetCore.Mvc;
using onetouch.Web.Controllers;

namespace onetouch.Web.Public.Controllers
{
    public class AboutController : onetouchControllerBase
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}
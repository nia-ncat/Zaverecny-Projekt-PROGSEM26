using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography;

namespace WebApp.Controllers
{
    public class HelloController : Controller
    {
        // GET: /<controller>/
        public IActionResult Index()
        {
            string html = "<h1>Hello World!</h1>";
            return Content(html, "text/html");
        }
    }
}

namespace WebApp
{
    public class Program
    {
        //connecrs it all tgthr
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args); //builder is like a project manager

            // Add services to the container.
            builder.Services.AddControllersWithViews(); //DI ACtivated dependency injection - gimme all the dependencies

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error"); //enhances security and energy management
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection(); // allows us to redirect to other sites ??????? i think
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.Run();
        }
    }
}

using Microsoft.EntityFrameworkCore;
using MediaMTX_Gui.Server.Models;

namespace MediaMTX_Gui.Server.Data
{
    public class ApplicationDbContext(DbContextOptions<ApplicationDbContext>options) : DbContext(options)
    {
        public DbSet<MediaStream> Streams => Set<MediaStream>();
    }
}

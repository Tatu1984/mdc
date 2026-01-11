using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Metadata;
using System.Text;
using System.Threading.Tasks;

namespace MDC.Core.Services.Providers.MDCDatabase
{
    // To Add migration run the following:
    // dotnet ef migrations add InitialCreate --startup-project "MDC.Api" --output-dir "MDC.Core/Migrations"
    // You may need to install dotnet EF: dotnet tool install --global dotnet-ef
    internal class MDCDbContext(IConfiguration configuration) : DbContext
    {
        public DbSet<DbDatacenter> Datacenters { get; set; }

        public DbSet<DbWorkspace> Workspaces { get; set; }

        public DbSet<DbVirtualNetwork> VirtualNetworks { get; set; }

        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (optionsBuilder.IsConfigured)
            {
                return;
            }
            // Use the connection string from the configuration
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                // For testing purposes, use an in-memory database if no connection string is provided
                // optionsBuilder.UseInMemoryDatabase("MDC");
                throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
            }
            optionsBuilder.UseNpgsql(connectionString, options =>
            {
                options.MigrationsAssembly("MDC.Core");
                options.MigrationsHistoryTable("__EFMigrationsHistory");
            });
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<DbDatacenter>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Description).IsRequired().HasMaxLength(1000);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();

                entity.HasMany(e => e.Workspaces)
                    .WithOne(w => w.Datacenter)
                    .HasForeignKey(w => w.DatacenterId)
                    .IsRequired();
            });

            modelBuilder.Entity<DbWorkspace>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Address).IsRequired();
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                entity.Property(e => e.DatacenterId).IsRequired();
                
                entity.HasOne(e => e.Datacenter)
                    .WithMany(d => d.Workspaces)
                    .HasForeignKey(e => e.DatacenterId)
                    .IsRequired();

                entity.HasMany(e => e.VirtualNetworks)
                    .WithOne(vn => vn.Workspace)
                    .HasForeignKey(vn => vn.WorkspaceId);
            });

            modelBuilder.Entity<DbVirtualNetwork>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Id).ValueGeneratedOnAdd();
                entity.Property(e => e.Name).IsRequired().HasMaxLength(255);
                entity.Property(e => e.Index).IsRequired();
                entity.Property(e => e.Tag).IsRequired();
                entity.Property(e => e.CreatedAt).IsRequired();
                entity.Property(e => e.UpdatedAt).IsRequired();
                entity.Property(e => e.WorkspaceId).IsRequired();
                
                entity.HasOne(e => e.Workspace)
                    .WithMany(w => w.VirtualNetworks)
                    .HasForeignKey(e => e.WorkspaceId);
            });
        }
    }
}

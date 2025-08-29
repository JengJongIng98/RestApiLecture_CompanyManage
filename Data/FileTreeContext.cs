using Microsoft.EntityFrameworkCore;
using System;

namespace Project_CompanyManage.Data
{
    public class FileTreeContext : DbContext
    {
        public FileTreeContext(DbContextOptions<FileTreeContext> options) : base(options)
        {

        }

        public DbSet<FileTree> Todos { get; set; }

    } // class TodoContext
} // namespace
using Microsoft.EntityFrameworkCore;
using System;

namespace Project_CompanyManage.Data
{
    public class TodoContext : DbContext
    {
        public TodoContext(DbContextOptions<TodoContext> options) : base(options)
        {

        }

        public DbSet<Todo> Todos { get; set; }

    } // class TodoContext
} // namespace
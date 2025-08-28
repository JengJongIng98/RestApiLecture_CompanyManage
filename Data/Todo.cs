namespace Project_CompanyManage.Data
{
    public class Todo
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public DateTime CreatedDate { get; set; }

    } // class Todo
} // namespace

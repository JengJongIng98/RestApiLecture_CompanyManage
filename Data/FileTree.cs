using System.ComponentModel.DataAnnotations;

namespace Project_CompanyManage.Data
{
    public class FileTree
    {
        [Key]
        public string FolderId { get; set; } = GenerateRandomId();

        [Required]
        public string FolderName { get; set; } = string.Empty;

        public string UpperFolderId { get; set; } = string.Empty;

        [Required]
        public string FilePath { get; set; } = string.Empty;

        [Required]
        public int FolderDepth { get; set; }

        [Required]
        public string FolderCreateDate { get; set; } = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");

        [Required]
        public string FolderCreateUserId { get; set; } = Environment.UserName;

        public int FolderCount { get; set; }
        public int FileCount { get; set; }

        private static string GenerateRandomId()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyz0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 24)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}

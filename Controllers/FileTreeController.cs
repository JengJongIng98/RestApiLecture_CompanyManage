using Microsoft.AspNetCore.Mvc;
using Project_CompanyManage.Data;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Project_CompanyManage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FileTreeController : ControllerBase
    {
        private readonly FileTreeContext _context;

        public FileTreeController(FileTreeContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetFolderInfoAll()
        {
            var folders = _context.Todos.ToList();
            return Ok(folders);
        }

        [HttpGet("{folderId}")]
        public IActionResult GetFolderInfo(string folderId)
        {
            var folder = _context.Todos.Find(folderId);
            if (folder == null) return NotFound();
            return Ok(folder);
        }

        //[HttpPost]
        //public IActionResult FolderCreate([FromBody] FileTree fileTree)
        //{
        //    if (fileTree == null)
        //        return BadRequest("Invalid folder data.");

        //    // 중복 체크 (optional)
        //    var exists = _context.Todos.Any(f => f.FolderId == fileTree.FolderId);
        //    if (exists)
        //        return Conflict("FolderId already exists.");

        //    // 생성 날짜 및 사용자 (서버에서 설정)
        //    fileTree.FolderCreateDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
        //    fileTree.FolderCreateUserId = Environment.UserName ?? "system";

        //    _context.Todos.Add(fileTree);
        //    _context.SaveChanges();

        //    return CreatedAtAction(nameof(GetFolderInfo), new { folderId = fileTree.FolderId }, fileTree);
        //}

        [HttpPost]
        public IActionResult FolderCreate([FromBody] FileTree fileTree)
        {
            if (fileTree == null)
                return BadRequest("Invalid folder data.");

            // 생성 날짜 및 사용자
            fileTree.FolderCreateDate = DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss");
            fileTree.FolderCreateUserId = Environment.UserName ?? "system";

            // FolderCount와 FileCount 초기화
            fileTree.FolderCount = 0;
            fileTree.FileCount = 0;

            _context.Todos.Add(fileTree);

            // 상위 폴더가 있다면 FolderCount 증가
            if (!string.IsNullOrEmpty(fileTree.UpperFolderId))
            {
                var parentFolder = _context.Todos.Find(fileTree.UpperFolderId);
                if (parentFolder != null)
                {
                    parentFolder.FolderCount += 1;
                }
            }

            _context.SaveChanges();

            return CreatedAtAction(nameof(GetFolderInfo), new { folderId = fileTree.FolderId }, fileTree);
        }

        //[HttpDelete("{folderId}")]
        //public IActionResult DeleteFolder(string folderId)
        //{
        //    var folder = _context.Todos.Find(folderId);
        //    if (folder == null) return NotFound();

        //    if (folder.FolderCount == 0 && folder.FileCount == 0)
        //    {
        //        _context.Todos.Remove(folder);
        //        _context.SaveChanges();
        //        return NoContent();
        //    }
        //    else
        //    {
        //        return BadRequest("하위 경로에 파일이나 폴더가 존재합니다.");
        //    }
        //}

        //[HttpDelete("{FolderId}")]
        //public IActionResult DeleteFolder(string folderId)
        //{
        //    var folder = _context.Todos.Find(folderId);
        //    if (folder == null) return NotFound();

        //    // ✅ 현재 폴더에 하위 폴더나 파일이 존재하는지 검사
        //    bool hasChildFolders = _context.Todos.Any(f => f.UpperFolderId == folder.FolderId);
        //    if (hasChildFolders || folder.FileCount > 0)
        //    {
        //        return BadRequest("하위 경로에 파일이나 폴더가 존재합니다.");
        //    }

        //    // ✅ 삭제 전, 부모 폴더의 FolderCount를 감소
        //    if (!string.IsNullOrEmpty(folder.UpperFolderId))
        //    {
        //        var parentFolder = _context.Todos.Find(folder.UpperFolderId);
        //        if (parentFolder != null)
        //        {
        //            parentFolder.FolderCount = Math.Max(0, parentFolder.FolderCount - 1);
        //        }
        //    }

        //    // 폴더 삭제
        //    _context.Todos.Remove(folder);
        //    _context.SaveChanges();

        //    return NoContent();
        //}

        [HttpDelete("{FolderId}")]
        public IActionResult DeleteFolder(string folderId)
        {
            var folder = _context.Todos.Find(folderId);
            if (folder == null) return NotFound();

            if (folder.FolderCount == 0 && folder.FileCount == 0)
            {
                _context.Todos.Remove(folder);

                // 상위 폴더가 있다면 FolderCount 감소
                if (!string.IsNullOrEmpty(folder.UpperFolderId))
                {
                    var parentFolder = _context.Todos.Find(folder.UpperFolderId);
                    if (parentFolder != null && parentFolder.FolderCount > 0)
                    {
                        parentFolder.FolderCount -= 1;
                    }
                }

                _context.SaveChanges();
                return NoContent();
            }
            else
            {
                return BadRequest("하위 경로에 파일이나 폴더가 존재합니다.");
            }
        }

        [HttpPut("{FolderId}")]
        public IActionResult FolderUpdate(string folderId, FileTree updatedFolder)
        {
            if (folderId != updatedFolder.FolderId)
                return BadRequest("FolderId가 URL과 일치하지 않습니다.");

            var existingFolder = _context.Todos.Find(folderId);
            if (existingFolder == null)
                return NotFound();

            // 폴더 이름 변경
            existingFolder.FolderName = updatedFolder.FolderName;

            // ✅ 상위 경로를 기반으로 새 filePath 계산
            string parentPath = "";
            if (!string.IsNullOrEmpty(existingFolder.UpperFolderId))
            {
                var upper = _context.Todos.Find(existingFolder.UpperFolderId);
                if (upper != null)
                    parentPath = upper.FilePath;
            }

            existingFolder.FilePath = string.IsNullOrEmpty(parentPath)
                ? updatedFolder.FolderName
                : $"{parentPath}/{updatedFolder.FolderName}";

            // 깊이 정보는 변경되지 않음
            _context.SaveChanges();

            return NoContent();
        }
    }
}

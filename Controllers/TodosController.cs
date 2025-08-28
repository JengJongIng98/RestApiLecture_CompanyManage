using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Project_CompanyManage.Data;
using System;

namespace Project_CompanyManage.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TodosController : ControllerBase
    {
        private readonly TodoContext _context;

        public TodosController(TodoContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetAll()
        {
            var todos = _context.Todos.ToList();
            return Ok(todos);
        } // GetAll()

        [HttpGet("{id}")]
        public IActionResult GetById(int id)
        {
            var todo = _context.Todos.Find(id);
            if (todo == null) return NotFound();
            return Ok(todo);
        } // GetById()

        [HttpPost]
        public IActionResult Create(Todo todo)
        {
            todo.CreatedDate = DateTime.UtcNow;
            _context.Todos.Add(todo);
            _context.SaveChanges();
            return CreatedAtAction(nameof(GetById), new { id = todo.Id }, todo);
        } // Create()

        [HttpDelete("{id}")]
        public IActionResult Delete(int id)
        {
            var todo = _context.Todos.Find(id);
            if (todo == null) return NotFound();

            _context.Todos.Remove(todo);
            _context.SaveChanges();
            return NoContent();
        } // Delete()

        [HttpPut("{id}")]
        public IActionResult Update(int id, Todo updatedTodo)
        {
            if (id != updatedTodo.Id)
                return BadRequest("ID가 URL과 일치하지 않습니다.");

            var existingTodo = _context.Todos.Find(id);
            if (existingTodo == null)
                return NotFound();

            // 필요한 속성들만 업데이트
            existingTodo.AuthorName = updatedTodo.AuthorName;
            existingTodo.Content = updatedTodo.Content;
            // CreatedDate는 보통 수정하지 않으므로 건드리지 않음

            _context.SaveChanges();

            return NoContent();  // 204 상태 코드 반환 (수정 성공, 반환값 없음)
        } // Update()

    } // class TodosController
} // namespace

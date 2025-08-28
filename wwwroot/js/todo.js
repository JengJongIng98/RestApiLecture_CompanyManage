const apiBaseUrl = '/api/todos';
const output = document.getElementById('output');

const sampleTodos = [
    { authorName: "Alice", content: "첫 번째 할 일" },
    { authorName: "Bob", content: "두 번째 할 일" },
    { authorName: "Charlie", content: "세 번째 할 일" }
];

function log(message) {
    output.textContent += message + "\n\n";
}

// 1. 전체 조회
function getAllTodos() {
    output.textContent = "전체 Todo 조회 중...\n";
    fetch(apiBaseUrl)
        .then(res => res.json())
        .then(data => log(JSON.stringify(data, null, 2)))
        .catch(err => log("에러 발생: " + err));
}

// 2. ID로 조회 (여기서는 1번 ID 고정)
function getTodoById() {
    const id = 1;
    output.textContent = `ID=${id} Todo 조회 중...\n`;
    fetch(`${apiBaseUrl}/${id}`)
        .then(res => {
            if (!res.ok) throw new Error("찾을 수 없음");
            return res.json();
        })
        .then(data => log(JSON.stringify(data, null, 2)))
        .catch(err => log("에러 발생: " + err));
}

// 3. Todo 생성 (sampleTodos 중 랜덤 하나 선택)
function createTodo() {
    const todo = sampleTodos[Math.floor(Math.random() * sampleTodos.length)];
    output.textContent = `Todo 생성 중...\n${JSON.stringify(todo)}\n`;
    fetch(apiBaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todo)
    })
        .then(res => {
            if (!res.ok) throw new Error("생성 실패");
            return res.json();
        })
        .then(data => log("생성 성공:\n" + JSON.stringify(data, null, 2)))
        .catch(err => log("에러 발생: " + err));
}

// 4. Todo 수정 (ID=1 고정, Content 수정)
function updateTodo() {
    const id = 1;
    const updatedTodo = {
        id: id,
        authorName: "수정된 작성자",
        content: "수정된 내용",
        createdDate: new Date().toISOString()
    };
    output.textContent = `Todo 수정 중... ID=${id}\n`;
    fetch(`${apiBaseUrl}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTodo)
    })
        .then(res => {
            if (!res.ok) throw new Error("수정 실패");
            log("수정 성공");
        })
        .catch(err => log("에러 발생: " + err));
}

// 5. Todo 삭제 (ID=1 고정)
function deleteTodo() {
    const id = 1;
    output.textContent = `Todo 삭제 중... ID=${id}\n`;
    fetch(`${apiBaseUrl}/${id}`, { method: 'DELETE' })
        .then(res => {
            if (res.status === 204) {
                log("삭제 성공");
            } else {
                throw new Error("삭제 실패");
            }
        })
        .catch(err => log("에러 발생: " + err));
}
const apiBase = '/api/FileTree';

let selectedFolder = null;  // 전역 변수로 현재 선택된 폴더 저장

document.addEventListener('DOMContentLoaded', () => {
    loadFolders();

    document.getElementById('btnLoadFolders').addEventListener('click', () => {
        loadFolders();
    });

    document.getElementById('btnCreateFolder').addEventListener('click', () => {
        clearModal();
        populateUpperFolders();
        const modal = new bootstrap.Modal(document.getElementById('folderModal'));
        modal.show();
    });

    document.getElementById('upperFolderId').addEventListener('change', (e) => {
        const selectedId = e.target.value;
        if (selectedId) {
            fetch(`${apiBase}/${selectedId}`)
                .then(res => {
                    if (!res.ok) throw new Error('상위 폴더 정보를 불러오는 데 실패했습니다.');
                    return res.json();
                })
                .then(data => {
                    document.getElementById('folderDepth').value = data.folderDepth + 1;
                    let path = data.filePath;
                    if (!path.endsWith('/')) path += '/';
                    document.getElementById('filePath').value = path + (document.getElementById('folderName').value || '');
                })
                .catch(() => {
                    document.getElementById('folderDepth').value = 0;
                    document.getElementById('filePath').value = '';
                });
        } else {
            document.getElementById('folderDepth').value = 0;
            document.getElementById('filePath').value = '';
        }
    });

    document.getElementById('folderName').addEventListener('input', () => {
        const upperFolderId = document.getElementById('upperFolderId').value;
        if (upperFolderId) {
            fetch(`${apiBase}/${upperFolderId}`)
                .then(res => res.json())
                .then(data => {
                    let path = data.filePath;
                    if (!path.endsWith('/')) path += '/';
                    document.getElementById('filePath').value = path + document.getElementById('folderName').value;
                })
                .catch(() => {
                    document.getElementById('filePath').value = document.getElementById('folderName').value;
                });
        } else {
            document.getElementById('filePath').value = document.getElementById('folderName').value;
        }
    });

    document.getElementById('folderForm').addEventListener('submit', (e) => {
        e.preventDefault();

        const newFolder = {
            folderId: generateRandomId(24),
            folderName: document.getElementById('folderName').value.trim(),
            upperFolderId: document.getElementById('upperFolderId').value || '',
            filePath: document.getElementById('filePath').value.trim(),
            folderDepth: parseInt(document.getElementById('folderDepth').value, 10) || 0,
            folderCreateDate: new Date().toISOString().slice(0, 19).replace('T', ' '),
            //folderCreateUserId: '',  // 서버에서 처리
            folderCount: 0,
            fileCount: 0
        };

        if (!newFolder.folderName) {
            alert('폴더 이름을 입력해주세요.');
            return;
        }

        fetch(apiBase, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newFolder)
        })
            .then(res => {
                if (res.ok) return res.json();
                return res.text().then(text => { throw new Error(text); });
            })
            .then(() => {
                const modalEl = document.getElementById('folderModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                loadFolders();
            })
            .catch(err => alert('폴더 생성 실패: ' + err.message));
    });

    document.getElementById('btnDeleteFolder').addEventListener('click', () => {
        if (!selectedFolder) {
            alert('삭제할 폴더를 선택하세요.');
            return;
        }

        if (!confirm(`폴더 "${selectedFolder.folderName}" 을(를) 삭제하시겠습니까?`)) {
            return;
        }

        fetch(`${apiBase}/${selectedFolder.folderId}`, {
            method: 'DELETE'
        })
            .then(res => {
                if (res.ok) {
                    alert('삭제 완료');
                    selectedFolder = null;
                    document.getElementById('btnDeleteFolder').disabled = true;
                    loadFolders();
                } else {
                    return res.text().then(text => {
                        throw new Error(text);
                    });
                }
            })
            .catch(err => {
                alert('삭제 실패: ' + err.message);
            });
    });


    document.getElementById('btnEditFolder').addEventListener('click', openEditModal); // ✅ 추가
    document.getElementById('editFolderForm').addEventListener('submit', handleEditFolder); // ✅ 추가
});

function loadFolders() {
    fetch(apiBase)
        .then(res => res.json())
        .then(data => {
            const container = document.getElementById('folderTree');
            container.innerHTML = '';

            const treeData = buildTree(data);
            container.appendChild(renderTreeNodes(treeData));

            if (treeData.length > 0) {
                showFolderInfo(treeData[0]);
            } else {
                clearFolderInfo();
            }
        })
        .catch(() => alert('폴더 목록을 불러오는 중 오류가 발생했습니다.'));
}

// 트리 구조로 변환
function buildTree(items) {
    const map = {};
    const roots = [];

    items.forEach(item => {
        item.children = [];
        map[item.folderId] = item;
    });

    items.forEach(item => {
        if (item.upperFolderId && item.upperFolderId !== '') {
            if (map[item.upperFolderId]) {
                map[item.upperFolderId].children.push(item);
            } else {
                roots.push(item); // 상위 폴더가 없으면 최상위로 간주
            }
        } else {
            roots.push(item);
        }
    });

    return roots;
}

// 트리노드 렌더링
function renderTreeNodes(nodes) {
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'list-group-flush');

    nodes.forEach(node => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');

        const span = document.createElement('span');
        span.textContent = node.folderName;
        span.style.cursor = 'pointer';
        span.addEventListener('click', () => {
            showFolderInfo(node);
            highlightSelected(li);
        });

        li.appendChild(span);

        if (node.children && node.children.length > 0) {
            li.appendChild(renderTreeNodes(node.children));
        }

        ul.appendChild(li);
    });

    return ul;
}

// 선택된 노드 하이라이트
function highlightSelected(selectedLi) {
    document.querySelectorAll('#folderTree li').forEach(li => {
        li.classList.remove('active');
    });
    selectedLi.classList.add('active');
}

function showFolderInfo(folder) {
    selectedFolder = folder;
    document.getElementById('btnDeleteFolder').disabled = false;
    document.getElementById('btnEditFolder').disabled = false;

    document.getElementById('infoFolderId').textContent = folder.folderId;
    document.getElementById('infoFolderName').textContent = folder.folderName;
    document.getElementById('infoUpperFolderId').textContent = folder.upperFolderId || '(없음)';
    document.getElementById('infoFilePath').textContent = folder.filePath;
    document.getElementById('infoFolderDepth').textContent = folder.folderDepth;
    document.getElementById('infoCreateDate').textContent = folder.folderCreateDate;
    document.getElementById('infoCreateUserId').textContent = folder.folderCreateUserId;
    document.getElementById('infoFolderCount').textContent = folder.folderCount;
    document.getElementById('infoFileCount').textContent = folder.fileCount;
}

function clearFolderInfo() {
    selectedFolder = null;
    document.getElementById('btnDeleteFolder').disabled = true;

    const fields = ['infoFolderId', 'infoFolderName', 'infoUpperFolderId', 'infoFilePath', 'infoFolderDepth', 'infoCreateDate', 'infoCreateUserId', 'infoFolderCount', 'infoFileCount'];
    fields.forEach(id => {
        document.getElementById(id).textContent = '';
    });
}

function clearModal() {
    document.getElementById('folderName').value = '';
    document.getElementById('upperFolderId').value = '';
    document.getElementById('folderDepth').value = 0;
    document.getElementById('filePath').value = '';
}

function populateUpperFolders() {
    fetch(apiBase)
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById('upperFolderId');
            select.innerHTML = '<option value="">(없음)</option>';
            data.forEach(folder => {
                const option = document.createElement('option');
                option.value = folder.folderId;
                option.textContent = folder.folderName;
                select.appendChild(option);
            });
        })
        .catch(() => alert('상위 폴더 목록을 불러오는 중 오류가 발생했습니다.'));
}

// 24자리 랜덤 ID 생성기 (소문자+숫자)
function generateRandomId(length) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function openEditModal() {
    if (!selectedFolder) return;

    document.getElementById('editFolderName').value = selectedFolder.folderName;

    const modal = new bootstrap.Modal(document.getElementById('editFolderModal'));
    modal.show();
}

function handleEditFolder(e) {
    e.preventDefault();

    const newName = document.getElementById('editFolderName').value.trim();
    if (!selectedFolder) return;

    const updated = {
        ...selectedFolder,
        folderName: newName
    };

    fetch(`${apiBase}/${selectedFolder.folderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
    })
        .then(res => {
            if (res.ok) {
                const modalEl = document.getElementById('editFolderModal');
                const modal = bootstrap.Modal.getInstance(modalEl);
                modal.hide();
                loadFolders();
            } else {
                return res.text().then(text => { throw new Error(text); });
            }
        })
        .catch(err => alert('폴더 수정 실패: ' + err.message));
}

// 파일 업로드 및 이미지 저장
function uploadFile(team) {
    const fileInput = document.getElementById('fileInput');
    const uploadedFiles = document.getElementById('uploadedFiles');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const fileData = {
                name: file.name,
                content: e.target.result,  // 파일의 Base64 데이터
                type: file.type            // 파일의 MIME 타입 저장
            };

            // 팀별 파일 목록을 로컬 스토리지에서 가져오기
            let files = JSON.parse(localStorage.getItem(`${team}_files`)) || [];
            files.push(fileData);
            localStorage.setItem(`${team}_files`, JSON.stringify(files));

            // 파일 목록 갱신
            displayUploadedFiles(team);
        };
        reader.readAsDataURL(file);  // 이미지 파일을 Base64 형식으로 읽음
    }
}

// 업로드된 파일 표시
function displayUploadedFiles(team) {
    const uploadedFiles = document.getElementById('uploadedFiles');
    const files = JSON.parse(localStorage.getItem(`${team}_files`)) || [];
    uploadedFiles.innerHTML = '';  // 기존 목록 초기화

    files.forEach((file, index) => {
        const fileElement = document.createElement('div');
        fileElement.innerHTML = `
            <a href="${file.content}" download="${file.name}">${file.name}</a>
            <button onclick="deleteFile(${index}, '${team}')">삭제</button>
        `;
        uploadedFiles.appendChild(fileElement);
    });
}

// 파일 삭제
function deleteFile(index, team) {
    let files = JSON.parse(localStorage.getItem(`${team}_files`)) || [];
    files.splice(index, 1);  // 선택한 파일을 목록에서 삭제
    localStorage.setItem(`${team}_files`, JSON.stringify(files));
    displayUploadedFiles(team);  // 목록 다시 표시
}

// 글 작성 저장
function saveText(team) {
    const textInput = document.getElementById('textInput').value;

    if (textInput) {
        const newText = {
            content: textInput,
            date: new Date().toLocaleString()
        };

        // 팀별 글 목록을 로컬 스토리지에서 가져오기
        let texts = JSON.parse(localStorage.getItem(`${team}_texts`)) || [];
        texts.push(newText);

        // 로컬 스토리지에 다시 저장
        localStorage.setItem(`${team}_texts`, JSON.stringify(texts));

        // 입력 필드 초기화 및 글 목록 갱신
        document.getElementById('textInput').value = '';
        displaySavedTexts(team);
    }
}

// 저장된 글 표시
function displaySavedTexts(team) {
    const savedTexts = document.getElementById('savedTexts');
    const texts = JSON.parse(localStorage.getItem(`${team}_texts`)) || [];
    savedTexts.innerHTML = '';  // 기존 목록 초기화

    texts.forEach((text, index) => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <span>${text.date}: ${text.content}</span>
            <button onclick="editText(${index}, '${team}')">수정</button>
            <button onclick="deleteText(${index}, '${team}')">삭제</button>
        `;
        savedTexts.appendChild(listItem);
    });
}

// 글 수정 기능
function editText(index, team) {
    const texts = JSON.parse(localStorage.getItem(`${team}_texts`)) || [];
    const newText = prompt("수정할 내용을 입력하세요:", texts[index].content);

    if (newText !== null) {
        texts[index].content = newText;
        localStorage.setItem(`${team}_texts`, JSON.stringify(texts));
        displaySavedTexts(team);
    }
}

// 글 삭제 기능
function deleteText(index, team) {
    let texts = JSON.parse(localStorage.getItem(`${team}_texts`)) || [];
    texts.splice(index, 1);  // 선택한 글을 목록에서 삭제
    localStorage.setItem(`${team}_texts`, JSON.stringify(texts));
    displaySavedTexts(team);
}

// 페이지 로드 시 데이터 표시
window.onload = function () {
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
    displayUploadedFiles(currentPage);
    displaySavedTexts(currentPage);
};

// 모든 페이지의 파일 및 글 데이터를 한 번에 ZIP 파일로 다운로드
document.getElementById('downloadAll').addEventListener('click', downloadAllFilesAndTexts);

function downloadAllFilesAndTexts() {
    let zip = new JSZip(); // 새 ZIP 파일 생성

    // 모든 페이지의 파일 및 글 데이터를 로컬 스토리지에서 가져옴
    let pages = ['index', 'team1', 'team2', 'team3', 'team4'];
    pages.forEach(page => {
        let files = JSON.parse(localStorage.getItem(`${page}_files`) || '[]');
        let texts = JSON.parse(localStorage.getItem(`${page}_texts`) || '[]');

        // 파일들을 ZIP에 추가
        files.forEach((file, index) => {
            let blob = base64ToBlob(file.content, file.type);
            zip.file(`${page}/file${index + 1}.${file.name.split('.').pop()}`, blob);
        });

        // 글들을 ZIP에 텍스트 파일로 추가
        texts.forEach((text, index) => {
            zip.file(`${page}/text${index + 1}.txt`, text.content);
        });
    });

    // ZIP 파일을 생성하고 다운로드
    zip.generateAsync({ type: "blob" }).then(function(content) {
        let a = document.createElement('a');
        a.href = URL.createObjectURL(content);
        a.download = 'all_files_and_texts.zip';
        a.click();
    });
}

// Base64 데이터를 Blob으로 변환하는 함수
function base64ToBlob(base64, mime) {
    let byteString = atob(base64.split(',')[1]);
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mime });
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/.netlify/functions/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();
            alert(result.message); // 성공 메시지 표시
        } catch (error) {
            console.error('파일 업로드 중 오류 발생:', error);
        }
    }
}


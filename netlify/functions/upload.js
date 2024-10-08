// functions/upload.js
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');

exports.handler = async (event, context) => {
    const form = new formidable.IncomingForm();
    form.parse(event, async (err, fields, files) => {
        if (err) {
            return { statusCode: 500, body: JSON.stringify({ message: '파일 파싱 중 오류 발생' }) };
        }

        const file = files.file; // 입력 이름에 따라 조정
        const uploadPath = path.join(__dirname, '../uploads', file.name); // uploads 디렉토리가 존재해야 함

        // 파일을 서버에 저장
        fs.rename(file.path, uploadPath, (err) => {
            if (err) {
                return { statusCode: 500, body: JSON.stringify({ message: '파일 저장 중 오류 발생' }) };
            }
        });

        return { statusCode: 200, body: JSON.stringify({ message: '파일이 성공적으로 업로드되었습니다!' }) };
    });
};

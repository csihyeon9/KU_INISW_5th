const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const { fileContent, fileName } = data;
    
    const uploadPath = path.join('/tmp', fileName); // Netlify에서의 임시 저장 경로
    
    // 파일을 Base64로 디코딩 후 저장
    const buffer = Buffer.from(fileContent, 'base64');
    
    fs.writeFileSync(uploadPath, buffer);
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'File uploaded successfully!', fileName })
    };
};

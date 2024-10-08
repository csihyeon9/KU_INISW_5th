const fs = require('fs');
const path = require('path');

exports.handler = async (event) => {
    const data = JSON.parse(event.body);
    const { textContent } = data;
    
    const filePath = path.join('/tmp', 'texts.json');
    
    let texts = [];
    if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf-8');
        texts = JSON.parse(fileData);
    }
    
    texts.push({ content: textContent, date: new Date().toISOString() });
    
    fs.writeFileSync(filePath, JSON.stringify(texts));
    
    return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Text saved successfully!' })
    };
};

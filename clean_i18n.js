const fs = require('fs');
const path = require('path');

const filePaths = [
    'src/renderer/src/i18n/en.js',
    'src/renderer/src/i18n/es.js'
];

filePaths.forEach(filePath => {
    const fullPath = path.resolve(filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`File not found: ${fullPath}`);
        return;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');
    const seenKeys = new Set();
    const newLines = [];

    // Simple regex to capture key: 'value' or key: "value" or key:`value`
    // assuming keys are at the start of the line or indented
    const keyRegex = /^\s*([a-zA-Z0-9_]+):\s*['"`]/;

    for (const line of lines) {
        const match = line.match(keyRegex);
        if (match) {
            const key = match[1];
            if (seenKeys.has(key)) {
                console.log(`Removing duplicate key: ${key} in ${filePath}`);
                continue;
            }
            seenKeys.add(key);
        }
        newLines.push(line);
    }

    fs.writeFileSync(fullPath, newLines.join('\n'));
    console.log(`Cleaned ${filePath}`);
});

const fs = require('fs');
const path = require('path');

const generateCSV = (data, fields) => {
    if (!data || !data.length) return '';
    const header = fields.join(',') + '\n';
    const rows = data.map(row => {
        return fields.map(field => {
            let val = row[field] || '';
            // Handle nested objects if needed, simplified here
            if (typeof val === 'object') val = JSON.stringify(val);
            // Escape quotes and wrap in quotes
            val = String(val).replace(/"/g, '""');
            return `"${val}"`;
        }).join(',');
    }).join('\n');
    return header + rows;
};

const parseCSV = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        const fs = require('fs');

        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(err);

            const lines = data.split(/\r?\n/);
            if (!lines.length) return resolve([]);

            const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());

            for (let i = 1; i < lines.length; i++) {
                if (!lines[i].trim()) continue;

                // Simple regex to split by comma ignoring quotes
                const row = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
                if (!row) continue;

                const obj = {};
                headers.forEach((h, index) => {
                    let val = row[index] ? row[index].trim() : '';
                    val = val.replace(/^"|"$/g, '').replace(/""/g, '"');
                    obj[h] = val;
                });
                results.push(obj);
            }
            resolve(results);
        });
    });
};

module.exports = { generateCSV, parseCSV };

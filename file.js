const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

async function sendFile() {
    const { default: fetch } = await import('node-fetch');

    const filePath = path.join(__dirname, 'feed\\feed_1.txt');
    console.log(`Sending file from path: ${filePath}`);

    const form = new FormData();
    form.append('feedFile', fs.createReadStream(filePath));

    try {
        const response = await fetch('https://demo70.sifyitest.com/livedata/upload.php', {
            method: 'POST',
            body: form,
            headers: form.getHeaders()
        });

        if (!response.ok) {
            const responseBody = await response.text();
            throw new Error(`Failed to send file. Status: ${response.status}, Response: ${responseBody}`);
        }

        console.log('File sent successfully');
    } catch (error) {
        console.error('Error sending file:', error);
    }
}

sendFile();

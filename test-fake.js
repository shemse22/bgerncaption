fetch('https://bgern.com/assets/nonexistent-file-12345.js').then(r => console.log('Fake JS:', r.status, 'Type:', r.headers.get('content-type'))).catch(console.error);

fetch('https://bgern.com/style.css').then(r => console.log('Status:', r.status, 'Content-Type:', r.headers.get('content-type'), 'Length:', r.headers.get('content-length'))).catch(console.error);

fetch('https://bgern.com/assets/index-CizDMsDs.js').then(r => console.log('Old JS Status:', r.status, 'Type:', r.headers.get('content-type'))).catch(console.error);

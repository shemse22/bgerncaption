fetch('https://bgern.com/style.css').then(r => console.log(Object.fromEntries(r.headers.entries()))).catch(console.error);

fetch('https://bgern.com/assets/index-bncq7p8y.css').then(r => r.text()).then(t => console.log('Is HTML?', t.startsWith('<!doctype'))).catch(console.error);

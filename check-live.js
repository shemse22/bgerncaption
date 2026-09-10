fetch('https://bgern.com/').then(r => r.text()).then(t => console.log('Live assets:', t.match(/assets\/[^"'\s>]+/g))).catch(console.error);

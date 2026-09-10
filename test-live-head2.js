fetch('https://bgern.com/').then(r => r.text()).then(t => console.log(t.substring(1800, 3500))).catch(console.error);

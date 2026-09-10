fetch('https://bgern.com/').then(r => r.text()).then(t => console.log(t.substring(0, 2000))).catch(console.error);

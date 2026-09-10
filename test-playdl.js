import play from 'play-dl'; play.stream('https://www.youtube.com/watch?v=aqz-KE-bpKQ').then(s => console.log('Success:', s.type)).catch(console.error);

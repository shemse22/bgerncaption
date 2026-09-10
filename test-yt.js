import ytdl from '@distube/ytdl-core'; ytdl.getInfo('https://www.youtube.com/watch?v=aqz-KE-bpKQ').then(i => console.log(i.videoDetails.title)).catch(console.error);

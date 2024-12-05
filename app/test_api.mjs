import { maiApi } from './app.mjs'

// maiApi.useApi({'method': 'GET', 'path': '/api/v0/maimai/icon/list'}, (res, message) => {
//     console.log(res)
//     console.log(message)
    
// })

// maiApi.get('alias', (r) => {
//     console.log(r)
    
// })

maiApi.searchSongByAlias('找对象', (r) => {
    console.log(r)
})
// let num = 0
// console.time('get_song_sum')
// while (num < 100) {
//     console.time('get_song')
//     maiApi.getSongByAlias('找对象', (r) => {
//         // console.log(r)
//     })
//     console.timeEnd('get_song')
    
//     num++
// }
// console.timeEnd('get_song_sum')
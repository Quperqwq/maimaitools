import { maiApi } from './app.mjs'

// maiApi.useApi({'method': 'GET', 'path': '/api/v0/maimai/icon/list'}, (res, message) => {
//     console.log(res)
//     console.log(message)
    
// })

// maiApi.get('alias', (r) => {
//     console.log(r)
    
// })

maiApi.getSongByAlias('钢琴广告', (r) => {
    console.log(r)
    
})
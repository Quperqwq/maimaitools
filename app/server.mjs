import {HttpApp, tool, log} from './website-common.mjs'
import config from './config.mjs'
import {hall} from './app.mjs';

const httpd = new HttpApp({
    html_path: './src/html',
    static_path: './src/static',
    use_cache_file: false,
    'port': config.server_port,
    'host': config.server_host
})


httpd.page('/', 'home.html')

httpd.page('/dev', 'dev.html')

httpd.page('/about', 'about.html')


// API...

httpd.api('test', (req, res, end) => {
    end()
})

httpd.api('get_hall_player', (req, res, end) => {
    res.data = hall.all_hall.halls
    end()
})
httpd.api('change_hall_data', (req, res, end) => {
    const {id, type, method, value} = req
    // console.log(req)
    end(hall.change(id, method, type, value))
})



httpd.run()
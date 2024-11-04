import {HttpApp, tool, log} from './website-common.mjs'
import {config} from './config.mjs'

const httpd = new HttpApp({
    html_path: './src/html',
    static_path: './src/static',
    use_cache_file: false,
    'port': config.server_port,
    'host': config.server_host
})


httpd.page('/', 'info.html')

httpd.page('/dev', 'dev.html')

httpd.api('test', (req, res, end) => {
    end()
})

httpd.run()
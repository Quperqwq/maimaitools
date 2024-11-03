import {HttpApp, tool, log} from './website-common.mjs'

const httpd = new HttpApp({
    html_path: './src/html',
    static_path: './src/static'
})


httpd.page('/', 'info.html')

httpd.page('/dev', 'dev.html')

httpd.api('test', (req, res, end) => {
    end('ok')
})

httpd.run()
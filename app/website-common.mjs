import express from 'express'
import Fs from 'fs'
import Path from 'path'


/**@typedef {import('./types').apiReqBody} apiReqBody  */

/**@typedef {import('./types').apiReqBody} apiResBody */


/**
 * 构建一个工具对象, 用于复用常见功能
 */
class Tools {
    constructor() {}

    /**
     * 获取目标路径状态的对象(fs.Stats)
     * @param {string} path 
     */
    fileStat(path) {
        try {
            return Fs.statSync(path)
        } catch (error) {
            return
        }
    }

    /**
     * 读取一个纯文本文件为String
     * @param {string} path 目标文件路径
     * @param {boolean} [_check_file=true] 在读取前检查文件有效性
     */
    readFileToStr(path, _check_file = true) {
        // 过滤非文件路径
        if (_check_file) {
            if (!this.isFile(path)) {
                return new Error('not_file')
            }
        }
        return Fs.readFileSync(path, 'utf-8')
    }

    /**
     * 获取目录下的所有文件
     * @param {string} path 目标路径
     * @param {'path' | 'file_name' | 'file_name_no_ext'} [style='path'] 获取样式
     */
    readDir(path, style = 'path') {
        /**
         * 自动设置样式
         * @param {string} path 
         * @param {string} filename 
         */
        const setStyle = (path, filename) => {
            switch (style) {
                case 'path':
                    return Path.join(path, filename)
                case 'file_name':
                    return Path.join(filename)
                case 'file_name_no_ext':
                    return Path.basename(filename, Path.extname(filename))
                default:
                    return Path.join(path, filename)
            }
        }
        if (!this.isDir(path)) {
            return new Error('invalid_path')
        }
        /**@type {string[]} */
        let file_list = []
        // ~(!)这种写法可能会出现错误
        Fs.readdirSync(path).forEach((filename) => {
            file_list.push(setStyle(path, filename))
        })
        return file_list
    }

    /**
     * 写入String到目标文本文件
     * @param {string} path 目标文件路径
     * @param {string} content 写入内容
     * @param {boolean} add_mode 启用时, 将追加文本内容而非覆写
     */
    writeFile(path, content, add_mode) {
        if (!this.fileStat(Path.dirname(path)).isDirectory()) {
            return new Error('invalid_path')
        }
        if (add_mode) {
            Fs.appendFileSync(path, content)
        } else {
            Fs.writeFileSync(path, content)
        }

        return 'ok'
    }

    /**
     * 检查目标路径是否是文件
     * @param {string} path 目标路径
     */
    isFile(path) {
        try {
            return Fs.statSync(path).isFile()
        } catch (error) {
            return false
        }
    }

    /**
     * 检查目标路径是否是目录
     * @param {string} path 目标路径
     */
    isDir(path) {
        try {
            return Fs.statSync(path).isDirectory()
        } catch (error) {
            return false
        }
    }


    
    /**
     * 获取可读的日期字符串
     * @param {string} style 获取的格式
     */
    getDate(style) {
        return new Date().toLocaleString()
    }
}

/**
 * 构建一个输出日志类, 用于将日志信息输出到控制台或日志文件
 */
class OutputLog {
    /**
     * 日志等级对象
     * @type {{[x: number | string]: {name: string, color: string, out: function(string): void}}}
     */
    level = {
        3: {
            name: 'ERROR',
            color: '',
            out: (c) => { console.error(c) }
        },
        2: {
            name: 'WARN',
            color: '',
            out: (c) => { console.warn(c) }
        },
        1: {
            name: 'INFO',
            color: '',
            out: (c) => { console.info(c) }
        },
        0: {
            name: 'DEBUG',
            color: '',
            out: (c) => { console.debug(c) }
        },
        'req': {
            name: 'Request',
            color: '',
            out: (c) => { console.log(c) }
        }
    }

    /**
     * 
     * @param {Object} param0
     * @param {boolean} param0.use_color_code 当启用, 将日志内容打印在控制台时会进行颜色渲染
     * @param {boolean} param0.use_date_output 当启用, 将在打印日志的同时显示打印时间
     * @param {boolean} param0.write_log_file 当启用, 会将日志内容写入进日志文件
     * @param {number} param0.write_level 设置写入日志文件最低等级
     * @param {number} param0.show_level 设置输出的日志最低等级
     * @param {string} param0.log_path 设置输出日志的路径
     */
    constructor({use_color_code = true, use_date_output = true, write_log_file = true, show_level = 0, write_level = 2, log_path = './log'}) {
        if (!tool.isDir(log_path)) {
            // 这里无需catch
            Fs.mkdirSync(log_path)
        }
        this.use_color = use_color_code
        this.use_date = use_date_output
        this.use_write = write_log_file
        this.log_path = log_path

        this.level_log = show_level
        this.level_write = write_level
    }


    /**
     * 输出日志
     * @param {string} content 输出日志内容
     * @param {number} level 输出日志等级(特殊地, `level: -1`表示输出地是访问日志)
     * 
     * @returns {string} 待打印的内容
     */
    output(content, level) {
        // ~(ADD)待完全实现
        const level_obj = level === -1 ? this.level['req'] : this.level[level]
        let header = ''
        header += `[${level_obj.name ? level_obj.name : 'unknown'}] `
        if (this.use_date) {
            header += `${tool.getDate()} |`
        }
        const text = `${header} ${content}`
        if (level_obj) {
            level_obj.out(text)
        }


        if (this.use_write && level >= this.level_write) {
            // ~(ADD)目标格式 log_path[ <date>.log, ... ]
            // ~(TAG)日志文件写入
            // ~(TEMP)
            tool.writeFile(Path.join(this.log_path, 'running.log'), text + '\n', true)
        }

    }

    error(cont = '') {
        this.output(cont, 3)
        return new Error(cont)
    }
    warn(cont = '') { this.output(cont, 2) }
    info(cont = '') { this.output(cont, 1) }
    debug(cont = '') { this.output(cont, 0) }
    /**
     * 在控制台打印一个请求信息
     * @param {Request} req 
     */
    req(req) {
        let cont = `${req.method} ${req.path}`
        this.output(cont, -1)
    }

    /**
     * 在控制台打印更多信息
     */
    det(cont = '') {
        console.log('    ↪', cont)
    }
}

/**
 * 构建一个HTTP服务
 */
export class HttpApp {
    /**@typedef { function(apiReqBody, apiResBody, function(string): void): void } apiProcCallback api处理函数*/
    /**
     * 
     * @param {Object} param0 
     * @param {string} param0.host 监听(运行)在host
     * @param {string} param0.port 监听(运行)在端口
     * @param {string} param0.static_path 静态文件存放路径
     * @param {string} param0.static_rout 静态文件在站内的路由
     * @param {string} param0.template_path 模板文件存放路径
     * @param {string} param0.html_path 网页文件存放路径
     * @param {boolean} param0.print_req 打印访问日志
     * @param {boolean} param0.use_cache_file 使用缓存文件以提高性能
     * @param {string} param0.common_html_head 在HTML头部(使用`<REPLACE>`标记的待替换内容)公用的标签
     */
    constructor({
        host = '0.0.0.0',
        port = 27000,
        static_path = './src/static',
        static_rout = '/',
        html_path = './src/html',
        template_path = './src/html/template',
        print_req = true,
        use_cache_file = true,
        common_html_head = '<script src="/script/common.js"></script><link rel="stylesheet" href="/style/picnic.css"><link rel="stylesheet" href="/style/common.css">'
    }) {
        const app = express()

        // 确保路径有效性
        if (!(tool.isDir(static_path) || tool.isDir(html_path) || tool.isDir(template_path))) {
            throw log.error('invalid_path: constructor HttpAPP failed.')
        }


        /**Express实例对象 */
        this.expressApp = app

        /**HTTP服务目标监听端口 */
        this.port = port
        /**HTTP服务目标监听Host */
        this.host = host

        /**HTML目录在文件系统位置 */
        this.path_html = html_path
        /**模板目录在文件系统位置 */
        this.path_template = template_path
        /**静态目录在文件系统位置 */
        this.path_static = static_path
        /**在HTML头部(使用`<REPLACE>`标记的待替换内容)公用的标签 */
        this.html_head = common_html_head

        /**API方法 @type {{[x: string]: apiProcCallback}} */
        this.api_method = {}

        // 打印请求内容
        if (print_req) {
            app.use((req, _, next) => {
                log.req(req)
                next()
            })
        }



        /* 设置静态文件路由 */ app.use(static_rout, express.static(static_path))// 中间件部分

        /* 配置json解析中间件 */ app.use(express.json())



        // 读取并缓存HTML文件以实现更好的效率
        /**使用缓存的HTML内容, 否则将随用随取 */
        this.use_cache_html = use_cache_file
        /**
         * HTML文件会缓存为这个对象
         * @typedef {{[x: string]: string | void}} cacheObj
         * @type {cacheObj}
         */
        this.cont_html = {}
        /**
         * 模板文件会缓存为这个对象
         * @type {cacheObj}
         */
        this.cont_template = {}

        if (use_cache_file) { // 但有时也无需缓存
            /**
             * 缓存到对象
             * @param {string} path 
             * @param {object} target 
             */
            const cache = (path, target) => {
                const file_list = tool.readDir(path)
                if (file_list instanceof Error) {
                    throw log.error(`invalid_path: ${html_path}`)
                }
                file_list.forEach((path_name) => {
                    // 匹配文件扩展名是否是HTML文件
                    // log.debug(path_name)
                    if (['.html', '.htm'].includes(Path.extname(path_name))) {
                        const filename = Path.basename(path_name)
                        target[filename] = tool.readFileToStr(path_name)
                    }
                })
            }
            cache(html_path, this.cont_html)
            cache(template_path, this.cont_template)
            // console.log(this.html_cont)

        }
        

        // 初始化...

        // 初始化API路由
        app.post('/api', (req, res) => {
            /**
             * 结束这个响应并发送数据, 当传入错误信息时响应为无效响应
             * @param {string} message 错误信息
             */
            const endReq = (message = '') => {
                res_body.valid = message ? false : true
                res_body.message = message
                res.send(res_body).end()
            }

            /**请求体 @type {apiReqBody} */
            const req_body = req.body
            if (!req_body) {
                endReq('bad_request')
            }
            /**响应体 @type {apiResBody} */
            let res_body = {} // 初始化响应体
            const use_target = req_body['target']

            const execute = /* 在这里执行 */ this.api_method[use_target]
            if (!execute) {
                // 处理函数不存在
                return endReq('target_not_found')
            }

            // 正常的执行处理函数
            execute(req_body, res_body, endReq)
        })



        // 打印当前服务器状态
        log.info(`Cache Mode: ${use_cache_file ? 'Yes' : 'No'}`)
    }



    //
    // 创建路由
    //

    /**
     * 新建一个路由处理器
     * @param {string} path 
     * @param {function(Request, Response)} callback 
     */
    get(path, callback) {
        this.expressApp.get(path, (req, res) => {
            callback(req, res)
        })
    }

    /**
     * 新建一个路由以返回前端页面
     * @param {string} path 
     * @param {string} html_name 
     */ 
    page(path, html_name) {
        const {expressApp} = this
        expressApp.get(path, (_, res) => {
            let content = ''
                
            content = this.readHtml(html_name)
            if (!content) {
                return res.status(500).send('Server Error!').end()
            }
            
            res.send(content).end()
        })
    }

    /**
     * 新建一个API处理项
     * 
     * 在APP上使用 `POST <host>/api <DATA>(Object)`来调用
     * @param {string} target 表示当使用POST请求时请求体target值为何时触发指定函数
     * @param {apiProcCallback} callback 处理体
     */
    api(target, callback) {
        /* 在这里添加 */this.api_method[target] = (...arg) => {
            log.det(`target: ${target}`)
            callback(...arg)
        }
    }

    //
    // H5FILE
    //


    /**
     * 读取一个HTML文件的内容(在`this.path_html`中), 并按照规则替换`<REPLACE>`的内容
     * @param {string} filename HTML文件名
     * @param {boolean} [is_template=false] 是模板文件目录下的html文件
     */
    readHtml(filename, is_template = false) {
        const {path_html, path_template} = this


        /**预渲染HTML文件 @param {string} cont */
        const render = (cont) => {
            // ~(?)这里以后可以做性能优化
            const list = tool.readDir(path_template, 'file_name_no_ext')
            if (list instanceof Error) return ''
            cont = cont.replace(/<!(\S+?)>/g, (_, template_name) => {
                if (!list.includes(template_name)) return ''
                const target = template_name + '.html'
                const cont = this.readHtml(target, true)
                // log.debug(cont)
                return cont ? cont : ''
            })
            return cont.replace('<REPLACE>', this.html_head)
        }


        let content = '' // 初始化内容

        if (this.use_cache_html) {
            // 有缓存的情况
            const target = is_template ? this.cont_template : this.cont_html
            content = target[filename]
            if (!content) return ''
        } else {
            // 无缓存的情况
            const file_name = Path.join(is_template ? path_template : path_html, filename) 
            // log.debug(file_name)
            content = tool.readFileToStr(file_name)
            if (typeof(content) !== 'string') return ''
        }

        if (!is_template) {// 预渲染非模板文件的HTML文件
            return render(content)
        }


        return content
    }


    /**运行这个HTTP服务 */
    run() {
        const {host, port, expressApp} = this
        // 未匹配到路由 
        expressApp.use((req, res) => {
            // ~(TAG)404 page
            res.status(404)
            res.send(this.readHtml('404.html'))
        })



        const server = expressApp.listen(this.port, this.host, () => {
            log.info(`Server is running on http://${host + ':' + port}`)
        })
        this.server = server

    }
}

export const tool = new Tools()
export const log = new OutputLog({
    // 设置日志输出功能
    show_level: 0
})




// test command
// ...

// log.warn(Path.join(process.cwd(), '../src/html'))


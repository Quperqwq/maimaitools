import { error } from 'console'
import express from 'express'
import Fs from 'fs'
import Path from 'path'


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
     */
    readFileToStr(path) {
        // 过滤非文件路径
        if (!this.isFile(path)) {
            return new Error('not_file')
        }
        return Fs.readFileSync(path, 'utf-8')
    }

    /**
     * 获取目录下的所有文件
     * @param {string} path 目标路径
     */
    readDir(path) {
        if (this.isDir(path)) {
            return new Error('invalid_path')
        }
        /**@type {string[]} */
        let file_list = []
        // ~(!)这种写法可能会出现错误
        Fs.readdirSync(path).forEach((filename) => {
            file_list.push(Path.join(path, filename))
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
     * @type {{[x: number]: {name: string, color: string, out: function(string): void}}}
     */
    level = {
        3: {
            name: 'ERROR',
            color: '',
            out: (content) => { console.error(content) }
        },
        2: {
            name: 'WARN',
            color: '',
            out: (content) => { console.warn(content) }
        },
        1: {
            name: 'INFO',
            color: '',
            out: (content) => { console.info(content) }
        },
        0: {
            name: 'DEBUG',
            color: '',
            out: (content) => { console.debug(content) }
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
     * @param {number} level 输出日志等级
     * 
     * @returns {string} 待打印的内容
     */
    output(content, level) {
        // ~(ADD)待完全实现
        const level_obj = this.level[level]
        let header = ''
        header += `[${level_obj.name ? level_obj.name : 'unknown'}] `
        if (this.use_date) {
            header += tool.getDate()
        }
        const text = `${header} ${content}`
        if (level_obj) {
            level_obj.out(text)
        }


        if (this.use_write && level >= this.level_write) {
            // ~(ADD)目标格式 log_path[ <date>.log, ... ]
            // ~(TEMP)
            tool.writeFile(Path.join(this.log_path, 'running.log'), text, true)
        }

    }

    error(cont = '') {
        this.output(cont, 3)
        return new Error(cont)
    }
    warn(cont = '') { this.output(cont, 2) }
    info(cont = '') { this.output(cont, 1) }
    debug(cont = '') { this.output(cont, 0) }
}

/**
 * 构建一个HTTP服务
 */
export class HttpApp {
    constructor({
        host = '0.0.0.0',
        port = 27000,
        static_path = './src/static',
        html_path = './src/html'
    }) {
        const app = express()

        // 确保路径有效性
        if (!(tool.isDir(static_path) || tool.isDir(html_path))) {
            throw log.error('invalid_path')
        }


        /**Express实例对象 */
        this.expressApp = app

        /**HTTP服务目标监听端口 */
        this.port = port
        /**HTTP服务目标监听Host */
        this.host = host

        // 读取并缓存HTML文件以实现更好的效率
        const dir_html_file = tool.readDir(html_path)
        if (dir_html_file instanceof Error) {
            throw log.error('invalid_path')
        }
        dir_html_file.forEach((file_name) => {
            // 匹配文件扩展名是否是超文本文件
            if (['.html', '.htm'].includes(Path.extname(file_name))) {
                // ~(LAST)
                
            }
        })
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
        
    }



    /**运行这个HTTP服务 */
    run() {

        const {host, port, expressApp} = this
        // 未匹配到路由 
        expressApp.use((req, res) => {
            // ~(TAG)404 page

            res.status(404)
            res.send()
        })



        const server = expressApp.listen(this.port, this.host, () => {
            console.log(`Server is running on http://${host + ':' + port}`)
        })
        this.server = server

    }

    //
    // 页面
    //

    outputHtml() {
        tool.readFileToStr()
    }

    renderHtml() {
        
    }
}

const tool = new Tools()
export const log = new OutputLog({
    // 设置日志输出功能
})




// test command
// ...



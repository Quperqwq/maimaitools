import Path from 'path'
import Fs from 'fs'
import {tool, log} from './website-common.mjs'
import config from './config.mjs'


class Data {
    // 便于以后更改存储介质
    /**
     * 构建一个数据的类
     * @param {string} save_path 数据的存储路径
     */
    constructor (save_path = './data') {
        if (!tool.isDir(save_path)) throw log.error(`invalid_path: ${save_path}`) // 确保路径有效
        this.save_path = save_path
        /**数据缓存 */
        this._cache = {}
    }

    /**
     * 获取一条数据
     * @param {string} data_name 数据名
     */
    get(data_name) {
        let cache = this._cache[data_name]
        const cont = tool.readFileToStr(this._getDataPath(data_name))
        if (cont instanceof Error) return {}
        // ~(!)这里在解析时, 若文件为空可能会触发错误
        if (!cache) cache = JSON.parse(cont)
        
        return cache
    }

    /**
     * 更新或创建一条数据
     * @param {string} data_name 数据名
     * @param {object} data_cont 数据内容
     */
    update(data_name, data_cont = {}) {
        const target = this._getDataPath(data_name)
        // console.log(target)
        /**
         * 写入到目标文件
         * @param {object} cont 写入对象
         */
        const write = (cont) => {  return Fs.writeFileSync(target, JSON.stringify(cont)) }

        write(data_cont)
        this._cache[data_name] = data_cont
        return
    }

    /**
     * 删除一条数据
     * @param {string} data_name 数据名
     * @param {function(NodeJS.ErrnoException)} callback 回调函数
     */
    del(data_name, callback) {
        Fs.unlink(this._getDataPath(data_name), (err) => {
            this._cache[data_name] = undefined
            callback(err)
        })
    }

    /**
     * 获取一个数据名的文件位置
     * @param {string} data_name 数据名
     */
    _getDataPath(data_name) {
        return Path.join(this.save_path, data_name + '.json')
    }
}


export default new Data(config.data_path)
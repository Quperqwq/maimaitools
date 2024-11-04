import nedb from 'nedb'
import Path from 'path'
import { config } from './config.mjs'


export default class data {
    constructor(db_name = 'main.db') {
        this.db = new nedb({
            filename: Path.join(config.db_path, db_name),
            autoload: true
        })
    }

    add(item_name, callback) {
        this.db.insert({'target': item_name}, (err) => {
            callback(err)
        })
    }

    /**
     * 获取一个字段的所有内容
     * @param {string} item_name 要获取的条目名称
     * @param {function(object, Error | null): void} callback 当操作完成时触发该函数
     */
    get(item_name, callback) {
        this.db.find({'target': item_name}, (err, data) => {
            callback(data, err)
        })
    }

    /**
     * 删除一个字段
     * @param {string} item_name 条目名称
     * @param {function(Error | null): void} callback 
     */
    del(item_name, callback) {
        this.db.remove({'target': item_name}, {}, (err) => {
            callback(err)
        })
    }

    /**
     * 更新一个字段的内容
     * @param {string} item_name 
     * @param {object} new_data 
     * @param {function(Error | null)} callback 
     */
    update(item_name, new_data, callback) {
        this.db.update({'target': item_name}, new_data, {'multi': false}, (err) => {
            callback(err)
        })
    }

}



// test code...
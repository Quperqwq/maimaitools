import data from './data.mjs'
import config from './config.mjs'
import { log } from './website-common.mjs'
import http from 'https'

/**@typedef {import('./types').GameHallMain} GameHallMain */
/**@typedef {import('./types').GameHallItem} GameHallItem */


/**游戏厅 */
class GameHall {
    // 使用初始化值, 便于以后增加字段
    /** 游戏厅数据结构初始内容 @type {GameHallItem} */
    _hall_init = {
        'comments': {'last_id': 0},
        'games': [],
        'going': 0,
        'id': 0,
        'map_id': null,
        'max_player': 10,
        'name': '',
        'nickname': [],
        'open_hours': {
            'close': null,
            'open': null
        },
        'player': 0,
        'pos': '',
        'time': {
            'change': -1,
            'change_player': -1,
            'new': -1
        }
    }

    constructor() {
        const org_data = this._data
        if (Object.keys(this._data) <= 0) {
            // init | 在这里初始化数据值
            org_data.last_number = 10000
            org_data.halls = {}
            this._updateData(org_data)
        }
    }

    /**
     * 获取所有机厅字段的内容
     * @returns {Object<number, GameHallItem>}
     */
    get all_hall() {
        const hall_data = this._data
        const {halls} = hall_data
        const result = {}
        // 格式化机厅内容, 以确保数据可用性
        Object.keys(halls).forEach((id) => {
            result[id] = {
                ...this._hall_init,
                ...halls[+id],
                id
            }

        })
        return result
    }

    /**@returns {GameHallMain} */
    get _data() {
        // // 在返回之前需要格式化
        // /** @type {GameHallMain} */
        // const hall_data = data.get('all_hall')
        // const {halls} = hall_data
        // Object.keys(halls).forEach((id) => {
        //     const item = halls[+id]
        //     halls[+id] = {
        //         ...this._hall_init,
        //         ...item
        //     }
        // })

        // 241122之前的写法
        return data.get('all_hall')
    }

    get _time() {
        return new Date().getTime()
    }

    /**@param {GameHallMain} new_data  */
    _updateData(new_data) {
        return data.update('all_hall', new_data)
    }

    /**
     * 更新机厅数据
     * @param {number} id 
     * @param {GameHallItem} new_data 
     */
    _updateHall(id, new_data) {
        const org_data = this._data
        org_data.halls[id] = new_data
        this._updateData(org_data)
    }

    /**
     * 获取机厅数据
     * @param {number} id 
     * @returns {GameHallItem | undefined}
     */
    _getHall(id) {
        const target = this._data.halls[id]
        if (!target) return
        return {
            ...this._hall_init,
            id,
            ...target
        }
    }

    /**
     * 新建一个机厅
     * @param {string} name 机厅名
     * @param {GameHallItem} base_data 机厅基本数据可容纳最多人数
     */
    new(name, base_data) {
        /**
         * 返回一个有效的值
         * @param {any} value 
         * @param {'array' | 'string' | 'number'} type
         * @param {any} normal 
         */
        const valid = (value, type, normal) => {
            switch (type) {
                case 'array':
                    return Array.isArray(value) ? value : normal
                case 'string':
                    return typeof(value.toString) === 'function' ? value.toString() : value
                case 'number':
                    const new_value = +value
                    return Number.isNaN(new_value) ? normal : new_value
                default:
                    return
            }
        }
        const {pos, games, max_player, nickname} = base_data
        // init ~(TAG)在这里创建新的机厅数据
        /**@type {GameHallItem} */
        const hall_data = {
            ...this._hall_init,
            'games': valid(games, 'array', []),
            'max_player': valid(max_player, 'number', 10),
            'name': valid(name, 'string', '无效机厅名'),
            'nickname': valid(nickname, 'array', []),
            'pos': valid(pos, 'string', '无效位置'),
            'time': {
                'new': this._time,
                'change': this._time,
                'change_player': this._time
            }
        }
        const org_data = this._data
        org_data.last_number += 1
        org_data.halls[org_data.last_number] = hall_data
        this._updateData(org_data)

    }

    /**
     * 更新机厅的信息
     * @param {number} id 机厅ID
     * @param {'append' | 'del' | 'change'} method 更改方式
     * @typedef {'player' | 'games' | 'pos' | 'comments' | 'max_player' | 'name' | 'nickname' | 'going'} ChangeType
     * @param {ChangeType} type 更改类型, 其值为GameHallItem键的值
     * @param {string | number | Array |object} value 更新值
     * @returns {string}
     */
    change(id, method, type, value) {
        const target = this._getHall(id)
        const time = this._time
        if (!target) return 'game_hall_not_found'

        /**删除数组里的一个元素  @param {Array} arr */
        const delArrayItem = (arr) => { arr.filter(item => item !== value) }
        /**添加数组里的一个元素(非重复) @param {Array} arr */
        const appendArrayItem = (arr) => {
            if (arr.includes(value)) return
            arr.push(value)
        }

        /**
         * 确保一个值有效
         * @param {any} value 需要确认的值
         * @param {string} value_type 该值应该的类型
         * @param {any} normal 若不是此类型指定为默认值
         */
        const valid = (value, value_type, normal) => {
            const type = value_type.toLowerCase()
            if (typeof(value) === type) return value
            if (type === 'array') return Array.isArray(value) ? value : normal

            return normal
        }

        /**
         * 确保一个玩家数量的值有效
         * @param {number} target_number 当前玩家数量
         */
        const validPlayer = (target_number) => {
            target.time.change_player = this._time

            if (Number.isNaN(target_number)) return 0
            
            if (target_number > target.max_player) return target.max_player
            if (target_number < 0) return 0
            return target_number
        }

        /**
         * 检查一个数字是否有效
         * @param {number | string} num 
         * @returns {number | null}
         */
        const validNumber = (num) => {
            const _num = +num
            return isNaN(_num) ? null : _num
        }

        /**
         * 修改字段值的方法 @type {{[x: string]: {append: function, del: function, change: function}}}
         */
        const execute = {
            player: {
                append: () => {
                    target.player = validPlayer(+target.player + value)
                    return
                },
                change: () => {
                    target.player = validPlayer(+value)
                    return
                },
                del: () => {
                    target.player = validPlayer(+target.player - value)
                    return
                }
            },
            games: {
                append: () => { appendArrayItem(target.games) },
                del: () => { delArrayItem(target.games) },
                change: () => { target.games = Array.isArray(value) ? value : [value] }
            },
            pos: {
                del: () => { target.pos = '' },
                change: () => { target.pos = value }
            },
            comments: {
                append: () => { 
                    const comments = target.comments
                    comments.last_id += 1
                    comments[comments.last_id] = {
                        'content': value,
                        'likes': 0,
                        'time': this._time,
                        // ~(TAG)玩家ID在这里使用
                        'uid': -1
                    }
                },
                del: () => {
                    const comments = target.comments
                    const comment = comments[value]
                    if (!comment) return
                    comment = undefined
                }
            },
            max_player: {
                change: () => {
                    const _value = validNumber(value)
                    if (_value === null) return 'invalid_value'

                    target.max_player = _value
                }
            },
            name: {
                change: () => { target.name = value }
            },
            nickname: {
                append: () => { appendArrayItem(target.nickname) },
                del: () => { delArrayItem(target.nickname) },
                change: () => { target.nickname = value }
            },
            going: {
                append: () => {
                    const target_value = +target.going
                    if (target_value === undefined) {
                        target.going = 1
                        return
                    }
                    target.going = validPlayer(target_value + 1)
                    return
                },
                del: () => {
                    target.going = validPlayer(+target.going - 1)
                    return
                },
                change: () => {
                    target.going = validPlayer(+target.going - 1)
                    target.player = validPlayer(+target.player + 1)
                    return
                }
            },
            // 更改营业时间
            open_hours: {
                'change': () => {
                    const {open_hours} = target
                    if (!open_hours) open_hours = {}
                    const { open = 0, close = 1440 } = value
                    
                    if ((open < 0 || close > 1440) // 非合法范围
                        || // 非合法数字
                    (isNaN(+open) || isNaN(+close))) return 'invalid_value'

                    open_hours.open = +open
                    open_hours.close = +close
                }
            },
            // map id
            map_id: {
                'change': () => {
                    const _value = validNumber(value)
                    if (_value === null) return 'invalid_value'
                    // ~(ADD)验证有效性
                    target.map_id = _value
                }
            }
        }

        const exe_type = execute[type]
        if (!exe_type) return 'type_not_found'
        const exe = exe_type[method]
        if (!exe) return 'invalid_method'
        log.debug('(change hall data)', method, type, ',value of:', value)
        const output = exe()
        if (output) return output

        target.time.change = time
        this._updateHall(id, target)
        return ''
    }

    // 由于安全原因这个方法被弃用 (20241121)
    // /**
    //  * 更新机厅数据
    //  * @param {number} id 机厅ID
    //  * @param {GameHallItem} new_data 更新数据
    //  */
    // update(id, new_data) {
    //     if (!new_data) return 'param_not_fond'
    //     const target = this._getHall(id)
    //     if (!target) return 'game_hall_not_found'
    //     const change = (key_name, value) => {
    //         target[key_name] = value ? value : target[key_name]
    //     }
    //     const {games, name, max_player, nickname, pos, open_hours, map_id} = new_data
        
    //     // #(FIX) 人性化?优化?
    //     change('games', games)
    //     change('max_player', max_player)
    //     change('name', name)
    //     change('nickname', nickname)
    //     change('pos', pos)
    //     change('open_hours', open_hours)
    //     change('map_id', map_id)
    //     target.time.change = this._time
    //     // console.log(target);
        

    //     this._updateHall(id, target)
    // }

    /**
     * 添加一个正在前往机厅的玩家
     * @param {number} id 
     */
    addGoing(id) { }

    /**
     * 移去一个正在前往机厅的玩家, 并添加一个
     * @param {number} id 
     */
    removeGoing(id) {}
}

/**
 * maimaiDX API
 */
class ApiMai {
    /**@typedef {'song' | 'alias' | 'avatar'} MaiDataName 从api获取数据的名称 */
    constructor () {
        // (!)若传入非法URL配置将会触发报错
        /**API的域名 */
        this.api_host = config.mai_api.hostname
        /**API的端口 */
        this.api_port = config.mai_api.port
        /**使用API对应的路径 @type {{[key in MaiDataName]: string}} */
        const api_path = {
            /** [曲目列表](https://maimai.lxns.net/docs/api/maimai#get-apiv0maimaisonglist) */
            'song': '/api/v0/maimai/song/list',
            /** [别名列表](https://maimai.lxns.net/docs/api/maimai#get-apiv0maimaialiaslist) */
            'alias': '/api/v0/maimai/alias/list',
            /** [头像列表](https://maimai.lxns.net/docs/api/maimai#get-apiv0maimaiiconlist) */
            'avatar': '/api/v0/maimai/icon/list'
        }

        /** @type {{[key in MaiDataName]: object}} */
        // this.data = Object.keys(api_path).forEach((data_name) => {
        //     // ~(last)
        //     this.get(data_name)
        // })
        this.data = {}

        this.api_path = api_path
    }

    /**
     * 获取数据名
     * @param {MaiDataName} target_name 
     */
    _getDataName(target_name) {
        return `mai_data_${target_name}`
    }

    /**
     * 打印一条日志
     * @param  {...string} cont 
     */
    _log(...cont) {
        log.debug('<ApiMai>', ...cont)
    }

    /**
     * 会获取到一个数据名对应的内容, 默认获取优先级为 `对象缓存 > 文件/数据库缓存 > API调取`
     * @param {MaiDataName} target_name 
     */
    get(target_name, next) {
        const obj_data = this.data
        const data_name = this._getDataName(target_name)


        // 来自对象的缓存
        const obj_cache = obj_data[target_name]
        
        if (obj_cache) {
            this._log('data cache in obj')
            return next(obj_cache)
        }

        // 来自文件的缓存
        const file_cache = data.get(data_name)
        if (Object.keys(file_cache).length > 0) {
            obj_data[target_name] = file_cache
            this._log('data cache in file')
            return next(file_cache)
        }

        // 没有缓存数据, 来自API获取
        this._log('get data in api')
        this.update(target_name, next)
    }

    /**
     * 
     * @param {MaiDataName} target_name 
     * @param {function(Object)} next 
     */
    update(target_name, next) {
        const obj_data = this.data
        const data_name = this._getDataName(target_name)
        const api_path = this.api_path[target_name]
        
        this.useApi({'method': 'GET', 'path': api_path}, (new_data, err) => {
            if (err) throw log.error(err)
            // 如果获取成功则更新缓存
            obj_data[target_name] = new_data
            data.update(data_name, new_data)
            next(new_data)
        })
    }

    /**
     * 
     * @typedef
     * @param {object} param0
     * @param {'GET' | 'POST'} param0.method 请求方法
     * @param {string} param0.path 请求路径
     * @param {object} param0.param 请求参数
     * @param {object} param0.body 请求体
     * @param {function(object, string)} callback 
     */
    useApi({method = 'GET', path, body = null, param = {}} = {}, callback) {
        const req_body = body ? JSON.stringify(body) : void 0

        // 向目标服务器发送请求
        const req = http.request({
            'hostname': this.api_host,
            'port': 443,
            'path': path,
            'method': method,
            'searchParams': param,
            'headers': {
                'Content-Type': 'application/json',
                // 'Content-Length': req_body ? Buffer.byteLength(req_body) : void 0
            }
        }, (res) => {
            let data = ''
            res.on('data', (chunk) => {
                data += chunk
            })
            res.on('end', () => {
                let result = {}
                try {
                    result = JSON.parse(data)
                } catch (error) { }
                callback(result, '')
            })
        })
        req.on('error', (error) => {
            callback({}, error.message)
        })

        if (req_body) {
            req.write(req_body)
        }
        req.end()
    }
}


export const hall = new GameHall()
export const maiApi = new ApiMai()

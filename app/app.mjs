import data from './data.mjs'

/**@typedef {import('./types').GameHallMain} GameHallMain */
/**@typedef {import('./types').GameHallItem} GameHallItem */


/**游戏厅 */
class GameHall {
    constructor() {
        const org_data = this.all_hall
        if (Object.keys(this.all_hall) <= 0) {
            // init | 在这里初始化数据值
            org_data.last_number = 10000
            org_data.halls = {}
            this._updateData(org_data)
        }
    }

    /**@returns {GameHallMain} */
    get all_hall() {
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
        const org_data = this.all_hall
        org_data.halls[id] = new_data
        this._updateData(org_data)
    }

    /**
     * 获取机厅数据
     * @param {number} id 
     * @returns {GameHallItem | undefined}
     */
    _getHall(id) {
        return this.all_hall.halls[id]
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
            'games': valid(games, 'array', []),
            'max_player': valid(max_player, 'number', 10),
            'name': valid(name, 'string', '无效机厅名'),
            'nickname': valid(nickname, 'array', []),
            'pos': valid(pos, 'string', '无效位置'),
            'player': 0,
            'time': {
                'new': this._time,
                'change': this._time,
                'change_player': this._time
            },
            'comments': {
                'last_id': 0
            },
            'open_hours': {
                'close': 0,
                'open': 0
            }
        }
        const org_data = this.all_hall
        org_data.last_number += 1
        org_data.halls[org_data.last_number] = hall_data
        this._updateData(org_data)

    }

    /**
     * 更新机厅的信息
     * @param {number} id 机厅ID
     * @param {'append' | 'del' | 'change'} method 更改方式
     * @typedef {'player' | 'games' | 'pos' | 'comments' | 'max_player' | 'name' | 'nickname' | 'going'} ChangeType
     * @param {ChangeType} type 更改类型
     * @param {string | number | Array |object} value 更新值
     * 
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
         * @type {{[x: string]: {append: function, del: function, change: function}}}
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
                change: () => { target.max_player = +value }
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
                    target.player = validPlayer(+target.going + 1)
                    return
                }
            }
        }

        const exe_type = execute[type]
        if (!exe_type) return 'type_not_found'
        const exe = exe_type[method]
        if (!exe) return 'invalid_method'
        exe()

        target.time.change = time
        this._updateHall(id, target)
        return ''
    }

    /**
     * 更新机厅数据
     * @param {number} id 机厅ID
     * @param {GameHallItem} new_data 更新数据
     */
    update(id, new_data) {
        if (!new_data) return 'param_not_fond'
        const target = this._getHall(id)
        if (!target) return 'game_hall_not_found'
        const change = (key_name, value) => {
            target[key_name] = value ? value : target[key_name]
        }
        const {games, name, max_player, nickname, pos, open_hours} = new_data
        
        // #(FIX) 人性化?优化?
        change('games', games)
        change('max_player', max_player)
        change('name', name)
        change('nickname', nickname)
        change('pos', pos)
        change('open_hours', open_hours)
        target.time.change = this._time
        // console.log(target);
        

        this._updateHall(id, target)
    }

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


export const hall = new GameHall()

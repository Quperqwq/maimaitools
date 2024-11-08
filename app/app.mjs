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
     * @param {object} base_data 机厅基本数据
     * @param {string} [base_data.pos] 位置
     * @param {string[]} base_data.games 游戏
     * @param {number} [base_data.max_player] 机厅可容纳最多人数
     */
    new(name, base_data) {
        const {pos, games, max_player} = base_data
        // init
        /**@type {GameHallItem} */
        const hall_data = {
            'games': games ? games : [],
            'max_player': max_player ? max_player : 10,
            'name': name,
            'nickname': [],
            'pos': pos ? pos : '',
            'player': 0,
            'time': {
                'new': this._time,
                'change': this._time,
                'change_player': this._time
            },
            'comments': {
                'last_id': 0
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
     * @typedef {'player' | 'games' | 'pos' | 'comments' | 'max_player' | 'name' | 'nickname'} ChangeType
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
         * @type {{[x: string]: {append: function, del: function, change: function}}}
         */
        const execute = {
            player: {
                append: () => {
                    target.time.change_player = this._time
                    if (target.player + value > target.max_player) return target.player = target.max_player
                    return target.player += value
                },
                change: () => {
                    target.time.change_player = this._time
                    const set = value => target.player = value

                    const number = +value
                    if (isNaN(number)) return set(0)
                    if (number <= 0) return set(0)
                    if (number > target.max_player) return set(target.max_player)
                    set(number)
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
        const {games, name, max_player, nickname, pos} = new_data
        
        // #(FIX) 人性化?优化?
        change('games', games)
        change('max_player', max_player)
        change('name', name)
        change('nickname', nickname)
        change('pos', pos)
        change(target.time.change, this._time)
        // console.log(target);
        

        this._updateHall(id, target)
    }

}


export const hall = new GameHall()

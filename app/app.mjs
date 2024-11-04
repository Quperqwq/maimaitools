import config from './config.mjs'
import data from './data.mjs'
import Path from 'path'



class GameHall {
    constructor() {
        if (Object.keys(this.all_hall) <= 0) {
            // ~(LAST)
            // init
        }
    }

    /**@returns {import('./types').GameHallMain} */
    get all_hall() {
        return data.get('all_hall')
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
        /**@type {import('./types').GameHallItem} */
        const hall_data = {
            'games': games ? games : [],
            'max_player': max_player ? max_player : 20,
            'name': name,
            'pos': pos ? pos : ''
        }
        const org_data = this.all_hall
        org_data.last_number += 1
        org_data[last_number]
    }

    update(target, cont) {

    }
}


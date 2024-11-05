/**hall_player.html关联的JS文件 */
/**@typedef {import('../../../app/types').GameHallMain} GameHallMain */

const doc = {
    window: {
        change_player: getEBI('window-change-player')
    }
}

const refresh = (sorting) => {
    useApi('get_hall_player', {}, (res_data) => {
        if (res_data.message) return console.error('refresh fail!', message)
        /**@type {GameHallMain} */
        const data = res_data.data
        const org_halls = data.halls
        const halls = org_halls
        /**在处理前需要按照`sorting`的值排序 */
        Object.keys(halls).forEach((key) => {
            const value = halls[+key]
            // ~(LAST)
            value
        })
    })
}
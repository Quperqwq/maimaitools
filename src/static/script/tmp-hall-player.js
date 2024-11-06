/**hall_player.html关联的JS文件 */
/**@typedef {import('../../../app/types').GameHallMain} GameHallMain */
/**@typedef {import('../../../app/types').GameHalls} GameHalls */

const doc = {
    window: {
        change_player: getEBI('window-change-player'),
        show_detail: getEBI('window-hall-detail')
    },
    input: {
        player_number: {
            submit: getEBI('submit-player-number'),
            input: getEBI('current-player-number'),
            add: getEBI('add-player-number'),
            min: getEBI('min-player-number'),
            refresh: getEBI('refresh-halls')
        }
    },
    text: {
        hall_detail: {
            name: getEBI('detail-hall-name'),
            player: getEBI('detail-hall-player'),
            time_wait: getEBI('detail-hall-time-wait'),
            time_update: getEBI('detail-hall-time-update'),
            nickname: getEBI('detail-hall-nickname'),
            pos: getEBI('detail-hall-pos'),
            max: getEBI('detail-hall-max')
        }
    },
    list: getEBI('hall-player-list')
}

const callbacks = {
    /**当提交玩家人数时会触发此函数,该函数会传入一个控制window是否显示的Element元素 @type {function(Element): void}  */
    submitPlayerNumber: () => {},
    /**当用户触发显示机厅详情是会触发此函数 */
    showDetail: () => {},
}

const _init = () => {
    /**
     * 检查对象是否是有效函数, 如果是将会自动执行
     * @param {function} func 
     */
    const runCommand = (func, ...arg) => {
        if (!func) return
        func(...arg)
    }

    const initCommand = {
        /**玩家人数 */
        playerNumber: () => {
            const { refresh, add, min, input, submit } = doc.input.player_number
            const { change_player } = doc.window

            /**刷新按钮 */
            refresh.addEventListener('click', () => {
                refreshList()
            })
            /**添加人数按钮 */
            add.addEventListener('click', () => {
                const { value } = input
                input.value = +value + 1
            })
            /**减少人数按钮 */
            min.addEventListener('click', () => {
                input.value -= 1
                const { value } = input
                if (value <= 0) input.value = 0
            })
            /**提交按钮 */
            submit.addEventListener('click', () => {
                runCommand(callbacks.submitPlayerNumber, change_player)
            })
        },

        /**机厅详情 */
        hallDetail: () => {
            const { show_detail } = doc.window
            // const {name, player, time_update, time_wait} = doc.text.hall_detail
            show_detail.addEventListener('change', (event) => {
                if (!event.target.checked) return
                runCommand(callbacks.showDetail)
            })
        }
    }

    Object.values(initCommand).forEach(command => command())
}

/**
 * 更新当前玩家列表
 * @param {string} sorting 排序方式
 */
const refreshList = (sorting) => {
    /**
     * 设置机厅人的数量决定人数的字体颜色
     * @param {number} number 机厅人数
     */
    const setColor = (number) => {
        if (number <= 0) return 'no'
        if (number <= 2) return 'few'
        if (number <= 4) return 'some'
        if (number <= 6) return 'sev'
        return 'many'
    }
    useApi('get_hall_player', {}, (res_data) => {

        if (res_data.message) return console.error('refresh fail!', message)
        /**@type {GameHalls} */
        const org_halls = res_data.data
        console.log(res_data)

        // 初始化
        doc.list.innerHTML = ''

        // 处理来自sorting的排序 org_halls => halls
        const halls = org_halls
        

        Object.keys(halls).forEach((key) => {
            // 根据对象创建网页元素并绑定相关事件
            const id = +key
            const hall = halls[id]
            const {max_player, player, name} = hall
            const {input} = doc.input.player_number

            const changePlayer = () => {
                // 打开更改玩家人数窗口时
                input.value = player
                callbacks.submitPlayerNumber = (show) => {
                    show.checked = false
                    useApi('change_hall_data', {
                        id: id,
                        type: 'player',
                        method: 'change',
                        value: input.value
                    }, (res) => {
                        console.log(res)
                        refreshList()
                    })
                }
            }

            const showDetail = () => {
                const {name, player, time_update, time_wait, nickname, pos, max} = doc.text.hall_detail
                const {change_player} = hall.time
                callbacks.showDetail = () => {
                    const time = {
                        update: getTime(new Date().getTime() - change_player),
                        wait: hall.player ? getTime( hall.player / 2 * 15 * 60000 ) : 0
                    }
                    name.innerText = hall.name
                    player.innerText = hall.player
                    time_update.innerText = time.update
                    // (i)预计需要排队计算
                    time_wait.innerText = time.wait
                    nickname.innerText = valid(hall.nickname.toString(), '暂无别名')
                    pos.innerText = valid(hall.pos, '未指定')
                    max.innerText = max_player
                }
            }


            const e_right = create('section', {class: 'right'})
            join(e_right, 
                join(create('label', {for: 'window-change-player'}, changePlayer), {
                    title: create('h3', {}, '当前人数'),
                    number: create('h2', {class: `hall-number ${setColor(player)}`, style: `--percent: ${(player / max_player) * 100}%;`}, player)
                })
            )

            const e_left = create('section', {class: 'left'})
            const e_more = create('h3', {class: 'more'})
            join(e_more, {
                show_comment: create('label', {class: 'pseudo button icon-link', for: 'window-player-comment'}, '评论'),
                show_detailed: create('label', {class: 'pseudo button icon-link', for: 'window-hall-detail'}, showDetail, '详情'),
            })
            join(e_left, {
                title: create('h3', {class: 'name'}, name),
                more: e_more
            })
            
            
            doc.list.appendChild(
                join( create('li'), [e_left, e_right] )
            )

        })
    })
}

_init()
refreshList()
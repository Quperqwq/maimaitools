/**hall_player.html关联的JS文件 */
/**@typedef {import('../../../app/types').GameHallMain} GameHallMain */
/**@typedef {import('../../../app/types').GameHalls} GameHalls */
/**@typedef {import('../../../app/types').GameHallItem} GameHallItem */

const doc = {
    window: {
        change_player: getEBI('window-change-player'),
        show_detail: getEBI('window-hall-detail'),
        show_set_hall: getEBI('window-hall-set')
    },
    input: {
        player_number: {
            submit: getEBI('submit-player-number'),
            input: getEBI('current-player-number'),
            add: getEBI('add-player-number'),
            min: getEBI('min-player-number'),
            refresh: getEBI('refresh-halls')
        },
        hall_set: {
            form: getEBI('set-hall-form'),
            submit: getEBI('submit-hall-set'),
            name: getEBI('set-hall-name'),
            nickname: {
                /**ul li*n */
                element: getEBI('set-hall-nickname-list'),
                /**input Element */
                input: getEBI('set-hall-nickname')
            },
            pos: getEBI('set-hall-pos'),
            player: getEBI('set-hall-max_player'),
            games: {
                /**ul li*n */
                element: getEBI('set-hall-games-list')
                /**input Element */,
                input: getEBI('set-hall-games')
            },
            new_hall: getEBI('window-hall-new')
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
        },
        player_number: {
            name: getEBI('player-number-name'),
            change_time: getEBI('player-number-change_time') 
        }
    },
    list: getEBI('hall-player-list')
}

const callbacks = {
    /**当提交玩家人数时会触发此函数,该函数会传入一个控制window是否显示的Element元素 @type {function(Element): void}  */
    submitPlayerNumber: () => {},
    // showPlayerNumber: () => {},
    /**
     * 当用户打开显示机厅详情窗口时会触发此函数
     * @param {Object.<string, Element | undefined>} elements
     */
    showDetail: (elements) => {},
    /**
     * 当用户提交设置机厅内容的时候会触发此函数
     * @param {GameHallItem} input
     * @param {function(boolean)} onWait
     */
    submitSetHall: (input, onWait) => {  },
    
    /**
     * 当用户打开更改或新建机厅窗口时时会触发此函数
     * @param {{nickname: InputList, games: InputList}} input_list 
     */
    showSetHall: (input_list) => { }
}

// 初始化页面函数, 它们通常只会执行一次
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
                const bar_config = {
                    'show_time': 1000
                }
                refresh.disabled = true
                infoBar('正在刷新...', bar_config)
                refreshList({}, () => {
                    refresh.disabled = false
                    infoBar('刷新完成', bar_config)
                })
            })

            const changePlayerNumber = (target) => {
                const { max, min } = input
                if (target > max) return input.value = max
                if (target < min) return input.value = min
                input.value = target
            }
            /**添加人数按钮 */
            add.addEventListener('click', () => {
                changePlayerNumber(+input.value + 1)
            })
            /**减少人数按钮 */
            min.addEventListener('click', () => {
                changePlayerNumber(+input.value - 1)
            })
            /**提交按钮 */
            submit.addEventListener('click', () => {
                runCommand(callbacks.submitPlayerNumber, change_player)
            })
        },

        /**机厅详情 */
        hallDetail: () => {
            const { show_detail } = doc.window
            show_detail.addEventListener('change', (event) => {
                if (!event.target.checked) return
                runCommand(callbacks.showDetail, doc.text.hall_detail)
            })
        },

        /**机厅设置或新建 */
        hallSet: () => {
            const { window: { show_set_hall }, input: {hall_set: {form, nickname, games, new_hall}} } = doc

            const list = {
                nickname: new InputList(nickname.element, nickname.input),
                games: new InputList(games.element, games.input)
            }

            // 添加(新建)机厅
            new_hall.addEventListener('click', () => {
                callbacks.submitSetHall = (input, wait) => {
                    wait(true)
                    // 新建机厅
                    useApi('new_hall', {value: input}, (res_data) => {
                        wait(false)
                        const { valid, message } = res_data
                        if (!valid) {
                            infoBar('新建失败!')
                            console.error('error message:', message)
                        }
                        show_set_hall.checked = false
                        refreshList()
                    })
                }
            })

            // 打开窗口
            show_set_hall.addEventListener('change', (event) => {
                if (!event.target.checked) return
                form.reset()
                
                runCommand(callbacks.showSetHall, list)
                callbacks.showSetHall = void 0
            })

            // 重置表单
            form.addEventListener('reset', () => {
                Object.values(list).forEach((inputList) => {
                    inputList.reset()
                })
            })

            // 提交时, 将表单内容作为参数传递给处理函数
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                const {name, pos, player} = doc.input.hall_set
                /**@type {GameHallItem} */
                const form_data = {
                    'games': list.games.value,
                    'max_player': valid(player.value, 10),
                    'name': valid (name.value, '未指定'),
                    'nickname': list.nickname.value,
                    'pos': pos.value
                }
                // 将等待函数用作参数传递给处理函数
                const onWait = (is_wait) => {
                    const { submit } = doc.input.hall_set
                    if (is_wait) {
                        submit.innerText = '稍等'
                        submit.disabled = true
                    } else {
                        submit.innerText = '就这样'
                        submit.disabled = false
                    }
                }
                runCommand(callbacks.submitSetHall, form_data, onWait)
            })
        }
    }

    Object.values(initCommand).forEach(command => command())
}

/**
 * 更新当前玩家列表
 * @param {object} sorting 排序方式
 * @param {'normal' | 'player' | 'change_time'} sorting.method 排序方法
 * @param {boolean} sorting.is_ascending 正序, 否则将会倒叙排列
 * @param {function} [callback] 刷新完成后调用
 */
const refreshList = (sorting, callback) => {
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
            if (callback) callback()
            // 根据对象创建网页元素并绑定相关事件
            const id = +key
            const hall = halls[id]
            const {max_player, player, name, games, nickname} = hall
            const {input} = doc.input.player_number

            /**时间相关内容 */
            const time = {
                update: getChangeTime(hall.time.change_player),
                wait: hall.player ? getTime( hall.player / 2 * 15 * 60000 ) : '0秒',
                change: getChangeTime(hall.time.change_player)
            }

            // 当点击机厅名时
            const clickHallName = () => {

            }

            // 打开更改玩家人数窗口时
            const showPlayerNumber = () => {
                // 更新机厅名
                const {name, change_time} = doc.text.player_number
                name.innerText = hall.name
                change_time.innerText = getChangeTime()
                

                // 设置输入限制
                input.value = player
                input.max = max_player
                input.min = 0
                callbacks.submitPlayerNumber = (show) => {
                    // 提交玩家数量逻辑
                    show.checked = false
                    // (ADD)这里后续需要增加一个等待提示

                    useApi('change_hall_data', {
                        id: id,
                        type: 'player',
                        method: 'change',
                        value: input.value
                    }, (res) => {
                        // (ADD)等待结束
                        console.log(res)
                        refreshList()
                    })
                }
            }

            // 当打开显示详情窗口时
            const showDetail = () => {
                callbacks.showDetail = (elements) => {
                    const {name, player, time_update, time_wait, nickname, pos, max} = elements
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

            // 当打开显示评论窗口时
            const showComment = (event) => {

            }

            // 当打开显示设置机厅窗口时
            const showSet = () => {
                // 打开窗体
                /**@param {boolean} is_wait */
                callbacks.showSetHall = (input) => {
                    input.games.setValue(games)
                    input.nickname.setValue(nickname)
                    const {name, pos, player} = doc.input.hall_set
                    name.value = hall.name
                    pos.value = hall.pos
                    player.value = hall.max_player
                }
                // 提交内容
                callbacks.submitSetHall = (input, wait) => {
                    wait(true)
                    useApi('change_hall_data', {
                        type: 'all',
                        value: input,
                        id
                    }, (res_data) => {
                        const {valid, message} = res_data
                        wait(false)
                        doc.window.show_set_hall.checked = false
                        if (!valid) {
                            infoBar('更新失败!')
                            console.error('error message:', message)
                        }
                        refreshList()
                    })
                }
            }


            /**
             * [`create() -> Element`的简写] 创建一个li元素
             * @param {string} content 元素的内容
             * @param {object} attribute 元素的属性
             */
            const createLi = (content, attribute) => {
                return create('li', attribute, content)
            }




            const e_right = create('section', {class: 'right'})
            join(e_right, 
                join(create('label', {for: 'window-change-player'}, showPlayerNumber), {
                    title: create('h3', {}, '当前人数'),
                    number: create('h2', {class: `hall-number ${setColor(player)}`, style: `--percent: ${(player / max_player) * 100}%;`}, player)
                })
            )

            const e_left = create('section', {class: 'left'})
            const e_more = create('h3', {class: 'more'})
            join(e_more, {
                show_comment: create('label', {class: 'pseudo button icon-link', for: 'window-player-comment'}, showComment, '评论'),
                show_detailed: create('label', {class: 'pseudo button icon-link', for: 'window-hall-detail'}, showDetail, '详情'),
                show_setting: create('label', {class: 'pseudo button icon-config', for: 'window-hall-set'}, showSet, '设置'),
            })
            join(e_left, {
                title: join(
                    create('h3', {class: 'name icon-go right-icon'}, clickHallName),
                    create('span', {class: 'content hidden-scrollbar'}, name)
                ),
                state: join(
                    create('ul', {class: 'row state hidden-scrollbar'}), {
                        tag: createLi('', {class: 'tag none'}),
                        nickname: nickname.length > 0 ? createLi(
                            nickname.toString(), {class: 'nickname'}
                        ) : void 0,
                        wait_time: createLi(time.wait, {class: 'wait'}),
                        games: createLi(hall.games.toString(), { class: 'games' })
                    }
                ),
                more: e_more
            })
            
            
            doc.list.appendChild(
                join( createLi('', {class: 'hall-item'}), [e_left, e_right] )
            )

        })
    })
}

_init()
refreshList()
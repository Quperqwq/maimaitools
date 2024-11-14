/**hall_player.html关联的JS文件 */
/**@typedef {import('../../../app/types').GameHallMain} GameHallMain */
/**@typedef {import('../../../app/types').GameHalls} GameHalls */
/**@typedef {import('../../../app/types').GameHallItem} GameHallItem */

const doc = {
    window: {
        change_player: getEBI('window-change-player'),
        show_detail: getEBI('window-hall-detail'),
        show_set_hall: getEBI('window-hall-set'),
        filter: getEBI('window-filter')
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
        },
        trip: {
            finish: getEBI('trip-finish'),
            cancel: getEBI('trip-cancel')
        },
        filter: {
            form: getEBI('filter-form'),
            submit: getEBI('submit-filter'),
            game: getEBI('set-filter-game'),
            order: {
                target: getEBI('set-filter-order_target'),method: getEBI('set-filter-order_method'),
            }
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
            max: getEBI('detail-hall-max'),
            id: getEBI('detail-hall-id')
        },
        player_number: {
            name: getEBI('player-number-name'),
            change_time: getEBI('player-number-change_time') 
        },
        trip: {
            name: getEBI('on-trip-name'),
            pos: getEBI('on-trip-target'),
        },
        time: {
            last_update: getEBI('last-refresh-time'),
        }
    },
    card: {
        trip: getEBI('card-trip')
    },
    list: getEBI('hall-player-list')
}

/**全局对象 */
const global = {
    /**计时器相关 */
    timer: {
        last_refresh: null
    },
    /**时间相关 */
    time: {
        refresh: null
    }
}

const callbacks = {
    /**当提交玩家人数时会触发此函数,该函数会传入一个控制window是否显示的Element元素 @type {function(Element): void}  */
    submitPlayerNumber: () => {},
    // showPlayerNumber: () => {},
    /**
     * 当用户打开显示机厅详情窗口时会触发此函数
     * @param {Object.<string, Element | void 0>} elements
     */
    showDetail: (elements) => {},
    /**
     * 当用户提交设置机厅内容的时候会触发此函数
     * @param {GameHallItem} input
     * @param {function(boolean)} onWait
     */
    submitSetHall: (input, onWait) => {  },
    
    // /**
    //  * 当用户提交排序序方式时
    //  * @param {{ order: {target: string, method: string}, show: string[] }} input 用户输入内容
    //  * @param {function(boolean)} onWait 
    //  */
    // submitFilter: (input, onWait) => {  },

    /**
     * 当用户打开更改或新建机厅窗口时时会触发此函数
     * @param {{nickname: InputList, games: InputList}} input_list 
     */
    showSetHall: (input_list) => { },

    /**
     * 当用户trip时点击"已到达"时
     * @param {function(boolean): void} is_disabled 该按钮可用性
     */
    onTripFinish: (is_disabled) => {  },

    /**
     * 当用户trip时点击"不去了"时
     * @param {function(boolean): void} is_disabled 该按钮可用性
     */
    onTripCancel: (is_disabled) => {  },


}

const config = {
    /** 过滤或排序方法 */
    filter: {
        /** 过滤机台 @type {string[]} */
        show: [],
        /** 排序 */
        order: {
            /** 排序依据 @type {'player' | 'update_time' | 'create_time'}  */
            target: '',
            /** 排序方法 @type {'asc' | 'desc'} */
            method: ''
        },
        init: false
    },
    /**正在前往的机厅 */
    going: {
        /**是否在途中 */
        is: false,
        /**前往的目标机厅ID */
        target: 0
    }
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
                refreshList(() => {
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
                    useApi('new_hall', {value: input}, (res_data, err) => {
                        wait(false)
                        if (err) return infoBar('新建失败!')
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
        },

        /**用户trip卡片 */
        tripCard: () => {
            const {finish, cancel} = doc.input.trip
            finish.addEventListener('click', () => {
                runCommand(callbacks.onTripFinish, (is_disabled) => {
                    finish.disabled = is_disabled ? true : false
                })
            })
            cancel.addEventListener('click', () => {
                runCommand(callbacks.onTripCancel, (is_disabled) => {
                    cancel.disabled = is_disabled ? true : false
                })
            })
        },

        /**选择过滤方式 */
        filter: () => {
            const {input: {filter: {form}}, window: {filter}} = doc

            const changeConfig = () => {
                const {game, order: {target, method}} = doc.input.filter

                const checked_target = target.querySelector('[name="set-filter-item"]:checked').value
                const checked_method = method.value

                const checked_games = [...game.querySelectorAll('[name="set-filter-game"]:checked')].map(input => input.value)  // 获取选择需要显示的游戏
                
                config.filter = {
                    'order': {
                        'target': checked_target,
                        'method': checked_method
                    },
                    'show': checked_games,
                    'init': true
                }

            }

            // 提交时
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                changeConfig()
                filter.checked = false
                refreshList()
            })
        },

        /**时间显示相关 */
        timer: () => {
            const {last_update} = doc.text.time
            const changeRefresh = (cont) => {
                last_update.innerText = cont
            }
            // 上次刷新时间
            global.timer.last_refresh = setInterval(() => {
                const {refresh: refresh_time} = global.time
                if (!refresh_time) return changeRefresh('-')
                changeRefresh(getElapsedTime(refresh_time))
            }, 1000)
        }
    }

    Object.values(initCommand).forEach(command => command())
}

/**
 * 更新当前机厅列表
 * @param {function} [callback] 刷新完成后调用
 * @param {boolean} [_init] 是否为初始化
 */
const refreshList = (callback, _init) => {
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

    global.time.refresh = timeIs()
    infoBar('刷新中...', {keep: true})
    // main
    useApi('get_hall_player', {}, (res_data, err) => {
        if (res_data.message) {
            infoBar('刷新失败!')
            return console.error('refresh fail!', message)
        }
        infoBar('刷新完成')
        /**@type {GameHalls} */
        const org_halls = res_data.data
        console.log(res_data)
        if (typeof(callback) === 'function') callback()

        if (err) return infoBar('更新失败!')

        // step.1) 初始化内容
        doc.list.innerHTML = ''

        /**
         * step.3) 进行内容创建
         * @param {GameHallItem[]} halls 
         */
        const main = (halls) => {
            Object.keys(halls).forEach((key) => {
                // 根据对象创建网页元素并绑定相关事件
                const hall = halls[+key]
                const id = typeof(hall.id) === 'number' ? hall.id : +key
                const {max_player, player, name, games, nickname, pos} = hall
                const {input} = doc.input.player_number

                class Time {
                    constructor() {
                        this.wait = player ? getTime( player / 2 * 15 * 60000 ) : '0秒'
                    }
                    get update() {
                        return getElapsedTime(hall.time.change_player)
                    }
                    get change() {
                        return getElapsedTime(hall.time.change_player)
                    }
                }
                /**时间相关内容 */
                const time = new Time()


                // ~创建快捷操作DOM的方式
                /**
                 * (DOM)更改trip卡片的内容为此机厅
                 * @param {boolean} is_trip 是否在途中
                 */
                const updateTrip = (is_trip = true) => {
                    const {going} = config
                    const {text: {trip: {name, pos}}, card: {trip}} = doc
                    const hall_name = e_hall_name
                        
                    const req_tmp = {
                        id: id,
                        type: 'going',
                        method: ''
                    }


                    /**
                     * 结束trip
                     * @param {string} message 结束时给用户的信息
                    */
                    const endTrip = (message = '') => {
                        message ? infoBar(message) : null
                        hall_name.classList.remove('go')
                        trip.classList.remove('show')
                        going.is = false
                        cookie.del('goto_hall')
                    }

                    if (!is_trip) endTrip()

                    hall_name.classList.add('go')
                    trip.classList.add('show')
                    name.innerText = hall.name
                    pos.innerText = hall.pos
                    going.is = true

                    // 取消前往
                    callbacks.onTripCancel = (dis) => {
                        dis(true)
                        req_tmp.method = 'del'
                        useApi('change_hall_data', req_tmp, () => {
                            dis(false)
                            endTrip('那再想想去哪里吧...')
                        })
                    }
                    // 确认到达
                    callbacks.onTripFinish = (dis) => {
                        dis(true)
                        req_tmp.method = 'change'
                        useApi('change_hall_data', req_tmp, (res_data) => {
                            dis(false)
                            if (!res_data.valid) return endTrip('前往失败!')
                            endTrip('到了哟')
                            refreshList()
                        })
                    }
                }


                // ~按钮或其他元素绑定的事件
                /**
                 * 去这个机厅
                 * @param {Element} e_button
                 */
                const goHall = (_, e_button) => {
                    const {going} = config
                    if ( going.is ) return infoBar('请先取消现在的行程') // 有出发的目标将不会被处理
                    e_button.disabled = true
                    useApi('change_hall_data', {
                        id: id,
                        type: 'going',
                        method: 'append'
                    }, (res_data) => {
                        e_button.disabled = false
                        if (!res_data) {
                            infoBar('预前往失败!')
                            return
                        }
                        updateTrip(true)
                        infoBar('已确定行程')
                        cookie.set('goto_hall', id, 2)
                    })
                }

                // 打开更改玩家人数窗口时
                const showPlayerNumber = () => {
                    // 更新机厅名
                    const {name, change_time} = doc.text.player_number
                    name.innerText = hall.name
                    change_time.innerText = time.change
                    

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
                        }, (res, err) => {
                            if (err) return infoBar('更新人数失败!')
                            // (ADD)等待结束
                            // console.log(res)
                            refreshList()
                        })
                    }
                }

                // 当打开显示详情窗口时
                const showDetail = () => {
                    callbacks.showDetail = (elements) => {
                        const {name: e_name, player: e_player, time_update: e_time_update, time_wait: e_time_wait, nickname: e_nickname, pos: e_pos, max: e_max, id: e_id} = elements
                        e_name.innerText = name
                        e_player.innerText = player
                        e_time_update.innerText = time.update
                        // (i)预计需要排队计算
                        e_time_wait.innerText = time.wait
                        e_nickname.innerText = valid(nickname.toString(), '暂无别名')
                        e_pos.innerText = valid(pos, '未指定')
                        e_max.innerText = max_player
                        e_id.innerText = id
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
                        }, (res_data, err) => {
                            const {valid, message} = res_data
                            wait(false)
                            if (err) return infoBar('更新失败!')
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


                // DOM-create ...


                // DOM-create main<left, right>
                const e_main = create('section', { class: 'main' })

                // DOM-create right
                const e_right = create('section', { class: 'right' })
                join(e_right, (join(
                    create('label', { for: 'window-change-player' }, showPlayerNumber), {
                    title: create('h3', {}, '当前人数'),
                    number: create('h2', { class: `hall-number ${setColor(player)}`, style: `--percent: ${(player / max_player) * 100}%;` }, player)
                }))
                )

                // DOM-create left
                const e_left = create('section', { class: 'left' })
                const e_more = create('h3', { class: 'more' })
                join(e_more, {
                    show_comment: create('label', { class: 'pseudo button icon-link none', for: 'window-player-comment' }, showComment, '评论'),
                    show_detailed: create('label', { class: 'pseudo button icon-link', for: 'window-hall-detail' }, showDetail, '详情'),
                    show_setting: create('label', { class: 'pseudo button icon-config', for: 'window-hall-set' }, showSet, '设置'),
                    go_it: create('button', { type: 'button', class: 'pseudo button icon-go' }, goHall, '去这里'),
                })
                // 创建机厅名的对象引用, 以便更改样式
                const e_hall_name = create('h3', { class: 'name icon-go right-icon' })

                join(e_left, {
                    title: join(
                        e_hall_name,
                        create('span', { class: 'content hidden-scrollbar' }, name)
                    ),
                    state: join(
                        create('ul', { class: 'row state hidden-scrollbar' }), {
                        tag: createLi('', { class: 'tag none' }),
                        nickname: nickname.length > 0 ? createLi(
                            nickname.toString(), { class: 'nickname' }
                        ) : void 0,
                        wait_time: createLi(time.wait, { class: 'wait' }),
                        games: createLi(hall.games.toString(), { class: 'games' })
                    }
                    ),
                    more: e_more
                })

                // DOM-create other
                const e_other = create('section', { class: 'other' })
                join(e_other, {

                })


                // DOM-join ...

                // DOM-join left&right -> main
                join(e_main, [
                    e_left,
                    e_right
                ])

                // DOM-join main& -> li
                doc.list.appendChild(
                    join(createLi('', { class: 'hall-item hidden-scrollbar' }), [
                        e_main,
                        e_other
                    ]
                    )
                )
                

                // 是否有去机厅的记录
                const _go_hall = cookie.get('goto_hall')
                if (+_go_hall === id) {
                    // 如果有
                    config.going.is = true
                    if (_init) updateTrip(true)
                    e_hall_name.classList.add('go')
                }

            })
        }

        

        /**
         * step.2) 对原始内容进行排序
         */
        const runFilter = () => {
            // 处理来自config.sorting的排序 org_halls => halls
            const {filter} = config
            if (!filter.init) return main(org_halls) // 如果filter的配置没有初始化则使不进行处理使用原始值

            /**
             * 排序依据对应的方法
             * 'player' | 'update_time' | 'create_time'
             */
            let sortingMethod = () => {}
            const sorting = new Sorting(filter.order.method === 'desc' ? false : true)
            const halls = []
            Object.keys(org_halls).forEach((key) => {
                // Func) 定义函数

                /**
                 * 向排序列表添加一个值
                 * @param {string | number} basis 排序依据
                 */
                const addItem = (basis) => {
                    sorting.addItem(basis, [id, hall])
                }

                sortingMethod = () => {
                    sortingMethod = {
                        player: () => {
                            addItem(hall.player)
                        },
                        update_time: () => {
                            addItem(hall.time.change)
                        },
                        create_time: () => {
                            addItem(hall.time.new)
                        }
                    }[target]()
                }


                /**
                 * 确认`arr`是否包含`rel_arr`的任意一个值
                 * @param {any[]} arr 一个Array对象
                 * @param {any[]} rel_arr 需要比对的Array对象
                 * @returns {boolean}
                 */
                const have = (arr, rel_arr) => {
                    let is_have = false
                    rel_arr.forEach((value) => {
                        if (arr.includes(value))
                            is_have = true
                        })
                    return is_have
                }

                // Start) 从这里开始

                const {show, order: {target}} = filter

                const id = +key
                const hall = org_halls[id]

                // 过滤条件 (是否包含指定游戏)
                if (!have(hall.games, show)) return

                // 排序条件
                sortingMethod()
            })
            // console.log(sorting.basis);
            console.log('value of:', sorting.value);
            
            const output = sorting.getValues()
            output.forEach((item, index) => {
                const hall = item[1]
                hall.id = item[0]
                halls[index] = hall
            })
            console.log(halls); 
            main(halls)
        }
        runFilter()
    })
}

_init()
refreshList(void 0, true)
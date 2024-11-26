/**hall.html关联的JS文件 */
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
            open_hours: {
                open: getQS('[name="open"]', 'set-hall-open_hours'),
                close: getQS('[name="close"]', 'set-hall-open_hours')
            },
            map_id: getEBI('set-hall-map-id'),
            new_hall: getEBI('window-hall-new')
        },
        trip: {
            finish: getEBI('trip-finish'),
            cancel: getEBI('trip-cancel')
        },
        filter: {
            form: getEBI('filter-form'),
            submit: getEBI('submit-filter'),
            /**更多选项 */
            more: getQSA('[name="set-filter-more"]', 'set-filter-more'),
            /**过滤游戏 */
            game: getQSA('[name="set-filter-game"]', 'set-filter-game'),
            /**显示字段 */
            show: getQSA('[name="set-filter-show"]', 'set-filter-show'),
            order: {
                // target: getEBI('set-filter-order_target'),method: getEBI('set-filter-order_method'),
                target: getQSA(
                    '[name="set-filter-order"]',
                    'set-filter-order_target'
                ),method: getEBI('set-filter-order_method'),
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
            id: getEBI('detail-hall-id'),
            open_hours: getEBI('detail-hall-open_hours'),
            link: {
                map: getEBI('detail-hall-link-map')
            }
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
        /**过滤 */
        show: {
            /** 过滤机台 @type {string[]} */
            game: [],
            /** 仅显示收藏 */
            fav: false,
            /**显示字段 @type {string[]} */
            fields: []
        },
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
    },
    /**用户收藏的机厅 @type {string[]} */
    fav: []
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
                // infoBar('正在刷新...', bar_config)
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

            /**
             * 获取表单的内容
             * @returns {GameHallItem}
             */
            const getFormData = () => {
                const {name, pos, player, open_hours: {open, close}, map_id: _map_id} = doc.input.hall_set
                let map_id = _map_id.value
                try {
                    const url = new URL(map_id)
                    if (url.hostname === 'map.bemanicn.com') { // 是音游地图域名将会取尾
                        map_id = url.pathname.split('/').pop()
                    } else { // 不是音游地图域名
                        map_id = void 0
                    }
                    
                } catch (error) { }
                map_id = map_id || +_map_id.value || void 0
                // console.log(map_id)
                
                return {
                    'games': list.games.value,
                    'max_player': valid(player.value, 10),
                    'name': valid(name.value, '未指定'),
                    'nickname': list.nickname.value,
                    'pos': pos.value,
                    'open_hours': {
                        'close': toDayTime(close.value),
                        'open': toDayTime(open.value)
                    },
                    map_id
                }
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
                
                runCommand(callbacks.showSetHall, list, getFormData())
                callbacks.showSetHall = void 0
            })

            // 音游地图ID(失去焦点 => 转换为ID)
            // map_id.addEventListener('blur', () => {

            // })

            // 重置表单
            form.addEventListener('reset', () => {
                Object.values(list).forEach((inputList) => {
                    inputList.reset()
                })
            })

            // 提交时, 将表单内容作为参数传递给处理函数
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                const form_data = getFormData()
                // 将等待函数用作参数传递给处理函数
                const onWait = (is_wait) => {
                    const { submit } = doc.input.hall_set
                    const { show_set_hall } = doc.window
                    if (is_wait) {
                        submit.innerText = '稍等'
                        submit.disabled = true
                    } else {
                        submit.innerText = '就这样'
                        submit.disabled = false
                        show_set_hall.checked = false
                    }
                }
                /* 在这里调用 */runCommand(callbacks.submitSetHall, form_data, onWait)
                refreshList(void 0, {
                    'show_info': false
                })
            })
        },

        /**用户trip卡片 */
        tripCard: () => {
            const {finish, cancel} = doc.input.trip
            /**
             * 是否在等待
             * @param {boolean} _is_wait 
             * @param {Element} element 
             */
            const wait = (_is_wait, element) => {
                const is_wait = _is_wait ? true : false
                waitBar(is_wait)
                element.disabled = is_wait
            }
            finish.addEventListener('click', () => {
                runCommand(callbacks.onTripFinish, (is_wait) => {
                    wait(is_wait, finish)
                })
            })
            cancel.addEventListener('click', () => {
                runCommand(callbacks.onTripCancel, (is_wait) => {
                    wait(is_wait, cancel)
                })
            })
        },

        /**选择过滤方式 */
        filter: () => {
            const {input: {filter: {form}}, window: {filter}} = doc
            const {game: es_game, show: es_show, more: es_more, order: {target: es_target, method: e_method}} = doc.input.filter

            // 更改config对象下次刷新时进行排序
            const changeConfig = () => {
                const checked_target = getCheckedElement(es_target)[0]
                
                const checked_method = e_method.value

                const checked_games = getCheckedElement(es_game) // 获取选择需要显示的游戏
                const checked_show = getCheckedElement(es_show) // 获取选择需要显示的字段
                const checked_more = getCheckedElement(es_more)

                config.filter = {
                    'order': {
                        'target': checked_target,
                        'method': checked_method
                    },
                    'show': {
                        'game': checked_games,
                        'fields': checked_show,
                        'fav': checked_more.includes('show-fav')
                    },
                    'init': true
                }

                if (checked_more.includes('save-filter')) { // 需要记住筛选条件
                    cookie.setObj('filter', config.filter)
                } else { // 无需
                    cookie.del('filter')
                }
            }

            // 提交时
            form.addEventListener('submit', (event) => {
                event.preventDefault()
                changeConfig()
                filter.checked = false
                refreshList()
            })
            const init = () => {
                /**
                 * 重新载入保存的input内容
                 * @param {string[] | string} cont 
                 * @param {HTMLInputElement[]} input_elements 
                 * @param {string} config_key 
                 */
                const reloadStat = (cont, input_elements) => {
                    console.log(cont, input_elements);
                    
                    const _cont = Array.isArray(cont) ? cont : [cont]
                    input_elements.forEach((element) => {
                        element.checked = _cont.includes(element.value)
                    })
                }

                let cache = config.filter
                cache = {
                    ...cookie.getObj('filter')
                }
                config.filter = cache

                if (Object.keys(cache).length > 0) {
                    // 重置按钮之前的状态
                    reloadStat(cache.show.game, es_game)
                    reloadStat(cache.show.fields, es_show)
                    // reloadStat([cache.fav ? '' : 'show-fav'], es_more)
                    
                    reloadStat(cache.order.target, es_target)
                    reloadStat(cache.order.method, [e_method])
                }

            }
            init()

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
        },

        /**用户收藏的机厅 */
        fav: () => {
            config.fav = cookie.getArrayData('fav')
        }
    }

    Object.values(initCommand).forEach(command => command())
}

/**
 * 更新当前机厅列表
 * @param {function} [callback] 刷新完成后调用
 * @param {object} param1
 * @param {boolean} param1._init 为初始化(将会按照第一次操作执行)
 * @param {boolean} param1.show_info 显示刷新状态的`info_bar`字样
 */
const refreshList = (callback, {
    _init = false,
    show_info = true
} = {}) => {
    waitBar(true)

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

    /**
     * infoBar引用
     */
    const showInfo = (message = '', setting = {}) => {
        if (show_info) infoBar(message, setting)
    }

    global.time.refresh = timeIs()
    // showInfo('刷新中...', {keep: true})
    // main
    useApi('get_hall_data', {}, (res_data, err) => {
        waitBar(false)
        if (res_data.message) {
            showInfo('刷新失败!')
            return console.error('refresh fail!', message)
        }
        showInfo('刷新完成')
        /**@type {GameHalls} */
        const org_halls = res_data.data
        console.log('hall data:', res_data.data)
        if (typeof(callback) === 'function') callback()

        if (err) return showInfo('更新失败!')

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
                const {fav: fav_hall} = config

                /**营业时间段的`string`样式 */
                const str_open_hours = {
                    open: toDayTime(hall.open_hours.open),
                    close: toDayTime(hall.open_hours.close),
                }
                /**营业时间段期间的`string`样式 */
                const open_hours_period = str_open_hours.open + ' - ' + str_open_hours.close

                /**用户是否收藏了此机厅 */
                let is_fav = fav_hall.includes(`${id}`)

                class Time {
                    constructor() {
                        this.wait = player ? getTime( player / 2 * 15 * 60000 ) : '0秒'
                    }
                    get update() {
                        return getElapsedTime(hall.time.change)
                    }
                    get change() {
                        return getElapsedTime(hall.time.change_player)
                    }
                }
                /**时间相关内容 */
                const time = new Time()

                // 快捷方式
                /**
                 * 是否在营业时间内
                 */
                const inOpenHours = () => {
                    if (hall.open_hours.open !== null) {
                        const {open, close} = hall.open_hours
                        const now_time = getDayTime()
                        if (close > now_time && open < now_time) {
                            return true
                        }
                    }
                    return false
                }

                const is_open = inOpenHours()


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
                    /**  @param {boolean} is_wait */
                    const wait = (_is_wait) => {
                        const is_wait = _is_wait ? true : false
                        e_button.disabled = is_wait
                        waitBar(is_wait)
                    }
                    wait(true)
                    useApi('change_hall_data', {
                        id: id,
                        type: 'going',
                        method: 'append'
                    }, (res_data) => {
                        wait(false)
                        if (!res_data) {
                            infoBar('预前往失败!')
                            return
                        }
                        updateTrip(true)
                        infoBar('已确定行程')
                        cookie.set('goto_hall', id)
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
                        // 创建引用
                        const {name: e_name, player: e_player, time_update: e_time_update, time_wait: e_time_wait, nickname: e_nickname, pos: e_pos, max: e_max, id: e_id, open_hours: e_open_hours, link: {map: e_link_map}} = elements
                        const {map_id} = hall

                        // >文字
                        e_name.innerText = name
                        e_player.innerText = player
                        e_time_update.innerText = time.update
                        // (i)预计需要排队计算
                        e_time_wait.innerText = time.wait
                        e_nickname.innerText = valid(nickname.toString(), '暂无别名')
                        e_pos.innerText = valid(pos, '未指定')
                        e_max.innerText = max_player
                        e_id.innerText = id
                        e_open_hours.innerText = open_hours_period

                        // >链接
                        if (map_id) {
                            e_link_map.href = setting.url.music_map(map_id)
                            e_link_map.classList.remove('ban')
                        } else {
                            e_link_map.classList.add('ban')
                        }
                    }
                }

                // window)当打开显示评论窗口时
                const showComment = (event) => {

                }

                // 当打开显示设置机厅窗口时
                const showSet = () => {
                    // 打开窗体时
                    callbacks.showSetHall = (input) => {
                        input.games.setValue(games)
                        input.nickname.setValue(nickname)
                        const {name, pos, player, open_hours: {open, close}, map_id} = doc.input.hall_set
                        name.value = hall.name
                        pos.value = hall.pos
                        player.value = hall.max_player
                        map_id.value = hall.map_id
                        
                        // 营业时间字段
                        if (hall.open_hours) {
                            console.log(hall.open_hours)
                            open.value = toDayTime(hall.open_hours.open)
                            close.value = toDayTime(hall.open_hours.close)
                        }
                    }

                    /* 在这里请求 */callbacks.submitSetHall = (input, wait) => {
                        // 提交更改时
                        wait(true)
                        const change_value = []
                        
                        // 获取改的字段内容
                        const values = getObjRepCont(hall, input)
                        Object.keys(values).forEach((type) => {
                            const value = values[type]
                            change_value.push({
                                type,
                                value,
                                method: 'change'
                            })
                        })
                        console.debug('change: ', change_value)

                        if (change_value.length <= 0) return wait(false) // 在没有更改值的情况下不进行请求
                        
                        useApi('change_hall_data', {
                            value: change_value,
                            id
                        }, (res_data, err) => {
                            wait(false)
                            if (err) {
                                console.error('req fail:', res_data.data)
                                return infoBar('更新时出现错误')
                            }
                            infoBar('修改成功')
                        })
                    }
                }

                // 当点击收藏机厅时
                /**
                 * @param {Element} element 
                 */
                const favHall = (_, element) => {
                    if (is_fav) {
                        element.classList.replace( 'icon-star_full','icon-star_empty')
                        element.classList.add('not')
                        cookie.delItem('fav', id)
                    } else {
                        element.classList.replace('icon-star_empty', 'icon-star_full')
                        element.classList.remove('not')
                        cookie.addItem('fav', id)
                    }
                    is_fav = !is_fav
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
                
                // ________________________
                //    ...      | >当前人数<
                //             |     x
                // ____________|___________
                const e_right_title = create('h3', {}, '当前人数')
                // ________________________
                //    ...      |  当前人数 
                //             |    >x<
                // ____________|___________
                const e_right_number = create('h2', {
                    // class: `hall-number ${setColor(player)}`,
                    class: `hall-number`,
                    style: `--percent: ${(player / max_player) * 100}%;` // 机厅人数百分比
                }, player)
                                
                // 判断是否在营业范围
                if (is_open) {
                    // 营业中
                    e_right_number.classList.add(setColor(player))
                    e_right_number.innerText = player
                } else {
                    // 休息中
                    e_right_title.innerText = '正在休息'
                    e_right_number.classList.add('una')
                    e_right_number.innerText = '-'
                }

                const e_right = create('section', { class: 'right' })
                join(e_right, (join(
                    // 不在营业时间内将无法显示更改人数窗口
                    is_open ? create('label', { for: 'window-change-player' }, showPlayerNumber) : create('div'), {
                    title: e_right_title,
                    number: e_right_number
                }))
                )
                // ________________________
                //             |   ...
                //     >   <   |    
                // ____________|___________
                // DOM-create left
                const e_left = create('section', { class: 'left' })
                const e_more = create('h3', { class: 'more' })
                join(e_more, { // (TAG)机厅卡片控件
                    // 收藏
                    fav: create('button', {
                        type: 'button',
                        class: 'pseudo button fav ' + (is_fav ? 'icon-star_full' : 'icon-star_empty not'),
                        title: '收藏'
                    }, favHall),
                    // 评论
                    show_comment: create('label', { class: 'pseudo button icon-link none', for: 'window-player-comment' }, showComment, '评论'),
                    // 详情
                    show_detailed: create('label', { class: 'pseudo button icon-link', for: 'window-hall-detail' }, showDetail, '详情'),
                    // 设置
                    show_setting: create('label', { class: 'pseudo button icon-config', for: 'window-hall-set' }, showSet, '设置'),
                    // 去这里
                    go_it: is_open ? create('button', { type: 'button', class: 'pseudo button icon-go' }, goHall, '去这里') : void 0,
                })
                // 创建机厅名的对象引用, 以便更改样式
                const e_hall_name = create('h3', { class: 'name icon-go right-icon' })

                join(e_left, {
                    title: join(
                        e_hall_name,
                        create('span', { class: 'content hidden-scrollbar' }, name)
                    ),
                    // 机厅状态
                    state: join(
                        create('ul', { class: 'row state hidden-scrollbar' }), {
                        // tag: createLi('', { class: 'tag none' }),
                        // 别称
                        nickname: nickname.length > 0 ? createLi(
                            nickname.toString(), { class: 'nickname' }
                        ) : void 0,
                        // 预计等待
                        wait_time: is_open ? createLi(time.wait, { class: 'wait' }) : void 0,
                        // 游戏项目
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
                const e_root = doc.list.appendChild(
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
            const {filter, fav: fav_hall} = config
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

                const {show: {game: show_games, fav: show_fav, fields: show_fields}, order: {target}} = filter

                const id = +key
                const hall = org_halls[id]

                // 过滤条件 (是否包含指定游戏)
                if (!have(hall.games, show_games)) return

                // 过滤条件 (仅显示收藏)
                if (show_fav) {
                    if (!fav_hall.includes(`${id}`)) return
                }

                // 过滤条件 (显示字段)
                doc.list.dataset.show = show_fields.join(' ')

                // 排序条件
                sortingMethod()
            })
            // console.log(sorting.basis);
            console.debug('value of:', sorting.value)
            
            // 将排序后的数据格式化
            const output = sorting.getValues()
            output.forEach((item, index) => {
                const hall = item[1]
                hall.id = item[0]
                halls[index] = hall
            })
            // console.log(halls); 
            main(halls)
        }
        runFilter()
    })
}

_init()
refreshList(void 0, {'_init': true})
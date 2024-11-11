/**@typedef {import('../../../app/types').apiResBody} apiResBody */
/**@typedef {import('../../../app/types').apiReqBody} apiReqBody */


/**
 * 请求一个API
 * @param {string} target 请求目标
 * @param {apiReqBody} req_data 响应体
 * @param {function(apiResBody, err)} callback 当请求完成时会触发此函数, 并传入响应体
 */
const useApi = (target, req_data = {}, callback) => {
    req_data.target = target
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api', true)
    const req_body = JSON.stringify(req_data)

    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
        if (xhr.status === 200) {
            const res_data = JSON.parse(xhr.responseText)
            if (typeof (callback) === 'function') callback(res_data)
        } else {
            console.error('use api failed.')
        }
    }
    xhr.onerror = () => {
        console.error('Request', xhr.status)
        
        return typeof(callback) === 'function' ? callback({}, true) : undefined
    }


    xhr.send(req_body)
}

/**仅在此脚本之内使用的全局变量 */
const _this = {}



// DOM


/**
 * (DOM)(document.createElement)创建一个元素
 * @param {string} tag_name 传入标签名
 * @param {Object.<string, string>} tag_attrib 标签的属性
 * @param {string | number | function(MouseEvent)} cont_or_func 标签内容, 或点击事件的回调函数
 * @param {number | string} [bool_or_str] 指定为true将tag_content(时间戳)的值转换为可读的字符串样式; `cont_or_func`如果是function, 此值指定为字符串会将标签内容指定为此值
 */
const create = (tag_name, tag_attrib = {}, cont_or_func = '', bool_or_str = false) => {
    const element = document.createElement(tag_name)
    Object.keys(tag_attrib).forEach((name) => {
        const value = tag_attrib[name]
        element.setAttribute(name, value)
    })

    const setInnerHtml = value => element.innerHTML = value

    switch (typeof cont_or_func) {
        case 'string':
            setInnerHtml(cont_or_func)
            break
        case 'number':
            if (!bool_or_str) {
                setInnerHtml(cont_or_func)
                break
            }
            // setInnerHtml(App.toStrTime(cont_or_func))
            break
        case 'function':
            element.addEventListener('click', (event) => {
                cont_or_func(event)
            })
            if (typeof bool_or_str === 'string') {
                element.innerHTML = bool_or_str
            }
        default:
            break
    }
    return element
}


/**
 * (DOM)(Element.appendChild)组合元素
 * @param {Element} root_element 根(父)元素
 * @param {any} child_elements 子元素
 * 
 */
const join = (root_element, child_elements) => {
    if (!child_elements) return
    if (child_elements instanceof Element) {
        root_element.appendChild(child_elements)
        return root_element
    }
    if (Array.isArray(child_elements)) {
        child_elements.forEach((element) => {
            if (!(element instanceof Element)) return
            root_element.appendChild(element)
        })
        return root_element
    }

    child_elements = Object.values(child_elements)
    child_elements.forEach((element) => {
        if (!(element instanceof Element)) return
        root_element.appendChild(element)
    })
    return root_element
}

/**
 * getElementById
 * @param {string} id_name
 */
const getEBI = (id_name) => {
    const element = document.getElementById(id_name)
    if (!element) console.error('script get element fail! id name is ', id_name)
    return element
}

/** 
* (DOM)获取对象内所有ID对应在DOM内的元素
* @param {Object.<string, Object | string>} obj 需要获取元素的对象
* @returns {Object.<string, Object | Element>}
*/
const getElements = (obj) => {
    let new_obj = {}
    Object.keys(obj).forEach((key) => {
        const value = obj[key]
        if (!(typeof value === 'string')) {
            new_obj[key] = getElements(value)
        } else {
            new_obj[key] = getEBI(value)
        }
    })
    return new_obj
}

class InputList {
    /**
     * (DOM)绑定两个元素, 并创建一个输入添加或删除的列表
     * @param {Element} list_element 列表元素(通常是<ul>,<ol>等列表元素)
     * @param {HTMLInputElement} input_element 输入元素
     * @param {string[]} [values] 指定初始值
     */
    constructor(list_element, input_element, values) {
        /** 所有输入的值 @type {object.<string, Element>} */
        this._value = {}
        list_element.replaceChildren()

        this.list_element = list_element
        this.input_element = input_element

        if (values) this.setValue(values)


        // 添加
        input_element.addEventListener('blur', () => {
            const { value } = input_element
            input_element.value = ''
            if (!value) return // 如果用户没有输入内容将不会添加

            this.appendValue(value)
        })
    }

    /**
     * 向列表后添加一个元素
     * @param {string} value 
     */
    appendValue(value) {
        this._value[value] = this.list_element.appendChild(
            create('li', { class: 'item' }, (event) => {
                // (ADD)这里以后需要添加销毁DOM的操作, 而非使用CSS隐藏元素
                event.target.classList.add('not')
                delete this._value[value]
            }, value)
        )
    }

    /**
     * 设置输入值
     * @param {string[]} values 
     */
    setValue(values) {
        values.forEach((value) => {
            this.appendValue(value)
        })
    }

    /**重置输入元素 */
    reset() {
        this._value = {}
        this.list_element.replaceChildren()
        
    }

    /**输入列表 */
    get value() {
        return Object.keys(this._value)
    }
}


/**
 * 冒出一个消息提示
 * @param {string} message 弹出消息内容
 * @param {object} setting 样式设置
 * @param {number} setting.show_time 样式设置
 */
const infoBar = (message = '', setting = {
    'show_time': 2000
}) => {
    // #(FIX)这里需要一个全局变量来拿取固定数据
    const info_bar = getEBI('info-bar')
    const { show_time } = setting
    const { timeout_info_bar } = _this
    if (timeout_info_bar) clearTimeout(timeout_info_bar)
    
    info_bar.querySelector('.content').innerText = message
    info_bar.classList.add('show')
    _this.timeout_info_bar = setTimeout(() => {
        info_bar.classList.remove('show')
    }, show_time)
}


// tool & dev


/**
 * 获取时间的可读字符串样式
 * @param {number} [time] 若不指定将会使用默认系统时间
 * @returns {string}
 */
const getTime = (time) => {
    const _toNowTime = (time) => {
        const date = new Date(time)
        const padZero = (num) => String(num).padStart(2, '0')
        return `${date.getFullYear()}年${padZero(date.getMonth() + 1)}月${padZero(date.getDate())}日 ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`
    }
    const _toTime = (time) => {

        // (i)注意: 以下代码由AI代写
        let days = Math.floor(time / 86400) // 计算天数
        let hours = Math.floor((time % 86400) / 3600) // 计算小时
        let minutes = Math.floor((time % 3600) / 60) // 计算分钟
        let seconds = time % 60 // 计算秒

        let time_description = []

        if (days > 0) {
            time_description.push(`${days}天`)
        }
        if (hours > 0) {
            time_description.push(`${hours}小时`)
        }
        if (minutes > 0) {
            time_description.push(`${minutes}分钟`)
        }
        if (seconds > 0) {
            time_description.push(`${seconds}秒`)
        }
        return valid(time_description.join(''), '刚刚')
    }
    if (time > 100000000000) return _toNowTime(time)
    if (!time) return _toNowTime(new Date().getTime())

    return _toTime(Math.round(time / 1000))

}

/**
 * 获取一个时间戳是现在的多少时间前(可读字符串样式)
 * @param {number} time 过去的某个时间戳
 */
const getChangeTime = (time) => {
    return getTime(new Date().getTime() - time)
}


/**
 * 确保一个值有效
 * @param {any} value 指定需要检查的值
 * @param {any} normal 该值无效时指定的默认值
 */
const valid = (value, normal) => {
    if (Array.isArray(value)) return value.length > 0 ? value : normal
    return value ? value : normal
}


/**用于DEBUG时检查某个传单值 */
const print = (any) => {
    console.log(any)
    return any
}


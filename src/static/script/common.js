/**@typedef {import('../../../app/types').apiResBody} apiResBody */
/**@typedef {import('../../../app/types').apiReqBody} apiReqBody */


/**
 * 请求一个API
 * @param {string} target 请求目标
 * @param {apiReqBody} req_data 响应体
 * @param {function(apiResBody)} callback 当请求完成时会触发此函数, 并传入响应体
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


    xhr.send(req_body)
}



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
            setInnerHtml(App.toStrTime(cont_or_func))
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
        return root_element.appendChild(child_elements)
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

/**
 * 获取时间的可读字符串样式
 * @param {number} [time] 若不指定将会使用默认系统时间
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
        return time_description.join('')
    }
    if (time > 100000000000) return _toNowTime(time)
    if (!time) return _toNowTime(new Date().getTime())

    return _toTime(Math.round(time / 1000))

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

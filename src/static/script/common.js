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
const createElement = (tag_name, tag_attrib = {}, cont_or_func = '', bool_or_str = false) => {
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
const joinElement = (root_element, child_elements) => {
    if (child_elements instanceof Element) {
        return root_element.appendChild(child_elements)
    }
    child_elements = Object.values(child_elements)
    child_elements.forEach((element) => {
        if (!(element instanceof Element)) return
        root_element.appendChild(element)
    })
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
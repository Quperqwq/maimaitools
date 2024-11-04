/**@typedef {import('../../../ts/types').apiResBody} apiResBody */
/**@typedef {import('../../../ts/types').apiReqBody} apiReqBody */

/**
 * 请求一个API
 * @param {apiReqBody} req_data 响应体
 * @param {function(apiResBody)} callback 当请求完成时会触发此函数, 并传入响应体
 */
const useApi = (req_data, callback) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api', true)
    const req_body = JSON.stringify(req_data)

    xhr.setRequestHeader('Content-Type', 'application/json')
    xhr.onload = () => {
        if (xhr.status === 200) {
            const res_data = JSON.parse(xhr.responseText)
            if (typeof(callback) === 'function') callback(res_data)
        } else {
            console.error('use api failed.')
        }
    }
    

    xhr.send(req_body)
}
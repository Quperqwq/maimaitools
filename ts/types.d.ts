// 请求和响应体

/**api请求体的标准样式 */
export interface apiReqBody {
    /**请求内容 */
    [key: string]: Object | string
    /**请求目标 */
    'target': string
}

/**api响应体的标准样式 */
export interface apiResBody {
    /**请求内容有效 */
    valid: boolean
    /**错误信息 */
    message: '' | string
    /**响应数据 */
    data: object | void
}
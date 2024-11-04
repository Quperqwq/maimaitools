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


/**游戏厅 */
export interface GameHallMain {
    /**所有游戏厅数据 */
    [id: number]: GameHallItem
    /**上一个游戏厅ID */
    last_number: number
}

/**单个游戏厅 */
export interface GameHallItem {
    /**游戏厅名 */
    name: string
    /**游戏厅含有的游戏 */
    games: string[]
    /**游戏厅位置 */
    pos: string | void
    /**玩家上限 */
    max_player: number | void
    /**玩家评论 */
    comments: {
        [uid: number]: PlayerComments
    }
}

/**玩家评论 */
export interface PlayerComments {
    /**内容 */
    content: string
    /**时间 */
    time: number
    /**玩家ID */
    uid: number
    /**点赞人数 */
    likes: number
}
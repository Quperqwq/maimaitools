// 请求和响应体

/**api请求体的标准样式 */
export interface apiReqBody {
    /**请求内容 */
    [key: string]: any
    /**请求目标 */
    'target': string,
    
}

// interface apiResBodyHall extends apiResBody {
//     target: 'get_all_hall'

//     data: GameHallMain
// }

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
    halls: GameHalls
    /**上一个游戏厅ID */
    last_number: number
}

/**所有游戏厅数据 */
export interface GameHalls {
    [id: number]: GameHallItem
}

// TO app.mjs: ~(TAG)在这里创建新的机厅数据
/**单个游戏厅 */
export interface GameHallItem {
    /**游戏厅名 */
    name: string
    /**游戏厅ID */
    id: number | undefined
    /**游戏厅别名 */
    nickname: string[]
    /**游戏厅含有的游戏 */
    games: string[]
    /**音游地图对应的机厅ID */
    map_id: number
    /**游戏厅位置 */
    pos: string | void
    /**玩家上限 */
    max_player: number | void
    /**当前机厅人数 */
    player: number
    /**正在前往机厅的人数 */
    going: number
    /**对象操作时间 */
    time: {
        /**创建时间 */
        new: number
        /**更新玩家时间 */
        change_player: number
        /**更改时间 */
        change: number
    }
    /**玩家评论 */
    comments: {
        /**评论ID对应评论内容 */
        [comment_id: number]: PlayerComments
        /**上一个评论ID */
        last_id: number
    }
    /**营业时间 */
    open_hours: {
        /**开店时间 */
        open: number
        /**闭店时间 */
        close: number
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
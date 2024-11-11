import { hall } from './app.mjs'


// console.log(hall.new('二七万达大玩家', {'games': ['舞萌DX'], 'max_player': 50, 'pos': '郑州市二七万达大玩家'}))
// console.log(hall.change(10001, 'append', 'player', -10))
console.log(hall.change(10001, 'append', 'going'))
// console.log(hall.change(10001, 'append', 'nickname', '断触星球'))

console.log(hall._getHall(10001))

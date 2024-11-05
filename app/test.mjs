import { hall } from './app.mjs'


// hall.new('瀚海海尚爱玩星球', {'games': ['舞萌DX', '华卡'], 'max_player': 50, 'pos': '郑州市海尚爱玩星球'})
console.log(hall.change(10001, 'append', 'player', -50))
// console.log(hall.change(10001, 'append', 'nickname', '断触星球'))

console.log(hall.all_hall)

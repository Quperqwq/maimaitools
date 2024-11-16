
// banner image tab
const tab_item = document.querySelectorAll('input.tab-item')
let now_tab = 0

const switchItem = () => {
    now_tab++
    if (tab_item.length <= now_tab) now_tab = 0
    const element = tab_item[now_tab]
    element.checked = true
}

setInterval(switchItem, 4000)

// info window
const e_info = getEBI('window-info')
const e_dis_info = getEBI('window-info-dis')


const dis_info = cookie.get('dis_info')

e_dis_info.addEventListener('click', () => {
    cookie.set('dis_info', 'true')
    e_info.checked = false
})

if (!dis_info) e_info.checked = true
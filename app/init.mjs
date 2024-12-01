import fs from 'fs'
import path from 'path'

const filePath = (path_name) => {
    return path.join('./app', path_name)
}
const isFile = (file_name) => {
    let result = false
    try {
        return fs.statSync(file_name).isFile()
    } catch (error) { }
    return result
}


const file_init_config = filePath('__init_config.mjs')
const file_target_config = filePath('config.mjs')


if (!isFile(file_init_config)) throw new Error('init file not fond') // 初始化文件不存在
if (isFile(file_target_config)) {
    console.log('ok, file is exist.')
    process.exit(0)
} else {
    fs.copyFileSync(file_init_config, file_target_config)
    // const config_cont = fs.readFileSync(file_init_config, 'utf-8')
    // fs.writeFileSync(file_target_config, config_cont, {
    //     'encoding': 'utf-8',

    // })
    console.log('ok.')
}


export default {
    /**服务器监听的host(默认0.0.0.0监听本机所有的IPV4地址) */
    'server_host': '0.0.0.0',
    /**服务器监听的端口(在哪个端口上运行) */
    'server_port': 27000,
    /**数据存储目录(相对于本项目的根目录) */
    'data_path': './app/data',
    /**maimai-api的设置项 */
    'mai_api': {
        /**api的域名 */
        'hostname': 'maimai.lxns.net',
        /**api的端口(默认HTTP:80, HTTPS:443) */
        'port': 443,
        /**api密钥 */
        'token': null,
    }
}
const useApi = (req_data) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/api')
    xhr.send(JSON.stringify(req_data))
    xhr.onload(() => {
        console.log(xhr.response)
    })
}
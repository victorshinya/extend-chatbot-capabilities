const http = require('http')

function main(args) {
    return new Promise((resolve, reject) => {
        http.get(`http://viacep.com.br/ws/${args.cep}/json/`, (res) => {
            let rawData = ''
            res.on('data', (chunk) => {
                rawData += chunk
            })
            res.on('end', () => {
                const parsedData = JSON.parse(rawData)
                return resolve(parsedData)
            })
        }).on('error', (e) => {
            console.error(`Got error: ${e.message}`)
            return reject(e.message)
        })
    })
}

exports.main = main

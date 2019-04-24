require('dotenv').config()
const express = require('express')
const watson = require('watson-developer-cloud/assistant/v1')

const app = express()
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

const assistant = new watson({
    version: process.env.ASSISTANT_VERSION || '2019-02-28',
    iam_apikey: process.env.ASSISTANT_APIKEY || '',
    url: process.env.ASSISTANT_URL || 'https://gateway.watsonplatform.net/assistant/api'
})

app.post('/chatbot', (req, res) => {
    assistant.message({
        workspace_id: process.env.ASSISTANT_WORKSPACE_ID || '',
        input: req.body.input,
        context: req.body.context
    })
    .then(response => {
        if (response.context.cep) {
            return new Promise((resolve, reject) => {
                http.get(`http://viacep.com.br/ws/${response.context.cep}/json/`, (res) => {
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
            .then(result => {
                response.output.text = `Pedido realizado com sucesso. Resumo: Uma pizza de ${response.context.sabor} para o endereço ${result.logradouro}`
            })
        }
        res.json(response)
    })
    .catch(err => {
        console.error(err)
        res.json(err)
    })
})

const port = process.env.PORT || 3000,
    host = process.env.HOST || '0.0.0.0'

app.listen(port, host, () => {
    console.log(`App is up and running at ${port}`)
})

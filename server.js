const express = require('express')
const app = express()
const http = require('http')
const port = 3000
const server = http.createServer(app)
const controllers = require('./controllers')
const cors = require('cors');

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))

app.use('/api', controllers);

server.listen(port, () => {
    console.log(`Service listening on port ${port}`)
})
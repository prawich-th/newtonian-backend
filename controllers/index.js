const express = require('express')
const routers = express.Router()
const readerRoute = require("./reader")
const eicRoute = require("./eic")

routers.use('/reader', readerRoute)
routers.use('/eic', eicRoute)


module.exports = routers
const express = require('express')
const routers = express.Router()
const readerRoute = require("./reader")
const eicRoute = require("./eic")
const authRoute = require("./auth")


routers.use('/reader', readerRoute)
routers.use('/eic', eicRoute)
routers.use('/auth', authRoute)


module.exports = routers
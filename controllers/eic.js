const express = require("express")
const router = express.Router()
const RouteProtection = require("../helpers/RouteProtection")
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname)}
})

const upload = multer({ storage: storage })


/**
 * Endpoint /api/eics/upload-image
 * the fieldname of the file is "image"
 */
router.post('/upload-image', RouteProtection.verify, upload.single("image") ,async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ "message": "provide an image" })
        } else {
            res.status(200).json({ "path": req.file.path })
        }
    } catch (error) {
        res.status(500).json({error})
    }
    
    
}) 

module.exports = router
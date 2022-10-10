const express = require("express")
const router = express.Router()
const { Articles } = require("../models/db")

/**
 * Endpoint /api/reader/article/:articleId
 */

router.get("/article/:articleId", async (req, res) => {
    try {
        if (req.params.articleId.length != 24)
        {
            res.status(400).json({ msg: "please provide correct articleId in params"})
        } else {
            const article = await Articles.findById(req.params.articleId)
            res.status(200).json(article)
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({error})
    }
})

module.exports = router
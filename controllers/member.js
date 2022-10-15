const express = require("express")
const router = express.Router()
const { Members, Articles } = require("../models/db")

router.get("/members", async (req, res) => {
    try {
        let members = await Members.find()

        const membersData = []

        for (member of members) {
            membersData.push({ id: member._id, name: member.name, position: member.position, image: member.image})
        }

        res.status(200).json(membersData)
    } catch (error) {
        res.status(500).json({error})
        
    }
    
})

router.get("/:memberId", async (req, res) => {
    try {
        if (!req.params.memberId) {
            res.status(400).json({ "message": "provide a member id" })
        } else {
            let member = await Members.findById(req.params.memberId)

            let memberData = { id: member._id, name: member.name, position: member.position, image: member.image, signature: member.signature, articles: []}
            

            for (articleId of member.articles) {
                memberData.articles.push(await Articles.findById(articleId))
            }

            res.status(200).json(memberData)
            
        }
        
    } catch (error) {
        res.status(500).json({error})
        
    }    
    


})

module.exports = router
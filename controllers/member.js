const express = require("express");
const router = express.Router();
const { Members, Articles } = require("../models/db");

router.get("/members", async (req, res) => {
  try {
    let members = await Members.find({}, "-articles");

    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ error });
  }
});

router.get("/:memberId", async (req, res) => {
  try {
    if (!req.params.memberId) {
      res.status(400).json({ message: "provide a member id" });
    } else {
      let member = await Members.findById(req.params.memberId);

      const articlesByMember = await Articles.find({
        author: member._id,
        publish: true,
      }).populate("author", "_id name");

      let memberData = {
        _id: member._id,
        name: member.name,
        position: member.position,
        image: member.image,
        signature: member.signature,
        year: member.year,
        track: member.track,
        bio: member.bio,
        articles: articlesByMember,
      };

      res.status(200).json(memberData);
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const RouteProtection = require("../helpers/RouteProtection");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Articles, Members } = require("../models/db");
const { memoryStorage } = require("multer");
const sharp = require("sharp");

const upload = multer({ storage: memoryStorage() });
/**
 * Endpoint /api/eic/upload-image
 * the fieldname of the file is "image"
 */
router.post(
  "/upload-image",
  RouteProtection.verify,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        res.status(400).json({ message: "provide an image" });
      } else {
        const path = `/images${req.body.path}`;
        const filename =
          req.body.filename || req.file.originalname.split(".")[0];
        fs.mkdirSync(`.${path}`, { recursive: true });
        await sharp(req.file.buffer).webp().toFile(`.${path}/${filename}.webp`);
        res.status(200).json({ path: `${path}/${filename}.webp` });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error });
    }
  }
);

/**
 * Endpoint /api/eics/new-article
 *
 * req.body.author = {id: authorid, name: authorname}
 */
router.post("/new-article", RouteProtection.verify, async (req, res) => {
  try {
    const { title, text, image, categories, authorId } = req.body;

    console.log(req);
    if (!title || !text || !image || !categories)
      throw new Error("Missing required argument(s)");

    const author = await Members.findById(authorId, "_id");
    if (!author) throw new Error("Member not found");

    const article = new Articles({
      title,
      text,
      image,
      categories,
      date: new Date(),
      author: authorId,
    });

    const saved = await article.save();

    res.status(200).json({ msg: "success" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});
module.exports = router;

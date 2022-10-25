const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const { Articles, Issues } = require("../models/db");
const { mainId } = require("../models/mainArticle.json");

/**
 * Endpoint /api/reader/article/:articleId
 */

router.get("/article/:articleId", async (req, res) => {
  try {
    if (req.params.articleId.length != 24) {
      res
        .status(400)
        .json({ msg: "please provide correct articleId in params" });
    } else {
      const article = await Articles.findById(req.params.articleId);
      res.status(200).json(article);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

/**
 * Endpoint /api/reader/issue/GetIssues
 */
router.get("/issue/getIssues", async (req, res) => {
  try {
    var issues = await Issues.find({}, "no date cover");

    res.status(200).json(issues);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

/**
 * Endpoint /api/reader/issue/getIssue/:issueNo
 */
router.get("/issue/getIssue/:issueNo", async (req, res) => {
  try {
    if (!req.params.issueNo) {
      res.status(400).json({ message: "Please provide an issue number" });
    }
    const issue = await Issues.findOne({
      no: { $in: [parseInt(req.params.issueNo)] },
    });
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
    } else {
      res.status(200).json(issue);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

/**
 * Endpoint /api/reader/article/get-homepage-data
 */
router.get("/get-homepage-data", async (req, res) => {
  try {
    var articles = await Articles.find({}).limit(7).sort({date: -1});
    const mainArticleId = new ObjectId(mainId)

    for (let article of articles) {
        if (article._id.equals(mainArticleId)) {
            articles = articles.filter((item) => !item._id.equals(mainArticleId))
            break
        }
    }

    if (articles.length > 6) {
        articles.pop()
    }

    const homepage = {
        "main": await Articles.findById(mainId),
        "other": articles
    }
    res.status(200).json(homepage);

  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

/**
 * Endpoint /api/reader/article/all-articles
 */

router.get("/all-articles", async (req, res) => {
    try {
        const articles = await Articles.find({})

        console.log(articles)

        let allArticles =  {
            "Interview": [],
            "SchoolUpdate": [],
            "AdviceEssay": [],
            "Fiction": [],
            "PerformingArts": [],
            "VisualArts": [],
            "Review": [],
            "NBS": [],
            "Letter": []
        }

        for (let article of articles) {
            allArticles[article.categories].push(article)
        }

        res.status(200).json(allArticles);


        

    } catch (error) {
        console.log(error);
    res.status(500).json({ error });
    }
})

module.exports = router;

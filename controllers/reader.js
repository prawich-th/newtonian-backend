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
    console.info(
      "Answering the the query for article: " + req.params.articleId
    );
    if (req.params.articleId.length != 24) {
      res
        .status(400)
        .json({ msg: "please provide correct articleId in params" });
    } else {
      const article = await Articles.findById(req.params.articleId).populate(
        "author",
        "name _id"
      );

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
    let issue = await Issues.findOne({
      no: { $in: [parseInt(req.params.issueNo)] },
    });
    console.log(issue);
    const articleList = [];
    if (!issue) {
      res.status(404).json({ message: "Issue not found" });
    } else {
      for (const article of issue.articleIds) {
        const farticle = await Articles.findById(article, "-text").populate(
          "author",
          "_id name"
        );
        articleList.push(farticle);
      }
      res.status(200).json({
        no: issue.no,
        articles: articleList,
        letters: issue.letters,
      });
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
    var articles = await Articles.find()
      .limit(7)
      .sort({ date: -1 })
      .populate("author", "name _id");

    const mainArticleId = new ObjectId(mainId);

    for (let article of articles) {
      if (article._id.equals(mainArticleId)) {
        articles = articles.filter((item) => !item._id.equals(mainArticleId));
        break;
      }
    }

    if (articles.length > 6) {
      articles.pop();
    }

    const homepage = {
      main: await Articles.findById(mainId).populate("author", "name _id"),
      other: articles,
    };

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
    const articles = await Articles.find().populate("author", "_id name");

    console.log(articles);

    let allArticles = {
      Interview: [],
      SchoolUpdate: [],
      AdviceEssay: [],
      Fiction: [],
      PerformingArts: [],
      VisualArts: [],
      Review: [],
      NBS: [],
      Letter: [],
      Research: [],
    };

    for (let article of articles) {
      allArticles[article.categories].push(article);
    }

    res.status(200).json(allArticles);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error });
  }
});

module.exports = router;

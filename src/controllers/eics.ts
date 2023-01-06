import { RequestHandler } from "express";
import fs from "fs";
import { MongoAWSError } from "mongodb";
import sharp from "sharp";
import { fetchGoogleDocsFiles } from "../helpers/docs-md";
import newError from "../helpers/newError";
import { prisma } from "../models/db";
import { config } from "dotenv";
config();

import { S3 } from "aws-sdk";
console.log(process.env.AWS_ACCESS_ID, process.env.AWS_ACCESS_SECRET);

const s3 = new S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_ID!,
    secretAccessKey: process.env.AWS_ACCESS_SECRET!,
  },
});

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "provide an image" });
    } else {
      const path = `/images${req.body.path}`;
      const filename = req.body.filename || req.file.originalname.split(".")[0];
      fs.mkdirSync(`.${path}`, { recursive: true });
      await sharp(req.file.buffer).webp().toFile(`.${path}/${filename}`);

      res.status(201).json(`.${path}/${filename}`);
    }
  } catch (error) {
    console.log(error);
    // next(error);
  }
};

export const newIssue: RequestHandler = async (req, res, next) => {
  try {
    const issueNo = req.body.issueNo;

    const issue = await prisma.issues.create({
      data: { id: +issueNo, cover: `/cover/issue${issueNo}.webp` },
    });

    res.status(201).json({ message: "success", issue });
  } catch (error) {
    next(error);
  }
};

export const newArticle: RequestHandler = async (req, res, next) => {
  try {
    const { content, headline, issueNo, cover, writerId, category } = req.body;

    console.log(req.body);

    const created = await prisma.articles.create({
      data: {
        headline: headline,
        content: content,
        issue: { connect: { id: +issueNo } },
        member: { connect: [{ id: +writerId }] },
        cover: cover,
        category: category,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const publishIssue: RequestHandler = async (req, res, next) => {
  try {
    await prisma.articles.updateMany({
      where: { issuesId: +req.params.id },
      data: {
        published: true,
        publishingDate: new Date(),
      },
    });
    res.json("success");
  } catch (error) {
    next(error);
  }
};

export const fetchArticleFromGoogleDoc: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const id = req.params.id;

    const d = await fetchGoogleDocsFiles(id);

    res.json(d);
  } catch (error) {
    next(error);
  }
};

interface article {
  docId: string;
  headline: string;
  issueNo: number;
  cover: string;
  writerId: number;
  category: string;
}

export const importArticle: RequestHandler = async (req, res, next) => {
  try {
    const articles: article[] = req.body.articles;

    const result: string[] = [];

    for await (const article of articles) {
      try {
        const content = await fetchGoogleDocsFiles(article.docId);
        if (!content) throw newError(500, "Something went wrong");

        const row = await prisma.articles.create({
          data: {
            headline: article.headline,
            content: content,
            issue: { connect: { id: +article.issueNo } },
            member: { connect: { id: +article.writerId } },
            cover: article.cover,
            category: article.category,
          },
        });

        result.push(
          `Successfully imported the article  (${row.headline}) - id (${row.id})`
        );
      } catch (error) {
        result.push(
          `Failed to import the article (${article.headline}) - document id (${article.docId})`
        );
      }
    }

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const getArticles: RequestHandler = async (req, res, next) => {
  try {
    const articles = await prisma.articles.findMany({
      include: {
        member: {
          select: {
            name: true,
            nickname: true,
            id: true,
          },
        },
      },
    });

    return res.status(200).json(articles);
  } catch (error) {
    next(error);
  }
};

export const deleteArticle: RequestHandler = async (req, res, next) => {
  try {
    const articleId = +req.params.id;
    const result = await prisma.articles.delete({
      where: { id: articleId },
    });

    return res.status(200).json({ deleted: result });
  } catch (error) {
    next(error);
  }
};

export const publicationToggle: RequestHandler = async (req, res, next) => {
  try {
    const articleId = +req.params.id;
    const article = await prisma.articles.findFirst({
      where: {
        id: articleId,
      },
      select: {
        id: true,
        published: true,
      },
    });

    if (!article) throw newError(404, `Article (id ${articleId}) Not Found`);

    const result = await prisma.articles.update({
      where: {
        id: article.id,
      },
      data: {
        published: !article.published,
      },
    });

    return res.status(200).json({ result: result });
  } catch (error) {
    next(error);
  }
};

export const getMembers: RequestHandler = async (req, res, next) => {
  try {
    const statusFilter = (req.query.sfilter as string) ?? undefined;

    const members = await prisma.members.findMany({
      where: {
        status: statusFilter,
      },
    });

    return res.status(200).json({ members: members });
  } catch (error) {
    next(error);
  }
};

export const patchMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = req.params.id;

    const result = await prisma.members.update({
      where: {
        id: +memberId,
      },
      data: req.body,
    });

    res.json({ result });
  } catch (error) {
    next(error);
  }
};

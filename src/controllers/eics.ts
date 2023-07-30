import { RequestHandler } from "express";
import fs from "fs";
import sharp from "sharp";
import { fetchGoogleDocsFiles } from "../helpers/docs-md";
import newError from "../helpers/newError";
import { prisma } from "../models/db";
import { config } from "dotenv";
config();

// - Connect to S3 Storage Bucket

// import { S3 } from "aws-sdk";
// console.log(process.env.AWS_ACCESS_ID, process.env.AWS_ACCESS_SECRET);

// const s3 = new S3({
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_ID!,
//     secretAccessKey: process.env.AWS_ACCESS_SECRET!,
//   },
// });

export const uploadImage: RequestHandler = async (req, res, next) => {
  try {
    console.log(req.body, req.file);
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
    const { content, headline, issueNo, cover, writerId, category, docId } =
      req.body;

    console.log(req.body);

    const created = await prisma.articles.create({
      data: {
        headline: headline,
        content: content,
        issue: { connect: { id: +issueNo } },
        member: { connect: [{ id: +writerId }] },
        cover: cover,
        category: category,
        docId: docId,
      },
    });

    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const IssuePublicationToggle: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const issueId = +req.params.id;
    if (!issueId) throw newError(400, "Issue Id not provided");
    const dbIssue = await prisma.issues.findFirst({
      where: {
        id: issueId,
      },
      select: {
        id: true,
        published: true,
      },
    });
    if (!dbIssue) throw newError(404, "Issue Id provided not found in db");
    const now = new Date();
    await prisma.issues.update({
      where: {
        id: issueId,
      },
      data: {
        published: !dbIssue.published,
        publishingDate: now,
      },
    });
    await prisma.articles.updateMany({
      where: { issuesId: issueId },
      data: {
        published: !dbIssue.published,
        publishingDate: now,
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
            member: { connect: [{ id: +article.writerId }] },
            cover: article.cover,
            category: article.category,
            docId: article.docId,
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
    if (req.user.permission < 3)
      throw newError(403, "Forbidden, Insufficient Permission");

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

const PATCHMEMBER_PERMISSION_LVL3UP_KEYS = ["permission"];
const PATCHMEMBER_PERMISSION_LVL4UP_KEYS = ["password", "memberSince", "id"];
export const patchMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = req.params.id;

    console.log(req.user.name, req.user.permission);
    if (req.user.permission < 2)
      throw newError(
        403,
        "Forbidden, Insufficient permission to access this api"
      );

    const editedProperties = Object.keys(req.body);

    if (
      PATCHMEMBER_PERMISSION_LVL3UP_KEYS.some((cur) =>
        editedProperties.includes(cur)
      ) &&
      req.user.permission < 3
    )
      throw newError(
        403,
        "Forbidden, Insufficient permission to edited some field"
      );

    if (
      PATCHMEMBER_PERMISSION_LVL4UP_KEYS.some((cur) =>
        editedProperties.includes(cur)
      ) &&
      req.user.permission < 4
    )
      throw newError(
        403,
        "Forbidden, Insufficient permission to edited some field"
      );

    if (
      editedProperties.includes("status") &&
      !["CONS", "ACTI", "ANON", "LEAV", "GRAD"].some(
        (cur) => req.body.status === cur
      )
    )
      throw newError(400, "Status code not existed");

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

export const getAllIssues: RequestHandler = async (req, res, next) => {
  try {
    const page = req.query.page ?? 0;
    const perPage = req.query.perPage ?? 10;

    const issues = await prisma.issues.findMany({
      skip: +perPage * +page,
      take: +perPage,
      include: {
        articles: {
          select: {
            id: true,
            headline: true,
            member: {
              select: {
                id: true,
                name: true,
                nickname: true,
              },
            },
            views: true,
            cover: true,
          },
        },
      },
    });

    res.json(issues);
  } catch (error) {
    next(error);
  }
};

export const newMember: RequestHandler = async (req, res, next) => {
  try {
    const name: string = req.body.name;
    const nickname: string = req.body.nickname;
    const year: number = +req.body.year;
    const track: string = req.body.track;
    const role: string = req.body.role;
    const bio: string = req.body.bio;

    if (!name || !nickname || !year || !track || !role || !bio)
      throw newError(400, "Bad Request");

    const newMember = await prisma.members.create({
      data: {
        name,
        nickname,
        year,
        track,
        role,
        profile: `/members/${name.split(" ").join("")}/image.webp`,
        signature: `/members/${name.split(" ").join("")}/signature.webp`,
        bio,
      },
    });

    return res.status(201).json(newMember);
  } catch (error) {
    next(error);
  }
};

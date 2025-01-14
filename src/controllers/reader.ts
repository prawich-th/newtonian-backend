import { RequestHandler } from "express";
import newError from "../helpers/newError";
import { prisma } from "../models/db";
import RouteProtection from "../helpers/RouteProtection";

export const getArticle: RequestHandler = async (req, res, next) => {
  try {
    const articleId = req.params.id;

    if (!articleId) throw new Error("Article Id Not Found");

    const article = await prisma.articles.findFirstOrThrow({
      where: { id: +articleId },
      include: { member: { select: { name: true, id: true, nickname: true } } },
    });

    if (!article) throw newError(404, "Article Not Found");

    if (article.published === false) {
      const token = req.headers["authorization"] || null;
      if (!token)
        throw newError(
          401,
          "Unauthorized, Article is not published. Authorisation required"
        );
      try {
        const user = await RouteProtection.getUserFromToken(token);

        if (user.permission > 2) {
          return res.json(article);
        } else {
          throw newError(403, "Forbidden");
        }
      } catch (error) {
        throw newError(403, "Forbidden");
      }
    }

    await prisma.articles.update({
      where: { id: +articleId },
      data: {
        views: { increment: 1 },
      },
    });

    res.json(article);

    // get article
  } catch (error) {
    next(error);
  }
};

export const getAllIssues: RequestHandler = async (req, res, next) => {
  try {
    // fetch all issues
    const issues = await prisma.issues.findMany({
      where: { published: true },
    });

    res.json(issues);
  } catch (error) {
    next(error);
  }
};

export const getIssue: RequestHandler = async (req, res, next) => {
  try {
    const issueId = req.params.id;

    const issue = await prisma.issues.findFirstOrThrow({
      where: { id: +issueId, published: true },
      include: {
        articles: {
          select: {
            id: true,
            headline: true,
            member: { select: { name: true, id: true } },
          },
        },
        letter: {
          include: {
            letterSigner: {
              include: {
                members: {
                  select: {
                    signature: true,
                    name: true,
                    nickname: true,
                    role: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.json(issue);

    // fetch single issue
  } catch (error) {
    next(error);
  }
};

export const getHomePageData: RequestHandler = async (req, res, next) => {
  try {
    // get homepage data
    const amount = req.query.amount ?? 8;

    const thisIssue = await prisma.issues.findFirst({
      where: { published: true },
      orderBy: {
        id: "desc",
      },
      include: {
        main: {
          include: {
            member: {
              select: {
                name: true,
                id: true,
                nickname: true,
              },
            },
          },
        },
      },
    });

    if (!thisIssue || !thisIssue.main) throw new Error("Something went wrong");

    const articles = await prisma.articles.findMany({
      where: { published: true, id: { not: thisIssue.main.id } },
      include: {
        member: {
          select: {
            name: true,
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        publishingDate: "desc",
      },
      take: +amount,
    });

    res.json({ main: thisIssue.main, articles: articles });
  } catch (error) {
    next(error);
  }
};

export const getAllArticle: RequestHandler = async (req, res, next) => {
  try {
    // get articles

    const articles = await prisma.articles.findMany({
      where: { published: true },
      include: {
        member: { select: { name: true, nickname: true, id: true } },
      },
    });

    res.json(articles);
  } catch (error) {
    next(error);
  }
};

export const viewPdf: RequestHandler = async (req, res, next) => {
  try {
    const issueNo = +req.params.issueNo;
    if (!issueNo) throw newError(400, "");

    const updated = await prisma.issues.update({
      where: { id: issueNo },
      data: {
        pdfViewCount: { increment: 1 },
      },
    });

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const redirectLatestIssue: RequestHandler = async (req, res, next) => {
  try {
    const issue = await prisma.issues.findFirst({
      select: { id: true },
      orderBy: { id: "desc" },
    });
    console.log(issue);

    res.redirect(`https://news.newton.ac.th/issues/${issue?.id ?? 1}`);
  } catch (error) {
    next(error);
  }
};

// just to redirect the musical's ticket buyer to the right website. (temp)
export const redirectMusical: RequestHandler = async (req, res, next) => {
  try {
    return res.redirect(`https://ticket.newton.ac.th`);
  } catch (error) {
    next(error);
  }
};

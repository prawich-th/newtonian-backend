"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.redirectMusical = exports.redirectLatestIssue = exports.viewPdf = exports.getAllArticle = exports.getHomePageData = exports.getIssue = exports.getAllIssues = exports.getArticle = void 0;
const newError_1 = __importDefault(require("../helpers/newError"));
const db_1 = require("../models/db");
const getArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = req.params.id;
        if (!articleId)
            throw new Error("Article Id Not Found");
        const article = yield db_1.prisma.articles.findFirstOrThrow({
            where: { id: +articleId, published: true },
            include: { member: { select: { name: true, id: true, nickname: true } } },
        });
        yield db_1.prisma.articles.update({
            where: { id: +articleId },
            data: {
                views: { increment: 1 },
            },
        });
        res.json(article);
        // get article
    }
    catch (error) {
        next(error);
    }
});
exports.getArticle = getArticle;
const getAllIssues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // fetch all issues
        const issues = yield db_1.prisma.issues.findMany({
            where: { published: true },
        });
        res.json(issues);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllIssues = getAllIssues;
const getIssue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issueId = req.params.id;
        const issue = yield db_1.prisma.issues.findFirst({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getIssue = getIssue;
const getHomePageData = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // get homepage data
        const amount = (_a = req.query.amount) !== null && _a !== void 0 ? _a : 8;
        const thisIssue = yield db_1.prisma.issues.findFirst({
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
        if (!thisIssue || !thisIssue.main)
            throw new Error("Something went wrong");
        const articles = yield db_1.prisma.articles.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getHomePageData = getHomePageData;
const getAllArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // get articles
        const articles = yield db_1.prisma.articles.findMany({
            where: { published: true },
            include: {
                member: { select: { name: true, nickname: true, id: true } },
            },
        });
        res.json(articles);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllArticle = getAllArticle;
const viewPdf = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issueNo = +req.params.issueNo;
        if (!issueNo)
            throw (0, newError_1.default)(400, "");
        const updated = yield db_1.prisma.issues.update({
            where: { id: issueNo },
            data: {
                pdfViewCount: { increment: 1 },
            },
        });
        res.status(200).json(updated);
    }
    catch (error) {
        next(error);
    }
});
exports.viewPdf = viewPdf;
const redirectLatestIssue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const issue = yield db_1.prisma.issues.findFirst({
            select: { id: true },
            orderBy: { id: "desc" },
        });
        console.log(issue);
        res.redirect(`https://news.newton.ac.th/issues/${(_b = issue === null || issue === void 0 ? void 0 : issue.id) !== null && _b !== void 0 ? _b : 1}`);
    }
    catch (error) {
        next(error);
    }
});
exports.redirectLatestIssue = redirectLatestIssue;
// just to redirect the musical's ticket buyer to the right website. (temp)
const redirectMusical = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.redirect(`https://ticket.newton.ac.th`);
    }
    catch (error) {
        next(error);
    }
});
exports.redirectMusical = redirectMusical;

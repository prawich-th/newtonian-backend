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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchMember = exports.getMembers = exports.publicationToggle = exports.deleteArticle = exports.getArticles = exports.importArticle = exports.fetchArticleFromGoogleDoc = exports.publishIssue = exports.newArticle = exports.newIssue = exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const docs_md_1 = require("../helpers/docs-md");
const newError_1 = __importDefault(require("../helpers/newError"));
const db_1 = require("../models/db");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
// - Connect to S3 Storage Bucket
// import { S3 } from "aws-sdk";
// console.log(process.env.AWS_ACCESS_ID, process.env.AWS_ACCESS_SECRET);
// const s3 = new S3({
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_ID!,
//     secretAccessKey: process.env.AWS_ACCESS_SECRET!,
//   },
// });
const uploadImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            res.status(400).json({ message: "provide an image" });
        }
        else {
            const path = `/images${req.body.path}`;
            const filename = req.body.filename || req.file.originalname.split(".")[0];
            fs_1.default.mkdirSync(`.${path}`, { recursive: true });
            yield (0, sharp_1.default)(req.file.buffer).webp().toFile(`.${path}/${filename}`);
            res.status(201).json(`.${path}/${filename}`);
        }
    }
    catch (error) {
        console.log(error);
        // next(error);
    }
});
exports.uploadImage = uploadImage;
const newIssue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issueNo = req.body.issueNo;
        const issue = yield db_1.prisma.issues.create({
            data: { id: +issueNo, cover: `/cover/issue${issueNo}.webp` },
        });
        res.status(201).json({ message: "success", issue });
    }
    catch (error) {
        next(error);
    }
});
exports.newIssue = newIssue;
const newArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content, headline, issueNo, cover, writerId, category, docId } = req.body;
        console.log(req.body);
        const created = yield db_1.prisma.articles.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.newArticle = newArticle;
const publishIssue = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.prisma.articles.updateMany({
            where: { issuesId: +req.params.id },
            data: {
                published: true,
                publishingDate: new Date(),
            },
        });
        res.json("success");
    }
    catch (error) {
        next(error);
    }
});
exports.publishIssue = publishIssue;
const fetchArticleFromGoogleDoc = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const d = yield (0, docs_md_1.fetchGoogleDocsFiles)(id);
        res.json(d);
    }
    catch (error) {
        next(error);
    }
});
exports.fetchArticleFromGoogleDoc = fetchArticleFromGoogleDoc;
const importArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var e_1, _a;
    try {
        const articles = req.body.articles;
        const result = [];
        try {
            for (var articles_1 = __asyncValues(articles), articles_1_1; articles_1_1 = yield articles_1.next(), !articles_1_1.done;) {
                const article = articles_1_1.value;
                try {
                    const content = yield (0, docs_md_1.fetchGoogleDocsFiles)(article.docId);
                    if (!content)
                        throw (0, newError_1.default)(500, "Something went wrong");
                    const row = yield db_1.prisma.articles.create({
                        data: {
                            headline: article.headline,
                            content: content,
                            issue: { connect: { id: +article.issueNo } },
                            member: { connect: [{ id: +article.writerId }] },
                            cover: article.cover,
                            category: article.category,
                        },
                    });
                    result.push(`Successfully imported the article  (${row.headline}) - id (${row.id})`);
                }
                catch (error) {
                    result.push(`Failed to import the article (${article.headline}) - document id (${article.docId})`);
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (articles_1_1 && !articles_1_1.done && (_a = articles_1.return)) yield _a.call(articles_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        res.status(201).json(result);
    }
    catch (error) {
        console.log(error);
        next(error);
    }
});
exports.importArticle = importArticle;
const getArticles = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articles = yield db_1.prisma.articles.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getArticles = getArticles;
const deleteArticle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = +req.params.id;
        const result = yield db_1.prisma.articles.delete({
            where: { id: articleId },
        });
        return res.status(200).json({ deleted: result });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteArticle = deleteArticle;
const publicationToggle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const articleId = +req.params.id;
        const article = yield db_1.prisma.articles.findFirst({
            where: {
                id: articleId,
            },
            select: {
                id: true,
                published: true,
            },
        });
        if (!article)
            throw (0, newError_1.default)(404, `Article (id ${articleId}) Not Found`);
        const result = yield db_1.prisma.articles.update({
            where: {
                id: article.id,
            },
            data: {
                published: !article.published,
            },
        });
        return res.status(200).json({ result: result });
    }
    catch (error) {
        next(error);
    }
});
exports.publicationToggle = publicationToggle;
const getMembers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const statusFilter = (_b = req.query.sfilter) !== null && _b !== void 0 ? _b : undefined;
        const members = yield db_1.prisma.members.findMany({
            where: {
                status: statusFilter,
            },
        });
        return res.status(200).json({ members: members });
    }
    catch (error) {
        next(error);
    }
});
exports.getMembers = getMembers;
const patchMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = req.params.id;
        const result = yield db_1.prisma.members.update({
            where: {
                id: +memberId,
            },
            data: req.body,
        });
        res.json({ result });
    }
    catch (error) {
        next(error);
    }
});
exports.patchMember = patchMember;

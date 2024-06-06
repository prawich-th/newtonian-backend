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
exports.resetViews = exports.newMember = exports.getAllIssues = exports.patchMember = exports.getMembers = exports.publicationToggle = exports.deleteArticle = exports.getArticles = exports.importArticle = exports.fetchArticleFromGoogleDoc = exports.IssuePublicationToggle = exports.newArticle = exports.newIssue = exports.uploadImage = void 0;
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const docs_md_1 = require("../helpers/docs-md");
const newError_1 = __importDefault(require("../helpers/newError"));
const db_1 = require("../models/db");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const uploadImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body, req.file);
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
const IssuePublicationToggle = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const issueId = +req.params.id;
        if (!issueId)
            throw (0, newError_1.default)(400, "Issue Id not provided");
        const dbIssue = yield db_1.prisma.issues.findFirst({
            where: {
                id: issueId,
            },
            select: {
                id: true,
                published: true,
            },
        });
        if (!dbIssue)
            throw (0, newError_1.default)(404, "Issue Id provided not found in db");
        const now = new Date();
        yield db_1.prisma.issues.update({
            where: {
                id: issueId,
            },
            data: {
                published: !dbIssue.published,
                publishingDate: now,
            },
        });
        yield db_1.prisma.articles.updateMany({
            where: { issuesId: issueId },
            data: {
                published: !dbIssue.published,
                publishingDate: now,
            },
        });
        res.json("success");
    }
    catch (error) {
        next(error);
    }
});
exports.IssuePublicationToggle = IssuePublicationToggle;
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
    try {
        const article = req.body.article;
        console.log(article);
        const content = yield (0, docs_md_1.fetchGoogleDocsFiles)(article.docId);
        if (!content)
            throw (0, newError_1.default)(500, "Something went wrong");
        res.status(201).json(content);
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
        if (!req.user)
            throw (0, newError_1.default)(401, "Unauthorized");
        if (req.user.permission < 3)
            throw (0, newError_1.default)(403, "Forbidden, Insufficient Permission");
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
    var _a;
    try {
        const statusFilter = (_a = req.query.sfilter) !== null && _a !== void 0 ? _a : undefined;
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
const PATCHMEMBER_PERMISSION_LVL3UP_KEYS = ["permission"];
const PATCHMEMBER_PERMISSION_LVL4UP_KEYS = ["password", "memberSince", "id"];
const patchMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const memberId = req.params.id;
        if (!req.user)
            throw (0, newError_1.default)(401, "Unauthorized");
        console.log(req.user.name, req.user.permission);
        if (req.user.permission < 2)
            throw (0, newError_1.default)(403, "Forbidden, Insufficient permission to access this api");
        const editedProperties = Object.keys(req.body);
        if (PATCHMEMBER_PERMISSION_LVL3UP_KEYS.some((cur) => editedProperties.includes(cur)) &&
            req.user.permission < 3)
            throw (0, newError_1.default)(403, "Forbidden, Insufficient permission to edited some field");
        if (PATCHMEMBER_PERMISSION_LVL4UP_KEYS.some((cur) => editedProperties.includes(cur)) &&
            req.user.permission < 4)
            throw (0, newError_1.default)(403, "Forbidden, Insufficient permission to edited some field");
        if (editedProperties.includes("status") &&
            !["CONS", "ACTI", "ANON", "LEAV", "GRAD"].some((cur) => req.body.status === cur))
            throw (0, newError_1.default)(400, "Status code not existed");
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
const getAllIssues = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    try {
        const page = (_b = req.query.page) !== null && _b !== void 0 ? _b : 0;
        const perPage = (_c = req.query.perPage) !== null && _c !== void 0 ? _c : 10;
        const issues = yield db_1.prisma.issues.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
exports.getAllIssues = getAllIssues;
const newMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.name;
        const nickname = req.body.nickname;
        const year = +req.body.year;
        const track = req.body.track;
        const role = req.body.role;
        const bio = req.body.bio;
        if (!name || !nickname || !year || !track || !role || !bio)
            throw (0, newError_1.default)(400, "Bad Request");
        const newMember = yield db_1.prisma.members.create({
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
    }
    catch (error) {
        next(error);
    }
});
exports.newMember = newMember;
const resetViews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user)
            throw (0, newError_1.default)(401, "Unauthorized");
        if (req.user.permission < 3)
            throw (0, newError_1.default)(403, "Forbidden, Insufficient Permission");
        const articleId = +req.params.id;
        const result = yield db_1.prisma.articles.update({
            where: { id: articleId },
            data: { views: 0 },
        });
        return res.status(200).json({ result });
    }
    catch (error) {
        next(error);
    }
});
exports.resetViews = resetViews;

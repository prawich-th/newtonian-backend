"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../controllers/auth");
const eics_1 = require("../controllers/eics");
const member_1 = require("../controllers/member");
const reader_1 = require("../controllers/reader");
const RouteProtection_1 = __importDefault(require("../helpers/RouteProtection"));
const router = (0, express_1.Router)();
// auth
router.post("/auth/signin", auth_1.signin);
router.get("/auth/getUser", RouteProtection_1.default.verify, auth_1.getUser);
// eics
router.post("/eics/upload-img", RouteProtection_1.default.verify, eics_1.uploadImage);
router.post("/eics/new-articles", RouteProtection_1.default.verify, eics_1.newArticle);
router.patch("/eics/publish/:id", RouteProtection_1.default.verify, eics_1.publishIssue);
router.post("/eics/new-issue", RouteProtection_1.default.verify, eics_1.newIssue);
router.get("/eics/fetch-article/:id", RouteProtection_1.default.verify, eics_1.fetchArticleFromGoogleDoc);
router.post("/eics/import-article", RouteProtection_1.default.verify, eics_1.importArticle);
router.delete("/eics/delete-article/:id", RouteProtection_1.default.verify, eics_1.deleteArticle);
router.patch("/eics/toggle-publication/:id", RouteProtection_1.default.verify, eics_1.publicationToggle);
router.get("/eics/get-members", RouteProtection_1.default.verify, eics_1.getMembers);
router.get("/eics/get-articles", RouteProtection_1.default.verify, eics_1.getArticles);
router.patch("/eics/patch-member/:id", RouteProtection_1.default.verify, eics_1.patchMember);
// member
router.get("/member", member_1.getAllMembers);
router.get("/member/:id", member_1.getMember);
// reader
router.get("/reader/article/:id", reader_1.getArticle);
router.get("/reader/article", reader_1.getAllArticle);
router.get("/reader/issue", reader_1.getAllIssues);
router.get("/reader/issue/:id", reader_1.getIssue);
router.get("/reader/homepage", reader_1.getHomePageData);
exports.default = router;

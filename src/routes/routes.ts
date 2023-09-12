import { Router } from "express";
import { ChangePassword, getUser, signin } from "../controllers/auth";
import {
  deleteArticle,
  fetchArticleFromGoogleDoc,
  getArticles,
  getMembers,
  importArticle,
  newArticle,
  newIssue,
  patchMember,
  publicationToggle,
  uploadImage,
  getAllIssues as eicsAllIssues,
  IssuePublicationToggle,
  newMember,
} from "../controllers/eics";
import { getAllMembers, getMember } from "../controllers/member";
import {
  getAllArticle,
  getAllIssues,
  getArticle,
  getHomePageData,
  getIssue,
  redirectLatestIssue,
  redirectMusical,
  viewPdf,
} from "../controllers/reader";
import RouteProtection from "../helpers/RouteProtection";

const router = Router();

// auth
router.post("/auth/signin", signin);
router.get("/auth/getUser", RouteProtection.verify, getUser);
router.patch(
  "/auth/change-password/:id",
  RouteProtection.verify,
  ChangePassword
);

// eics
router.post("/eics/upload-img", RouteProtection.verify, uploadImage);
router.post("/eics/new-article", RouteProtection.verify, newArticle);
router.patch(
  "/eics/toggle-issue/:id",
  RouteProtection.verify,
  IssuePublicationToggle
);
router.post("/eics/new-issue", RouteProtection.verify, newIssue);
router.get(
  "/eics/fetch-article/:id",
  RouteProtection.verify,
  fetchArticleFromGoogleDoc
);
router.post("/eics/import-article", RouteProtection.verify, importArticle);
router.delete(
  "/eics/delete-article/:id",
  RouteProtection.verify,
  deleteArticle
);
router.patch(
  "/eics/toggle-publication/:id",
  RouteProtection.verify,
  publicationToggle
);
router.get("/eics/get-members", RouteProtection.verify, getMembers);
router.get("/eics/get-articles", RouteProtection.verify, getArticles);
router.patch("/eics/patch-member/:id", RouteProtection.verify, patchMember);
router.get("/eics/get-all-issues", RouteProtection.verify, eicsAllIssues);
router.post("/eics/new-member", RouteProtection.verify, newMember);

// member
router.get("/member", getAllMembers);
router.get("/member/:id", getMember);

// reader
router.get("/reader/article/:id", getArticle);
router.get("/reader/article", getAllArticle);
router.get("/reader/issue", getAllIssues);
router.get("/reader/issue/:id", getIssue);
router.patch("/reader/viewPdf/:issueNo", viewPdf);
router.get("/reader/homepage", getHomePageData);
router.get("/reader/latest-issue", redirectLatestIssue);

router.get("/reader/musical-seat", redirectMusical);

export default router;

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
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleDocsToMarkdown = exports.fetchGoogleDocsFiles = void 0;
const googleapis_1 = require("googleapis");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
console.info("Connecting to Google APIs");
let acct_exp = 0;
const oauth2Client = new googleapis_1.google.auth.OAuth2(process.env.GOOGLE_DOCS_CLIENT_ID, process.env.GOOGLE_DOCS_CLIENT_SECRET, "https://developers.google.com/oauthplayground");
oauth2Client.setCredentials({
    access_token: process.env.GOOGLE_DOCS_ACCESS,
    refresh_token: process.env.GOOGLE_DOCS_REFRESH,
});
oauth2Client.refreshAccessToken((e, d) => {
    if (e)
        throw new Error("Something went wrong refreshing token");
    acct_exp = d.expiry_date;
});
const docs = googleapis_1.google.docs("v1");
console.info("Successfully Connected to google docs");
const fetchGoogleDocsFiles = (documentId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("\nDownloading document", documentId);
    try {
        if (Date.now() >= acct_exp) {
            oauth2Client.refreshAccessToken((e, d) => {
                if (e)
                    throw new Error("Something went wrong refreshing token");
                acct_exp = d.expiry_date;
            });
        }
        const result = yield docs.documents.get({
            documentId: documentId.split(":")[0],
            auth: oauth2Client,
        });
        const title = documentId.includes(":")
            ? documentId.split(":")[1]
            : `${result.data.title}.md`;
        if (!title)
            throw new Error("Title not found");
        console.log("Downloaded document", result.data.title);
        return (0, exports.googleDocsToMarkdown)(result.data);
    }
    catch (error) {
        console.log("Got an error", error);
    }
});
exports.fetchGoogleDocsFiles = fetchGoogleDocsFiles;
const googleDocsToMarkdown = (file) => {
    var _a, _b;
    let text = ``;
    (_b = (_a = file.body) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.forEach((item) => {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        /**
         * Tables
         */
        if ((_a = item.table) === null || _a === void 0 ? void 0 : _a.tableRows) {
            // Make a blank header
            const cells = (_b = item.table.tableRows[0]) === null || _b === void 0 ? void 0 : _b.tableCells;
            // Make a blank header
            text += `|${cells === null || cells === void 0 ? void 0 : cells.map(() => "").join("|")}|\n|${cells === null || cells === void 0 ? void 0 : cells.map(() => "-").join("|")}|\n`;
            item.table.tableRows.forEach(({ tableCells }) => {
                const textRows = [];
                tableCells === null || tableCells === void 0 ? void 0 : tableCells.forEach(({ content }) => {
                    content === null || content === void 0 ? void 0 : content.forEach(({ paragraph }) => {
                        var _a, _b;
                        const styleType = ((_a = paragraph === null || paragraph === void 0 ? void 0 : paragraph.paragraphStyle) === null || _a === void 0 ? void 0 : _a.namedStyleType) || undefined;
                        textRows.push((_b = paragraph === null || paragraph === void 0 ? void 0 : paragraph.elements) === null || _b === void 0 ? void 0 : _b.map((element) => { var _a; return (_a = styleElement(element, styleType)) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, "").trim(); }));
                    });
                });
                text += `| ${textRows.join(" | ")} |\n`;
            });
        }
        /**
         * Paragraphs and lists
         */
        if (item.paragraph && item.paragraph.elements) {
            const styleType = ((_d = (_c = item === null || item === void 0 ? void 0 : item.paragraph) === null || _c === void 0 ? void 0 : _c.paragraphStyle) === null || _d === void 0 ? void 0 : _d.namedStyleType) || undefined;
            const bullet = (_e = item.paragraph) === null || _e === void 0 ? void 0 : _e.bullet;
            if (bullet === null || bullet === void 0 ? void 0 : bullet.listId) {
                const listDetails = (_f = file.lists) === null || _f === void 0 ? void 0 : _f[bullet.listId];
                const glyphFormat = ((_h = (_g = listDetails === null || listDetails === void 0 ? void 0 : listDetails.listProperties) === null || _g === void 0 ? void 0 : _g.nestingLevels) === null || _h === void 0 ? void 0 : _h[0].glyphFormat) || "";
                const padding = "  ".repeat(bullet.nestingLevel || 0);
                if (["[%0]", "%0."].includes(glyphFormat)) {
                    text += `${padding}1. `;
                }
                else {
                    text += `${padding}- `;
                }
            }
            item.paragraph.elements.forEach((element) => {
                if (element.textRun && content(element) && content(element) !== "\n") {
                    text += styleElement(element, styleType);
                }
            });
            text += (bullet === null || bullet === void 0 ? void 0 : bullet.listId)
                ? (text.split("\n").pop() || "").trim().endsWith("\n")
                    ? ""
                    : "\n"
                : "\n\n";
        }
    });
    const lines = text.split("\n");
    const linesToDelete = [];
    lines.forEach((line, index) => {
        if (index > 2) {
            if (!line.trim() &&
                ((lines[index - 1] || "").trim().startsWith("1. ") ||
                    (lines[index - 1] || "").trim().startsWith("- ")) &&
                ((lines[index + 1] || "").trim().startsWith("1. ") ||
                    (lines[index + 1] || "").trim().startsWith("- ")))
                linesToDelete.push(index);
        }
    });
    text = text
        .split("\n")
        .filter((_, i) => !linesToDelete.includes(i))
        .join("\n");
    return text.replace(/\n\s*\n\s*\n/g, "\n\n") + "\n";
};
exports.googleDocsToMarkdown = googleDocsToMarkdown;
const styleElement = (element, styleType) => {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    if (styleType === "TITLE") {
        return `# ${content(element)}`;
    }
    else if (styleType === "SUBTITLE") {
        return `_${(content(element) || "").trim()}_`;
    }
    else if (styleType === "HEADING_1") {
        return `## ${content(element)}`;
    }
    else if (styleType === "HEADING_2") {
        return `### ${content(element)}`;
    }
    else if (styleType === "HEADING_3") {
        return `#### ${content(element)}`;
    }
    else if (styleType === "HEADING_4") {
        return `##### ${content(element)}`;
    }
    else if (styleType === "HEADING_5") {
        return `###### ${content(element)}`;
    }
    else if (styleType === "HEADING_6") {
        return `####### ${content(element)}`;
    }
    else if (((_b = (_a = element.textRun) === null || _a === void 0 ? void 0 : _a.textStyle) === null || _b === void 0 ? void 0 : _b.bold) &&
        ((_d = (_c = element.textRun) === null || _c === void 0 ? void 0 : _c.textStyle) === null || _d === void 0 ? void 0 : _d.italic)) {
        return `**_${content(element)}_**`;
    }
    else if ((_f = (_e = element.textRun) === null || _e === void 0 ? void 0 : _e.textStyle) === null || _f === void 0 ? void 0 : _f.italic) {
        return `_${content(element)}_`;
    }
    else if ((_h = (_g = element.textRun) === null || _g === void 0 ? void 0 : _g.textStyle) === null || _h === void 0 ? void 0 : _h.bold) {
        return `**${content(element)}**`;
    }
    return content(element);
};
const content = (element) => {
    var _a, _b;
    const textRun = element === null || element === void 0 ? void 0 : element.textRun;
    const text = textRun === null || textRun === void 0 ? void 0 : textRun.content;
    if ((_b = (_a = textRun === null || textRun === void 0 ? void 0 : textRun.textStyle) === null || _a === void 0 ? void 0 : _a.link) === null || _b === void 0 ? void 0 : _b.url)
        return `[${text}]${textRun.textStyle.link.url}`;
    return text || undefined;
};

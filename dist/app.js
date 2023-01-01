"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const http = require("http");
const port = 8001;
const server = http.createServer(app);
const routes_1 = __importDefault(require("./routes/routes"));
const cors = require("cors");
const path = require("path");
const multer_1 = __importStar(require("multer"));
const errors_1 = require("./controllers/errors");
app.use(cors());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use("/images", express_1.default.static(path.join("images")));
const upload = (0, multer_1.default)({ storage: (0, multer_1.memoryStorage)() });
app.use(upload.single("image"));
app.use("/api", routes_1.default);
// Error Handling
app.use("/", errors_1.notFound404);
app.use(errors_1.centralError);
server.listen(port, () => {
    console.log(`Service listening on port ${port}`);
});

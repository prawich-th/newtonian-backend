"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.centralError = exports.notFound404 = void 0;
const deleteFile_1 = __importDefault(require("../helpers/deleteFile"));
const notFound404 = (req, res, next) => {
    res.status(404).json({
        message: "Alternate APIs can't find service you have requested.",
        requestedService: req.path,
    });
};
exports.notFound404 = notFound404;
const centralError = (err, req, res, next) => {
    const code = err.statusCode || 500;
    console.log(`${err.statusCode} - ${err.message}`);
    if (req.file)
        (0, deleteFile_1.default)(req.file.path);
    res.status(code).json({
        type: err.type || "general",
        modal: err.modal,
        location: err.location,
        message: err.message,
    });
};
exports.centralError = centralError;

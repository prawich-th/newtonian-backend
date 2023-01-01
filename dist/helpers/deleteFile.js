"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
exports.default = (filePath) => {
    if (filePath.split("/").includes("default.png"))
        return;
    fs_1.default.stat(filePath, (err, stat) => {
        if (!err) {
            fs_1.default.unlink(filePath, (err) => {
                if (err) {
                    throw err;
                }
            });
            return 0;
        }
        else if (err.code === "ENOENT") {
            return 0;
        }
        else {
            return err;
        }
    });
};

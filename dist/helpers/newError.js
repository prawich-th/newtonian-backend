"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let modalType = ["validation", "user", "important", "general"];
const newError = (code, msg, type, validationLocation) => {
    if (!msg.endsWith("." || "!" || "?")) {
        msg = `${msg}.`;
    }
    const error = new Error(msg);
    error.statusCode = code;
    error.type = type || "general";
    error.location = validationLocation;
    if (modalType.includes(error.type))
        error.modal = true;
    throw error;
};
exports.default = newError;

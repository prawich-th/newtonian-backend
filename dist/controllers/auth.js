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
exports.getUser = exports.signin = void 0;
const bcrypt_1 = require("bcrypt");
const jsonwebtoken_1 = require("jsonwebtoken");
const newError_1 = __importDefault(require("../helpers/newError"));
const db_1 = require("../models/db");
const signin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const name = req.body.username;
        const nickName = req.body.nickName;
        const password = req.body.password;
        const user = yield db_1.prisma.members.findFirst({
            where: {
                name: name,
                nickname: nickName,
            },
            select: {
                id: true,
                name: true,
                nickname: true,
                password: true,
                permission: true,
            },
        });
        if (!user)
            throw (0, newError_1.default)(404, "user not found");
        if (user.permission <= 1 || !user.password)
            throw (0, newError_1.default)(401, "No Permission");
        const isCorrectPassword = yield (0, bcrypt_1.compare)(req.body.password, user.password);
        if (isCorrectPassword) {
            const token = (0, jsonwebtoken_1.sign)({ id: user.id }, process.env.TOKEN_SECRET);
            res.status(200).json({ token: token });
        }
        else {
            res.status(401).json({ message: "incorrect password" });
        }
    }
    catch (error) {
        next(error);
    }
});
exports.signin = signin;
const getUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return res.json(req.user);
    }
    catch (error) {
        next(error);
    }
});
exports.getUser = getUser;
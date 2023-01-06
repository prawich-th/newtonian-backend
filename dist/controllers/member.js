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
exports.getMember = exports.getAllMembers = void 0;
const db_1 = require("../models/db");
const getAllMembers = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const members = yield db_1.prisma.members.findMany({
            select: {
                name: true,
                nickname: true,
                year: true,
                track: true,
                status: true,
                id: true,
                role: true,
                profile: true,
                permission: true,
            },
            orderBy: {
                permission: "desc",
            },
        });
        return res.json(members);
    }
    catch (error) {
        next(error);
    }
});
exports.getAllMembers = getAllMembers;
const getMember = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const memberId = (_a = req.params.id) !== null && _a !== void 0 ? _a : 1;
        const member = yield db_1.prisma.members.findFirst({
            where: { id: +memberId },
            select: {
                articles: {
                    where: { published: true },
                    include: {
                        member: { select: { id: true, name: true, nickname: true } },
                    },
                },
                name: true,
                id: true,
                nickname: true,
                year: true,
                track: true,
                status: true,
                profile: true,
                signature: true,
                bio: true,
                permission: true,
                role: true,
            },
        });
        res.json(member);
        // fetch member
    }
    catch (error) {
        next(error);
    }
});
exports.getMember = getMember;

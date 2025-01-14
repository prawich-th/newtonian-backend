import { RequestHandler } from "express";
import { prisma } from "../models/db";

const jwt = require("jsonwebtoken");
const { Eics } = require("../models/db");

const verify: RequestHandler = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ").pop();
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    req.user = await prisma.members.findFirstOrThrow({
      where: { id: decoded.userId },
    });

    return next();
  } catch (error) {
    next(error);
  }
};

const getUserFromToken = async (token: string) => {
  const decoded = jwt.verify(token?.split(" ").pop(), process.env.TOKEN_SECRET);

  return await prisma.members.findFirstOrThrow({
    where: { id: decoded.userId },
  });
};
export default { verify, getUserFromToken };

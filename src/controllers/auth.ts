import { compare } from "bcrypt";
import { RequestHandler } from "express";
import { sign } from "jsonwebtoken";
import newError from "../helpers/newError";
import { prisma } from "../models/db";

export const signin: RequestHandler = async (req, res, next) => {
  try {
    const name = req.body.username;
    const nickName = req.body.nickName;
    const password = req.body.password;

    const user = await prisma.members.findFirst({
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

    if (!user) throw newError(404, "user not found");
    if (user.permission <= 1 || !user.password)
      throw newError(401, "No Permission");

    const isCorrectPassword = await compare(req.body.password, user.password);

    if (isCorrectPassword) {
      const token = sign({ id: user.id }, process.env.TOKEN_SECRET!);
      res.status(200).json({ token: token });
    } else {
      res.status(401).json({ message: "incorrect password" });
    }
  } catch (error) {
    next(error);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  try {
    return res.json(req.user);
  } catch (error) {
    next(error);
  }
};

import { compare, hash } from "bcrypt";
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

    const isCorrectPassword = await compare(password, user.password);

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

export const ChangePassword: RequestHandler = async (req, res, next) => {
  try {
    const superUserEditPassword = req.user.permission >= 4;

    if (!req.body.newPassword)
      throw newError(400, "Bad Request, New Password Required");

    if (req.user.id === +req.params.id && !superUserEditPassword)
      throw newError(
        403,
        "Forbidden, Insufficient permission to edit other user's password"
      );

    if (superUserEditPassword) {
      const newPassword = await hash(req.body.newPassword, 12);
      const edited = await prisma.members.update({
        where: {
          id: +req.params.id,
        },
        data: {
          password: newPassword,
        },
      });

      return res.status(200).json({
        message: "Successfully change the password (as a super user)",
        affectedUser: `${edited.name} (${edited.nickname}) - Y${edited.year} / ${edited.track}`,
      });
    }

    const isCorrectPassword = await compare(
      req.body.oldPassword,
      req.user.password
    );
    if (!isCorrectPassword) throw newError(403, "Incorrect old password");
    const newPassword = await hash(req.body.newPassword, 12);

    await prisma.members.update({
      where: {
        id: req.user.id,
      },
      data: {
        password: newPassword,
      },
    });

    return res.status(200).json("Successfully changed the password");
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

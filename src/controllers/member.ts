import { RequestHandler } from "express";
import { prisma } from "../models/db";

export const getAllMembers: RequestHandler = async (req, res, next) => {
  try {
    const members = await prisma.members.findMany({
      select: {
        name: true,
        nickname: true,
        year: true,
        track: true,
        status: true,
        profile: true,
        permission: true,
      },
      orderBy: {
        permission: "desc",
      },
    });

    return res.json(members);
  } catch (error) {
    next(error);
  }
};

export const getMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = req.params.id ?? 1;

    const member = await prisma.members.findFirst({
      where: { id: +memberId },
      select: {
        articles: { where: { published: true } },
        name: true,
        nickname: true,
        year: true,
        track: true,
        status: true,
        profile: true,
        signature: true,
        bio: true,
        permission: true,
      },
    });

    res.json(member);

    // fetch member
  } catch (error) {
    next(error);
  }
};

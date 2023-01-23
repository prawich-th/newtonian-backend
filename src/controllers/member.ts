import { RequestHandler } from "express";
import { prisma } from "../models/db";

export const getAllMembers: RequestHandler = async (req, res, next) => {
  try {
    const members = await prisma.members.findMany({
      where: {
        status: { not: "ANON" },
      },
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
  } catch (error) {
    next(error);
  }
};

export const getMember: RequestHandler = async (req, res, next) => {
  try {
    const memberId = req.params.id ?? 1;

    const member = await prisma.members.findFirst({
      where: { id: +memberId, status: { not: "ANON" } },
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
  } catch (error) {
    next(error);
  }
};

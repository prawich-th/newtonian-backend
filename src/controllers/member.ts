import { RequestHandler } from "express";
import { prisma } from "../models/db";

export const getAllMembers: RequestHandler = async (req, res, next) => {
  try {
    const members = await prisma.members.findMany();

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
      include: { articles: { where: { published: true } } },
    });

    res.json(member);

    // fetch member
  } catch (error) {
    next(error);
  }
};
